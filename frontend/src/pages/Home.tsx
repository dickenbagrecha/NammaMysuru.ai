import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowRight, Clock, Crown, MessageCircle, Map as MapIcon, Sparkles, Utensils } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const highlights = [
    { label: "40+ curated places", value: "Heritage, nature, temples" },
    { label: "Local dining picks", value: "Budget to palace dining" },
    { label: "Multilingual guide", value: "English, Kannada, Hindi" },
  ];

  return (
    <div className="royal-page min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section
          className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(28, 3, 10, 0.86), rgba(92, 12, 26, 0.56) 48%, rgba(22, 2, 9, 0.78)), url('/images/mysuru-palace-hero.svg')",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
          <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] items-center px-4 py-16">
            <div className="max-w-4xl space-y-7 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-white/15 px-4 py-2 text-sm font-semibold shadow-lg backdrop-blur">
                  <Crown className="h-4 w-4 text-secondary" />
                  Royal Mysuru concierge
                </span>
                <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight text-white drop-shadow md:text-7xl">
                  Experience Mysuru with royal local intelligence
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl">
                  Plan palace visits, silk-market walks, food stops, day trips, and emergency help with an AI guide shaped around the city of palaces.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col gap-3 pt-1 sm:flex-row"
              >
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3 font-semibold text-secondary-foreground shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-secondary/95"
                >
                  <MessageCircle className="w-5 h-5" />
                  Ask AI Guide
                </Link>
                <Link
                  href="/spots"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <MapIcon className="w-5 h-5" />
                  View Places
                </Link>
              </motion.div>

              <div className="grid gap-3 pt-6 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-md border border-secondary/30 bg-white/12 p-4 shadow-lg backdrop-blur">
                    <div className="text-sm font-semibold text-secondary">{item.label}</div>
                    <div className="mt-1 text-sm text-white/80">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-secondary/20 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <span className="royal-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide">
                  <Sparkles className="h-3.5 w-3.5" />
                  Curated for visitors
                </span>
                <h2 className="mt-4 text-3xl font-bold text-primary">Start with what you need</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Jump straight into the tasks tourists actually repeat: questions, places, food, and timing.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                  Updated for quick royal planning
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Smart AI Guide",
                  description: "Chat with our AI in any language to plan your itinerary and learn history.",
                  icon: MessageCircle,
                  color: "text-blue-600 dark:text-blue-400",
                  bg: "bg-blue-50 dark:bg-blue-950/20",
                  link: "/chat"
                },
                {
                  title: "Heritage Spots",
                  description: "Detailed information about palaces, temples, and gardens with visiting hours.",
                  icon: MapIcon,
                  color: "text-amber-600 dark:text-amber-400",
                  bg: "bg-amber-50 dark:bg-amber-950/20",
                  link: "/spots"
                },
                {
                  title: "Local Cuisine",
                  description: "Find the best restaurants serving authentic Mysore Pak and Masala Dosa.",
                  icon: Utensils,
                  color: "text-emerald-600 dark:text-emerald-400",
                  bg: "bg-emerald-50 dark:bg-emerald-950/20",
                  link: "/restaurants"
                }
              ].map((feature, i) => (
                <Link key={i} href={feature.link}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="royal-card h-full cursor-pointer rounded-lg p-6 transition-all hover:-translate-y-1 hover:border-secondary/60 hover:shadow-xl"
                  >
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-md ${feature.bg} ring-1 ring-secondary/20`}>
                      <feature.icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-bold font-display mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-6 flex items-center text-primary font-medium text-sm group">
                      Explore <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground">
          <div className="absolute inset-0 bg-pattern-mandala opacity-20" />
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h2 className="mb-5 text-3xl font-bold text-secondary md:text-5xl">Heritage City of Karnataka</h2>
            <div className="royal-divider mx-auto mb-5 max-w-md" />
            <p className="mx-auto max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl">
              From the grandiose Mysore Palace to the serene Brindavan Gardens, experience a city where tradition meets modernity.
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
