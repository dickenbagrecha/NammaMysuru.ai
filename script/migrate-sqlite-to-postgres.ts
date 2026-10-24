import Database from "better-sqlite3";
import pg from "pg";
import path from "path";
import fs from "fs";

/**
 * Migration Script: SQLite -> Neon PostgreSQL
 *
 * SAFETY GUARANTEES:
 * 1. Default Mode: DRY-RUN (no database writes, inserts, or DDL).
 * 2. SQLite Source: Opened with `{ readonly: true, fileMustExist: true }`. Zero writes to SQLite.
 * 3. Execution Protection: Requires explicit `--execute` flag.
 * 4. Dual Confirmation: Requires both `--confirm-target-db=<dbname>` AND `--confirm-target-host=<host>`
 *    matching the verified target server before any write operation can begin.
 * 5. Strict Non-Empty Target Table Refusal:
 *    Refuses to proceed if ANY target table already contains records.
 *    No option to overwrite, drop, or truncate non-empty target tables is provided.
 * 6. Transactional Integrity: All writes are enclosed in `BEGIN ... COMMIT` with automatic `ROLLBACK` on error.
 * 7. Type & ID Preservation:
 *    - Real booleans for isVegetarian, isVeganFriendly, isJainFriendly.
 *    - Strict preservation of NULL vs false for isVeganFriendly and isJainFriendly.
 *    - Preserves exact primary keys: tourist_spots (1-50), restaurants (100-132), conversations, messages.
 *    - Converts SQLite unix-seconds to accurate PostgreSQL timestamptz instants (multiply by 1000).
 *    - Resets PostgreSQL identity sequences (`setval`) after copying explicit IDs.
 * 8. Secret & Privacy Protection:
 *    Never prints connection strings, database passwords, or user message contents to logs.
 */

const { Pool } = pg;

interface MigrationOptions {
  isDryRun: boolean;
  sqlitePath: string;
  confirmedTargetDb: string | null;
  confirmedTargetHost: string | null;
}

function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");

  const confirmDbMatch = args.find((a) => a.startsWith("--confirm-target-db="));
  const confirmedTargetDb = confirmDbMatch ? confirmDbMatch.split("=")[1].trim() : null;

  const confirmHostMatch = args.find((a) => a.startsWith("--confirm-target-host="));
  const confirmedTargetHost = confirmHostMatch ? confirmHostMatch.split("=")[1].trim() : null;

  const sqlitePathMatch = args.find((a) => a.startsWith("--sqlite-path="));
  const sqlitePath = sqlitePathMatch
    ? sqlitePathMatch.split("=")[1].trim()
    : path.resolve(process.cwd(), "sqlite.db");

  return {
    isDryRun: !isExecute,
    sqlitePath,
    confirmedTargetDb,
    confirmedTargetHost,
  };
}

function mapBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  return Boolean(value);
}

function mapUnixToDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    // Unix epoch seconds from SQLite unixepoch()
    const ms = value > 1e11 ? value : value * 1000;
    return new Date(ms);
  }
  if (typeof value === "string") {
    const num = Number(value);
    if (!Number.isNaN(num)) {
      const ms = num > 1e11 ? num : num * 1000;
      return new Date(ms);
    }
    return new Date(value);
  }
  return null;
}

async function main() {
  const options = parseArgs();

  console.log("=================================================");
  console.log(" NammaMysuru.ai SQLite -> PostgreSQL Migration ");
  console.log("=================================================");
  console.log(`Mode: ${options.isDryRun ? "DRY-RUN (Safe Read-Only Inspection)" : "LIVE EXECUTE"}`);
  console.log(`SQLite Source: ${options.sqlitePath}`);

  if (!fs.existsSync(options.sqlitePath)) {
    console.error(`ERROR: SQLite file not found at ${options.sqlitePath}`);
    process.exit(1);
  }

  // 1. Open SQLite strictly in read-only mode
  const sqlite = new Database(options.sqlitePath, { readonly: true, fileMustExist: true });

  // 2. Setup PostgreSQL connection pool
  // Prefer direct URL for migration/DDL operations, fall back to standard URL
  const connectionString = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("ERROR: DATABASE_URL_DIRECT or DATABASE_URL environment variable is missing.");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    max: 2,
    connectionTimeoutMillis: 10000,
    ssl: connectionString.includes("neon.tech") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const client = await pool.connect();

  try {
    // Inspect verified server target (without logging passwords or credentials)
    const serverInfoRes = await client.query(`
      SELECT 
        current_database() AS database, 
        current_user AS role, 
        inet_server_addr() AS server_ip;
    `);
    const targetDbName: string = serverInfoRes.rows[0].database;
    const targetRole: string = serverInfoRes.rows[0].role;

    // Extract host from connection string safely without printing secrets
    let targetHost = "";
    try {
      const parsedUrl = new URL(connectionString);
      targetHost = parsedUrl.hostname;
    } catch {
      targetHost = "unknown";
    }

    console.log(`Target PostgreSQL Endpoint: host=${targetHost}, database=${targetDbName}, user=${targetRole}`);

    // Check Safety Confirmation Gates for LIVE EXECUTE
    if (!options.isDryRun) {
      const dbMatches = options.confirmedTargetDb === targetDbName;
      const hostMatches = options.confirmedTargetHost === targetHost;

      if (!dbMatches || !hostMatches) {
        console.error("\n[ABORTED]: Live migration requires explicit target database and host confirmation flags.");
        console.error(`Required flags:`);
        console.error(`  --confirm-target-db=${targetDbName}`);
        console.error(`  --confirm-target-host=${targetHost}\n`);
        process.exit(1);
      }
    }

    // 3. Inspect source data in SQLite (read-only)
    const touristSpots = sqlite.prepare("SELECT * FROM tourist_spots ORDER BY id ASC").all() as any[];
    const restaurants = sqlite.prepare("SELECT * FROM restaurants ORDER BY id ASC").all() as any[];
    const conversations = sqlite.prepare("SELECT * FROM conversations ORDER BY id ASC").all() as any[];
    const messages = sqlite.prepare("SELECT * FROM messages ORDER BY id ASC").all() as any[];

    console.log("\n--- Source SQLite Record Counts ---");
    console.log(`  tourist_spots: ${touristSpots.length} (IDs: ${touristSpots[0]?.id} to ${touristSpots[touristSpots.length - 1]?.id})`);
    console.log(`  restaurants:   ${restaurants.length} (IDs: ${restaurants[0]?.id} to ${restaurants[restaurants.length - 1]?.id})`);
    console.log(`  conversations: ${conversations.length}`);
    console.log(`  messages:      ${messages.length}`);

    // 4. Verify target table existence and row counts in PostgreSQL
    console.log("\n--- Target PostgreSQL Status Check ---");
    const tables = ["tourist_spots", "restaurants", "conversations", "messages"];
    const targetCounts: Record<string, number> = {};

    for (const table of tables) {
      const tableExistsRes = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = $1
        );
      `, [table]);

      const exists = tableExistsRes.rows[0].exists;
      if (!exists) {
        console.log(`  Table "${table}": NOT FOUND (Schema must be created first before migrating data)`);
        targetCounts[table] = -1;
      } else {
        const countRes = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}";`);
        const count: number = countRes.rows[0].count;
        targetCounts[table] = count;
        console.log(`  Table "${table}": EXISTS (${count} existing rows)`);
      }
    }

    // Strict non-empty target guard: Refuse ANY non-empty table
    const hasExistingData = Object.values(targetCounts).some((c) => c > 0);
    if (hasExistingData) {
      if (!options.isDryRun) {
        console.error("\n[SAFETY REFUSAL]: Target PostgreSQL database contains existing records.");
        console.error("Migration strictly refuses to execute against a non-empty target.");
        console.error("Target database must be completely empty before data copy.\n");
        process.exit(1);
      } else {
        console.log("\n[DRY RUN NOTE]: Target tables contain existing records. Live execution will be refused.");
      }
    }

    const missingTables = Object.entries(targetCounts).filter(([_, c]) => c === -1).map(([t]) => t);
    if (missingTables.length > 0) {
      if (!options.isDryRun) {
        console.error(`\n[ABORTED]: Target tables missing in PostgreSQL: ${missingTables.join(", ")}`);
        console.error("Push the PostgreSQL schema first before running data migration.\n");
        process.exit(1);
      } else {
        console.log(`\n[DRY RUN NOTE]: Target tables not yet created: ${missingTables.join(", ")}`);
      }
    }

    if (options.isDryRun) {
      console.log("\n[DRY RUN SUMMARY]:");
      console.log("  - Read-only source checks completed successfully.");
      console.log("  - Target connection verified without exposing credentials.");
      console.log("  - Transformation sanity preview (no sensitive message content logged):");
      if (restaurants[0]) {
        console.log("    Sample restaurant transformation:", {
          id: restaurants[0].id,
          name: restaurants[0].name,
          isVegetarian: mapBoolean(restaurants[0].is_vegetarian),
          isVeganFriendly: mapBoolean(restaurants[0].is_vegan_friendly),
          isJainFriendly: mapBoolean(restaurants[0].is_jain_friendly),
          verifiedAt: restaurants[0].verified_at,
        });
      }
      if (conversations[0]) {
        console.log("    Sample conversation timestamp transformation:", {
          id: conversations[0].id,
          title: conversations[0].title,
          createdAtUtc: mapUnixToDate(conversations[0].created_at)?.toISOString(),
        });
      }
      if (messages[0]) {
        console.log("    Sample message metadata transformation (content omitted for privacy):", {
          id: messages[0].id,
          conversationId: messages[0].conversation_id,
          role: messages[0].role,
          createdAtUtc: mapUnixToDate(messages[0].created_at)?.toISOString(),
        });
      }
      console.log("\nDry-run complete. ZERO modifications made to SQLite or PostgreSQL.");
      return;
    }

    // 5. LIVE EXECUTION
    // (Only reached when --execute AND matching --confirm-target-db AND --confirm-target-host are present, and all target tables are completely empty)
    console.log("\nStarting Live Migration Transaction...");
    await client.query("BEGIN;");

    // A. Migrate tourist_spots
    console.log(`Inserting ${touristSpots.length} tourist spots...`);
    for (const spot of touristSpots) {
      await client.query(`
        INSERT INTO tourist_spots (id, name, description, location, image_url, visiting_hours, ticket_price)
        OVERRIDING SYSTEM VALUE
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `, [
        spot.id,
        spot.name,
        spot.description,
        spot.location,
        spot.image_url,
        spot.visiting_hours,
        spot.ticket_price,
      ]);
    }
    await client.query(`
      SELECT setval(pg_get_serial_sequence('tourist_spots', 'id'), COALESCE((SELECT MAX(id) FROM tourist_spots), 1), true);
    `);

    // B. Migrate restaurants
    console.log(`Inserting ${restaurants.length} restaurants...`);
    for (const r of restaurants) {
      await client.query(`
        INSERT INTO restaurants (
          id, name, cuisine, price_range, rating, is_vegetarian, location, image_url,
          dietary_classification, category, neighbourhood, is_vegan_friendly, is_jain_friendly,
          opening_hours, menu_url, description, source_url, verification_status, verified_at
        )
        OVERRIDING SYSTEM VALUE
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);
      `, [
        r.id,
        r.name,
        r.cuisine,
        r.price_range,
        r.rating ?? 0,
        mapBoolean(r.is_vegetarian),
        r.location,
        r.image_url,
        r.dietary_classification,
        r.category,
        r.neighbourhood,
        mapBoolean(r.is_vegan_friendly),
        mapBoolean(r.is_jain_friendly),
        r.opening_hours,
        r.menu_url,
        r.description,
        r.source_url,
        r.verification_status ?? "unverified",
        r.verified_at,
      ]);
    }
    await client.query(`
      SELECT setval(pg_get_serial_sequence('restaurants', 'id'), COALESCE((SELECT MAX(id) FROM restaurants), 100), true);
    `);

    // C. Migrate conversations
    console.log(`Inserting ${conversations.length} conversations...`);
    for (const c of conversations) {
      await client.query(`
        INSERT INTO conversations (id, title, created_at)
        OVERRIDING SYSTEM VALUE
        VALUES ($1, $2, $3);
      `, [c.id, c.title, mapUnixToDate(c.created_at)]);
    }
    await client.query(`
      SELECT setval(pg_get_serial_sequence('conversations', 'id'), COALESCE((SELECT MAX(id) FROM conversations), 1), true);
    `);

    // D. Migrate messages
    console.log(`Inserting ${messages.length} messages...`);
    for (const m of messages) {
      await client.query(`
        INSERT INTO messages (id, conversation_id, role, content, created_at)
        OVERRIDING SYSTEM VALUE
        VALUES ($1, $2, $3, $4, $5);
      `, [m.id, m.conversation_id, m.role, m.content, mapUnixToDate(m.created_at)]);
    }
    await client.query(`
      SELECT setval(pg_get_serial_sequence('messages', 'id'), COALESCE((SELECT MAX(id) FROM messages), 1), true);
    `);

    await client.query("COMMIT;");
    console.log("\n[SUCCESS]: Data migration completed and committed successfully!");
  } catch (err) {
    await client.query("ROLLBACK;");
    console.error("\n[MIGRATION FAILED - TRANSACTION ROLLED BACK]:", err);
    process.exit(1);
  } finally {
    client.release();
    sqlite.close();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
