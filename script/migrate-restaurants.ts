/**
 * Safe migration: add new filtering columns to the restaurants table.
 * Runs ALTER TABLE only if the column does not already exist.
 * All new columns are nullable with no default, so existing records are preserved.
 */
import Database from "better-sqlite3";

const db = new Database("sqlite.db");

function columnExists(table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

const newColumns: Array<{ name: string; type: string }> = [
  // 'pure_veg' | 'veg_and_non_veg' | 'non_veg' | 'unknown'
  { name: "dietary_classification", type: "TEXT" },
  // establishment category
  { name: "category", type: "TEXT" },
  // neighbourhood/area
  { name: "neighbourhood", type: "TEXT" },
  // verified vegan options available
  { name: "is_vegan_friendly", type: "INTEGER" },
  // verified Jain options available
  { name: "is_jain_friendly", type: "INTEGER" },
  // opening hours string e.g. "7:00 AM - 10:00 PM"
  { name: "opening_hours", type: "TEXT" },
  // link to official/verified menu
  { name: "menu_url", type: "TEXT" },
  // short description
  { name: "description", type: "TEXT" },
  // provenance fields
  { name: "source_url", type: "TEXT" },
  { name: "verification_status", type: "TEXT DEFAULT 'unverified'" },
  { name: "verified_at", type: "TEXT" },
];

let added = 0;
for (const col of newColumns) {
  if (!columnExists("restaurants", col.name)) {
    db.prepare(`ALTER TABLE restaurants ADD COLUMN ${col.name} ${col.type}`).run();
    console.log(`  ✅  Added column: ${col.name} (${col.type})`);
    added++;
  } else {
    console.log(`  ⏭  Column already exists: ${col.name}`);
  }
}

console.log(`\nMigration complete. ${added} column(s) added.`);

// Print final schema
const finalCols = db.prepare("PRAGMA table_info(restaurants)").all() as { name: string; type: string }[];
console.log("\nFinal restaurants schema:");
finalCols.forEach((c) => console.log(`  ${c.name} (${c.type})`));

db.close();
