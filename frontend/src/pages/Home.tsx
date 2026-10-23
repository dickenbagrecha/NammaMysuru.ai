import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedInterest, setSelectedInterest] = useState("palace");
  const [partySize, setPartySize] = useState("2");

  // Palace illumination countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: "02",
    hours: "06",
    minutes: "42",
    seconds: "18",
  });

  useEffect(() => {
    // Dynamic countdown clock to the upcoming Sunday 7:00 PM IST illumination
    const updateCountdown = () => {
      const now = new Date();
      // Target next Sunday 19:00:00 IST
      const target = new Date();
      const currentDay = now.getDay();
      const daysUntilSunday = (7 - currentDay) % 7;
      target.setDate(now.getDate() + (daysUntilSunday === 0 && now.getHours() >= 20 ? 7 : daysUntilSunday));
      target.setHours(19, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeLeft({
          days: String(d).padStart(2, "0"),
          hours: String(h).padStart(2, "0"),
          minutes: String(m).padStart(2, "0"),
          seconds: String(s).padStart(2, "0"),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDiscoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterest === "culinary") {
      setLocation("/restaurants");
    } else if (selectedInterest === "palace" || selectedInterest === "nature") {
      setLocation("/spots");
    } else {
      setLocation("/chat");
    }
  };

  const jewels = [
    {
      title: "Mysore Palace (Amba Vilas)",
      badge: "Must Visit #1",
      badgeColor: "bg-stitch-primary text-white",
      tag: "Indo-Saracenic",
      tagIcon: "stars",
      location: "Amba Vilas Royal Enclave",
      entry: "₹100 Entry",
      timing: "10:00 AM – 5:30 PM",
      description:
        "The magnum opus of the Wodeyars. Marvel at the 750kg pure Golden Howdah (Chinnada Ambari), the soaring Kalyana Mantapa stained glass dome, and ivory inlaid rosewood portals.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC_6NlF4BNf8751LcdGgNxa0yk-meoYWsmYcWwYrlFL48CnQ1oFRwmxh4wyqib7iEIdUCKYvweLPQxCEF3hNx1kc5yoJqRjjD-7y22Mr8snT98s7KehhOUXIuZJpxbqmWA4knwISFmr7WwR4QHsY96fzNyv8CZLt5hKT-N-V4ltaD5s52my73UOOETrmbppbwv2mszEQHpLAjIe8XGBiARwxOZJzcf04yjuTBE0Gex2xSPuqfviOoxB",
      link: "/spots",
      actionText: "Palace Details",
    },
    {
      title: "Chamundeshwari Temple & Betta",
      badge: "Spiritual & Scenic",
      badgeColor: "bg-stitch-tertiary text-white",
      tag: "1,008 Steps",
      tagIcon: "height",
      location: "Chamundi Hilltop Sanctuary",
      entry: "Free Darshan",
      timing: "7:30 AM – 9:00 PM",
      description:
        "Dedicated to Mysuru's presiding deity who vanquished the demon Mahishasura. Ascend the historic 1,008 granite steps, greet the colossal monolithic Nandi, and soak in 360° plateau vistas.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCjgr0OM9UmSY40Phi1_oAzA2zcmL7yZevzvwUrShgWA5T6FHp44vg908o_T_jBANaCnWdSIpnsVn44xbkA6r-xbN0gA1beczd8U42aszBscRamjThR0LGworF1jI7ptswaet7x1lEELUlQLTFi13fSOXO0bgplCvNQa9ibAOrGb2wxYQFwxzCoX9DZferVW8ccBvXMxXh5MSdqvQUdoAU-MQIYucl5U6VdkcOduBTngygWNldyTpL",
      link: "/spots",
      actionText: "Darshan Guide",
    },
    {
      title: "Devaraja Heritage Bazaar",
      badge: "130-Year Heritage",
      badgeColor: "bg-stitch-secondary text-white",
      tag: "Mysore Jasmine",
      tagIcon: "local_florist",
      location: "Sayyaji Rao Road",
      entry: "Free Walking",
      timing: "6:00 AM – 8:30 PM",
      description:
        "A multisensory carnival operating since 1886. Breathe in GI-tagged Mysore Mallige blossoms, discover hand-rolled pure sandalwood incense, and taste butter-rich Nanjangud bananas.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBn5ROWtX9TA6DYxmqDmSegAX7_DgA79oTY3PpTwYmS-dVOhwKMhNx7V5oF3a4lNzN-a4DIK2abLAP00vkbnWRrH1iRRDPLUq7erW_2ToVhKmD-3QHurWIhHQRRLqPTBiUPWXoQFGGf4aZWOaQp-8RPJNsWa-5CA5fWJcGBQZHLlkAs1duM90ESkeEU1BAZKMzHsXi3TePDLCqLwKt-5RlDQGUlBRljTYqUeqLKokogwTItE4U2shAa",
      link: "/spots",
      actionText: "Market Trail",
    },
    {
      title: "Brindavan Gardens & KRS Dam",
      badge: "Musical Fountains",
      badgeColor: "bg-stitch-primary-container text-white",
      tag: "KRS Reservoir",
      tagIcon: "water",
      location: "Cauvery Basin",
      entry: "₹50 Entry",
      timing: "Show: 6:30 PM – 8:00 PM",
      description:
        "Laid out across 60 lush terraced acres flanking Sir M. Visvesvaraya's engineering feat. The musical dancing fountains illuminate every twilight accompanied by classic harmonies.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDEenEszN-t7MLxn3q9DhTR5X0l6BmH0DC0veBqYFdx1_Mc9u32i00hY9syaps3RntXfBkNx6CtwwFmadFyJUa0q31FMB2cQDOUjc-un_pWMYSg8BEflPQj-C_nPsI49jDntBisoEmyBaVxcD1YRmHzMcCFndwvuY0sMnQE0ReoATQFW63_k3q1idD59w2GC85Qf-Br6HWWk746zxN6bofDueGV5IUQQh0p4zH3qG6HKFEXnM1t8RJn",
      link: "/spots",
      actionText: "Fountain Timings",
    },
    {
      title: "St. Philomena's Cathedral",
      badge: "Neo-Gothic Spire",
      badgeColor: "bg-stitch-inverse-surface text-stitch-inverse-on-surface",
      tag: "175 ft Spires",
      tagIcon: "church",
      location: "Ashoka Road",
      entry: "Free Entry",
      timing: "5:00 AM – 6:00 PM",
      description:
        "One of Asia's tallest cathedrals inspired by the Cologne Cathedral in Germany. Features dramatic 175-foot twin spires, radiant French stained-glass windows, and a revered subterranean crypt.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAYZsb4wcj9UJnRY6V_yjxcr2dsC-v2tLW2tmQET5miBLwkCrspcq49NyEmVUunjW13wxYM7ZD2h1bvTuBm7TdBxBkDiPgfpkhAy4rKp_n9BS3rfWq0AQ0iU4EQCXpMbENyoHVfjFHRBEn4l-IWRCt8wEjCG59cfsqItxteUhANbfv77Izs_atXsGgDxomEBEqZ6i_Yw8HIYYGvzZMzJsKq26JA9HdrypnhUgF0-IfadRr9jmljfFu6",
      link: "/spots",
      actionText: "Cathedral Guide",
    },
    {
      title: "Mysore Sandalwood & Silk Legacy",
      badge: "GI Authentic",
      badgeColor: "bg-stitch-tertiary-container text-white",
      tag: "Govt Factory",
      tagIcon: "spa",
      location: "Mananthavady Road",
      entry: "Guided Tour",
      timing: "9:30 AM – 5:00 PM",
      description:
        "Established by Maharaja Nalwadi Krishnaraja Wadiyar in 1916. Experience pure East Indian Sandalwood oil distillation and witness authentic zari gold border weaving at KSIC Silk Mills.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDa5zU322q_bV8jQ31oJ159g4W7PqF0lqJp4XhG01n87Rk8g2j0-81Xm-gC5f_496g49P2l2b0zP1h4962p1j",
      link: "/chat",
      actionText: "Artisan Pathways",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans selection:bg-stitch-primary-container selection:text-white">
      <Header />

      <main className="flex-grow pb-20 md:pb-0">
        {/* HERO SECTION WITH EXPANSIVE VISTA & CONSOLE */}
        <section className="relative w-full overflow-hidden bg-stitch-surface-container-highest">
          {/* Background Image Layer with Editorial Gradient Scrim */}
          <div
            className="absolute inset-0 bg-cover bg-center w-full h-full scale-105 transform motion-safe:transition-transform motion-safe:duration-1000"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuClUX2Llnp8quxfjy3i4EdW2dNhl54j256G3gfXvp-oTH3rsPjNYXK0pkCIrrxllReZeD2xQEe6UbT0FNz9BhsrNrWwD_MgEzD8NgqWK2IPDVCp8msf3-ADlgD8LD6XcE-5t7QvRG-Be40-4QAHnBhdoB7YyMj1kHe3lqNjS6Lk2rhOvGgx49uBC6k6Rzpfi8LW5QVWRauz53OUas13yEps0EenZHjIXzqnMz36KWyE25YvAaa7Ub9Y')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stitch-surface via-stitch-surface/65 to-stitch-primary/85 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-stitch-primary/75 via-transparent to-stitch-surface" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-28 pb-16 lg:pt-36 lg:pb-24 flex flex-col justify-between min-h-[840px]">
            {/* Royal Overline and Main Typography */}
            <div className="max-w-4xl space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stitch-surface/90 backdrop-blur-md shadow-sm border border-stitch-outline-variant/30"
              >
                <span className="w-2 h-2 rounded-full bg-stitch-primary animate-ping" />
                <span className="text-[11px] font-bold text-stitch-primary uppercase tracking-widest">
                  Heritage Capital of Karnataka
                </span>
                <span className="text-stitch-outline-variant text-xs">•</span>
                <span className="text-[11px] text-stitch-secondary font-semibold">
                  Est. 1399 CE
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stitch-on-surface leading-[1.1] drop-shadow-sm"
              >
                Step into Royalty: Experience the City of Palaces, Sandalwood &amp; Silk
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg lg:text-xl text-stitch-on-surface-variant max-w-2xl font-normal leading-relaxed"
              >
                Immerse yourself in centuries of Wodeyar heritage, illuminated grand palaces, aromatic incense bazaars, and timeless royal traditions.
              </motion.p>
            </div>

            {/* Quick Stats Row (Floating Brass Glass Pills) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-8">
              <div className="p-4 rounded-xl bg-stitch-surface/90 backdrop-blur-md shadow-md border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all">
                <div className="w-11 h-11 rounded-lg bg-stitch-primary-container text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">account_balance</span>
                </div>
                <div className="min-w-0">
                  <span className="font-serif text-lg font-bold text-stitch-primary block leading-tight">
                    7 Grand
                  </span>
                  <span className="text-xs text-stitch-on-surface-variant truncate block font-medium">
                    Royal Palaces
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stitch-surface/90 backdrop-blur-md shadow-md border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all">
                <div className="w-11 h-11 rounded-lg bg-stitch-secondary-container text-stitch-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">lightbulb</span>
                </div>
                <div className="min-w-0">
                  <span className="font-serif text-lg font-bold text-stitch-secondary block leading-tight">
                    100,000+
                  </span>
                  <span className="text-xs text-stitch-on-surface-variant truncate block font-medium">
                    Illumination Bulbs
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stitch-surface/90 backdrop-blur-md shadow-md border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all">
                <div className="w-11 h-11 rounded-lg bg-stitch-tertiary-container text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">festival</span>
                </div>
                <div className="min-w-0">
                  <span className="font-serif text-lg font-bold text-stitch-tertiary block leading-tight">
                    400+ Yrs
                  </span>
                  <span className="text-xs text-stitch-on-surface-variant truncate block font-medium">
                    Dasara Tradition
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-stitch-surface/90 backdrop-blur-md shadow-md border border-stitch-outline-variant/30 flex items-center gap-3.5 hover:bg-white transition-all">
                <div className="w-11 h-11 rounded-lg bg-stitch-surface-container-highest text-stitch-primary flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[24px]">landscape</span>
                </div>
                <div className="min-w-0">
                  <span className="font-serif text-lg font-bold text-stitch-primary block leading-tight">
                    1,008 Steps
                  </span>
                  <span className="text-xs text-stitch-on-surface-variant truncate block font-medium">
                    Chamundi Betta Hill
                  </span>
                </div>
              </div>
            </div>

            {/* Experience & Trip Filter Console */}
            <div className="w-full bg-stitch-surface-container-lowest/95 backdrop-blur-xl rounded-2xl p-5 lg:p-6 shadow-xl border border-stitch-outline-variant/40 relative">
              <form
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
                onSubmit={handleDiscoverySubmit}
              >
                {/* Date Selection */}
                <div className="md:col-span-3 space-y-1.5">
                  <label
                    htmlFor="visit-date"
                    className="text-[11px] uppercase tracking-wider text-stitch-secondary font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>Visit Date</span>
                  </label>
                  <div className="relative bg-stitch-surface-container-low rounded-lg p-2.5 flex items-center gap-2 border border-stitch-outline-variant/30">
                    <span className="material-symbols-outlined text-stitch-on-surface-variant text-[18px]">event</span>
                    <input
                      id="visit-date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="w-full bg-transparent text-sm text-stitch-on-surface font-semibold focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Interest Curation */}
                <div className="md:col-span-4 space-y-1.5">
                  <label
                    htmlFor="interest-select"
                    className="text-[11px] uppercase tracking-wider text-stitch-secondary font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">attractions</span>
                    <span>Primary Experience</span>
                  </label>
                  <div className="relative bg-stitch-surface-container-low rounded-lg p-2.5 flex items-center gap-2 border border-stitch-outline-variant/30">
                    <span className="material-symbols-outlined text-stitch-primary text-[18px]">castle</span>
                    <select
                      id="interest-select"
                      value={selectedInterest}
                      onChange={(e) => setSelectedInterest(e.target.value)}
                      className="w-full bg-transparent text-sm text-stitch-on-surface font-semibold focus:outline-none appearance-none cursor-pointer pr-6"
                    >
                      <option value="palace">Palace Tours &amp; Durbar Halls</option>
                      <option value="culinary">Culinary Trail &amp; Original Mysore Pak</option>
                      <option value="dasara">Dasara Grandeur &amp; Golden Howdah</option>
                      <option value="artisans">Sandalwood Distilleries &amp; Silk Weaves</option>
                      <option value="nature">Nature, Karanji Lake &amp; Chamundi Hills</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 text-stitch-on-surface-variant pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Party Size */}
                <div className="md:col-span-2 space-y-1.5">
                  <label
                    htmlFor="party-size"
                    className="text-[11px] uppercase tracking-wider text-stitch-secondary font-bold flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    <span>Travelers</span>
                  </label>
                  <div className="relative bg-stitch-surface-container-low rounded-lg p-2.5 flex items-center gap-2 border border-stitch-outline-variant/30">
                    <span className="material-symbols-outlined text-stitch-on-surface-variant text-[18px]">person</span>
                    <select
                      id="party-size"
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      className="w-full bg-transparent text-sm text-stitch-on-surface font-semibold focus:outline-none appearance-none cursor-pointer pr-4"
                    >
                      <option value="2">2 Adults</option>
                      <option value="1">Solo Pilgrim</option>
                      <option value="family">Family (4-6)</option>
                      <option value="group">Royal Tour (8+)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 text-stitch-on-surface-variant pointer-events-none text-[18px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-lg bg-stitch-primary-container text-stitch-on-primary text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-stitch-primary transition-all active:scale-[0.98] group"
                  >
                    <span>Discover Mysuru</span>
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                      explore
                    </span>
                  </button>
                </div>
              </form>

              {/* Quick Filter Suggested Tags */}
              <div className="mt-4 pt-3 border-t border-stitch-outline-variant/20 flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-stitch-on-surface-variant uppercase tracking-wider font-bold">
                  Suggested Trails:
                </span>
                <Link
                  href="/spots"
                  className="px-2.5 py-1 rounded-full bg-stitch-surface-container text-xs text-stitch-on-surface hover:bg-stitch-primary hover:text-white transition-colors"
                >
                  ✨ Evening Illumination Special
                </Link>
                <Link
                  href="/restaurants"
                  className="px-2.5 py-1 rounded-full bg-stitch-surface-container text-xs text-stitch-on-surface hover:bg-stitch-primary hover:text-white transition-colors"
                >
                  ☕ Mylari Butter Dosa &amp; Mysore Pak
                </Link>
                <Link
                  href="/chat"
                  className="px-2.5 py-1 rounded-full bg-stitch-surface-container text-xs text-stitch-on-surface hover:bg-stitch-primary hover:text-white transition-colors"
                >
                  🥻 KSIC Pure Crepe Silk Looms
                </Link>
                <Link
                  href="/spots"
                  className="px-2.5 py-1 rounded-full bg-stitch-surface-container text-xs text-stitch-on-surface hover:bg-stitch-primary hover:text-white transition-colors"
                >
                  🌿 1008 Steps Chamundi Ascent
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE PULSE & EVENT TRACKER BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 -mt-6 z-10 w-full mb-16 relative">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-stitch-outline-variant/30">
            {/* Countdown Widget: Palace Illumination */}
            <div className="lg:col-span-5 p-6 bg-stitch-inverse-surface text-stitch-inverse-on-surface flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-stitch-primary/20 blur-2xl pointer-events-none" />
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-stitch-secondary-fixed animate-ping" />
                  <span className="text-[10px] uppercase tracking-wider text-stitch-secondary-fixed font-bold">
                    Official Illumination Protocol
                  </span>
                </div>
                <h2 className="font-serif text-xl font-bold text-stitch-inverse-on-surface">
                  Amba Vilas Grand Illumination
                </h2>
                <p className="text-xs text-stitch-inverse-on-surface/80 leading-relaxed">
                  Witness 100,000 bulbs flood the royal perimeter. Every Sunday &amp; Government Holidays (7:00 PM – 8:00 PM IST).
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                <div className="text-[10px] uppercase tracking-widest text-stitch-secondary-fixed font-bold mb-2">
                  Next Illumination Commences In
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                    <span className="font-serif text-xl text-stitch-secondary-fixed font-bold block">
                      {timeLeft.days}
                    </span>
                    <span className="text-[10px] uppercase text-white/70 font-medium">Days</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                    <span className="font-serif text-xl text-stitch-secondary-fixed font-bold block">
                      {timeLeft.hours}
                    </span>
                    <span className="text-[10px] uppercase text-white/70 font-medium">Hours</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                    <span className="font-serif text-xl text-stitch-secondary-fixed font-bold block">
                      {timeLeft.minutes}
                    </span>
                    <span className="text-[10px] uppercase text-white/70 font-medium">Mins</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                    <span className="font-serif text-xl text-stitch-secondary-fixed font-bold block">
                      {timeLeft.seconds}
                    </span>
                    <span className="text-[10px] uppercase text-white/70 font-medium">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Micro-Climate & Hills Atmosphere */}
            <div className="lg:col-span-3 p-6 bg-stitch-surface-container-low flex flex-col justify-between border-t lg:border-t-0 lg:border-r border-stitch-outline-variant/30">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stitch-on-surface-variant uppercase tracking-wider font-bold">
                    Mysuru Weather
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed font-bold">
                    Pleasant
                  </span>
                </div>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="font-serif text-3xl font-bold text-stitch-primary">26°C</span>
                  <span className="text-xs text-stitch-on-surface-variant font-medium">Feels like 25°</span>
                </div>
                <p className="text-xs text-stitch-on-surface-variant pt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-stitch-tertiary">air</span>
                  Fresh breeze from Chamundi Hills (12 km/h NE)
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stitch-outline-variant/20 flex items-center justify-between text-stitch-on-surface-variant text-xs">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-stitch-secondary">wb_sunny</span>
                  <span>Sunset: 6:18 PM</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-stitch-primary">humidity_percentage</span>
                  <span>AQI: 42 (Pristine)</span>
                </div>
              </div>
            </div>

            {/* Today's Sacred Darshan & Palace Gates Timings */}
            <div className="lg:col-span-4 p-6 bg-stitch-surface-container flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-stitch-secondary uppercase tracking-wider font-bold">
                    Live Darshan &amp; Gate Entry
                  </span>
                  <span className="material-symbols-outlined text-stitch-primary text-[20px]">
                    access_time_filled
                  </span>
                </div>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-stitch-outline-variant/20">
                    <span className="text-stitch-on-surface font-semibold">Chamundeshwari Darshan</span>
                    <span className="text-[10px] text-stitch-tertiary font-bold px-2 py-0.5 rounded bg-stitch-tertiary-fixed">
                      Open till 9:00 PM
                    </span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-stitch-outline-variant/20">
                    <span className="text-stitch-on-surface font-semibold">Palace Museum Gates</span>
                    <span className="text-[10px] text-stitch-on-surface-variant font-medium">
                      10:00 AM – 5:30 PM
                    </span>
                  </li>
                  <li className="flex items-center justify-between p-2 rounded-lg bg-white border border-stitch-outline-variant/20">
                    <span className="text-stitch-on-surface font-semibold">Sound &amp; Light Show</span>
                    <span className="text-[10px] text-stitch-primary font-bold">
                      Today 7:00 PM (Kannada)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <Link
                  href="/chat"
                  className="text-xs text-stitch-primary font-bold hover:underline flex items-center gap-1"
                >
                  <span>Ask AI for Custom Itinerary</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SIX JEWELS OF THE ROYAL CITY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-stitch-secondary" />
                <span className="text-xs uppercase tracking-widest text-stitch-secondary font-bold">
                  Curated Heritage Canon
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stitch-on-surface">
                Six Jewels of the Royal City
              </h2>
            </div>
            <p className="text-sm text-stitch-on-surface-variant max-w-md">
              From world-renowned Indo-Saracenic stained glass cupolas to centuries-old fragrant jasmine lanes, each monument holds a chapter of Karnataka's golden reign.
            </p>
          </div>

          {/* 6 Rich Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jewels.map((jewel, i) => (
              <article
                key={i}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-stitch-outline-variant/30"
              >
                <div className="relative h-64 overflow-hidden rounded-t-[2.5rem]">
                  <img
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={jewel.image}
                    alt={jewel.title}
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${jewel.badgeColor}`}
                    >
                      {jewel.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-stitch-surface/90 backdrop-blur-md text-stitch-on-surface text-xs font-semibold flex items-center gap-1 shadow-sm border border-stitch-outline-variant/30">
                    <span className="material-symbols-outlined text-stitch-secondary text-[16px]">
                      {jewel.tagIcon}
                    </span>
                    <span>{jewel.tag}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-stitch-secondary text-xs font-bold uppercase tracking-wider">
                      <span>{jewel.location}</span>
                      <span>{jewel.entry}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-stitch-on-surface group-hover:text-stitch-primary transition-colors">
                      {jewel.title}
                    </h3>
                    <p className="text-xs text-stitch-on-surface-variant leading-relaxed">
                      {jewel.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stitch-outline-variant/20 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-stitch-on-surface-variant text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px] text-stitch-tertiary">
                        schedule
                      </span>
                      <span>{jewel.timing}</span>
                    </div>
                    <Link
                      href={jewel.link}
                      className="inline-flex items-center gap-1 text-xs text-stitch-primary font-bold group-hover:translate-x-1 transition-transform"
                    >
                      <span>{jewel.actionText}</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* AI CONCIERGE CALLOUT BANNER */}
        <section className="relative overflow-hidden bg-stitch-primary py-16 text-white my-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full bg-stitch-secondary-container text-stitch-on-secondary-container text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">psychology</span>
                Powered by Mysuru Royal Concierge
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                Have questions about Dasara, timings, or routes?
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Ask our conversational local guide in English, Kannada, or Hindi. Get personalized walking itineraries, live auto-fare guidelines, and authentic Mysore Pak recommendations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-stitch-secondary-fixed text-stitch-on-secondary-fixed px-6 py-3 font-bold text-sm shadow-lg hover:bg-white transition"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Start Royal Chat
              </Link>
              <Link
                href="/spots"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 font-semibold text-sm text-white backdrop-blur hover:bg-white/20 transition"
              >
                Browse All Places
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
