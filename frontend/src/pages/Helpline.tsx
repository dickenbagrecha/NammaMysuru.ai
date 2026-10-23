import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, AlertTriangle, Shield, Bus, HeartPulse, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function Helpline() {
  const contacts = [
    { title: "Police Control Room", number: "100", icon: Shield, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-950/20" },
    { title: "Ambulance", number: "108", icon: HeartPulse, color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-950/20" },
    { title: "Fire Station", number: "101", icon: AlertTriangle, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-950/20" },
    { title: "Tourist Helpline", number: "1363", icon: Phone, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-950/20" },
    { title: "Women Helpline", number: "1091", icon: Shield, color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-100 dark:bg-pink-950/20" },
    { title: "KSRTC Bus Stand", number: "0821-2425824", icon: Bus, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-950/20" },
    { title: "Railway Station", number: "139", icon: Bus, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800/30" },
    { title: "City Corporation", number: "0821-2418800", icon: Phone, color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-100 dark:bg-cyan-950/20" },
  ];

  return (
    <div className="royal-page min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-8 sm:py-12 px-4 pb-28 md:pb-12">
        <div className="container mx-auto max-w-4xl">
           <div className="royal-panel mb-8 sm:mb-12 rounded-xl px-4 py-6 sm:px-6 sm:py-10 text-center">
            <div className="relative z-10 space-y-3 sm:space-y-4">
             <div className="royal-chip inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-semibold">
              <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Protected travel</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary">Helpline Numbers</h1>
            <div className="royal-divider mx-auto max-w-sm" />
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              Essential contact numbers for safety and assistance during your stay in Mysuru.
            </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {contacts.map((contact, idx) => (
              <motion.div
                key={contact.number}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="royal-card flex items-center rounded-xl p-6 transition-all hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-xl"
              >
                <div className={`w-12 h-12 ${contact.bg} rounded-full flex items-center justify-center mr-5 ring-1 ring-secondary/20`}>
                  <contact.icon className={`w-6 h-6 ${contact.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{contact.title}</h3>
                  <a 
                    href={`tel:${contact.number}`} 
                    className="text-2xl font-bold text-primary hover:text-secondary transition-colors font-display tracking-wide block mt-1"
                  >
                    {contact.number}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
