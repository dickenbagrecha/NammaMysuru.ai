import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Phone, AlertTriangle, Shield, Bus, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

export default function Helpline() {
  const emergencyContacts = [
    {
      title: "Police Control Room",
      number: "100 / 112",
      badge: "24/7 Emergency",
      badgeColor: "bg-red-100 text-red-800",
      description: "Direct rapid response line for city-wide emergency and crime reporting.",
      icon: Shield,
    },
    {
      title: "Ambulance & Trauma Care",
      number: "108",
      badge: "Govt Free Service",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description: "Immediate emergency medical dispatch and hospital routing in Mysore.",
      icon: HeartPulse,
    },
    {
      title: "Tourist Police & Assistance",
      number: "1363",
      badge: "Multilingual Desk",
      badgeColor: "bg-stitch-secondary-fixed text-stitch-on-secondary-fixed",
      description: "Dedicated tourist protection desk operating across palace and bus stand outposts.",
      icon: Phone,
    },
    {
      title: "Women Safety Helpline",
      number: "1091",
      badge: "Confidential",
      badgeColor: "bg-purple-100 text-purple-800",
      description: "Immediate assistance and emergency safety escort for women travelers.",
      icon: Shield,
    },
  ];

  const transitDesks = [
    {
      title: "KSTDC Tourist Information Kiosk",
      number: "0821-2422096",
      location: "Near Mysore Palace South Gate",
      hours: "9:00 AM – 7:00 PM",
      icon: Phone,
    },
    {
      title: "Suburban KSRTC Bus Stand",
      number: "0821-2425824",
      location: "Mother Teresa Road, Central Mysore",
      hours: "24/7 Enquiries",
      icon: Bus,
    },
    {
      title: "Mysuru Railway Junction Helpline",
      number: "139",
      location: "Medar Block, Yadavagiri",
      hours: "24/7 Rail Assistance",
      icon: Bus,
    },
    {
      title: "Mysore City Corporation (MCC)",
      number: "0821-2418800",
      location: "Sayyaji Rao Road",
      hours: "10:00 AM – 5:30 PM",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans selection:bg-stitch-primary-container selection:text-white">
      <Header />

      <main className="flex-grow pb-24 md:pb-12">
        {/* Top Header */}
        <section className="relative w-full bg-stitch-surface-container-low overflow-hidden pt-8 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stitch-outline-variant/30">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-100/40 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-stitch-primary/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2 text-stitch-on-surface-variant text-xs">
              <span className="text-stitch-secondary font-bold uppercase tracking-widest">
                Visitor Safety Portal
              </span>
              <span className="text-stitch-outline-variant">•</span>
              <span>Karnataka State Tourism Development</span>
              <span className="text-stitch-outline-variant">•</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stitch-tertiary-fixed text-stitch-on-tertiary-fixed font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-stitch-tertiary animate-ping" />
                24/7 Operational Responders
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stitch-primary tracking-tight">
                24/7 Tourist Helpline &amp; Safety Network
              </h1>
              <p className="mt-3 text-sm sm:text-base text-stitch-on-surface-variant max-w-2xl leading-relaxed">
                Direct tap-to-call emergency responder contacts, official tourist police outposts, and verified transit assistance desks across Mysuru.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Responders Section */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="text-xs uppercase tracking-wider text-stitch-secondary font-bold mb-3">
            Immediate Emergency Hotlines
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {emergencyContacts.map((contact, idx) => (
              <motion.article
                key={contact.number}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-stitch-outline-variant/30 flex flex-col justify-between hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${contact.badgeColor}`}>
                      {contact.badge}
                    </span>
                    <contact.icon className="w-5 h-5 text-stitch-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-stitch-on-surface">
                    {contact.title}
                  </h3>
                  <p className="text-xs text-stitch-on-surface-variant mt-1.5 leading-relaxed">
                    {contact.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stitch-outline-variant/20 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stitch-secondary uppercase tracking-wider font-bold block">
                      Direct Dial
                    </span>
                    <a
                      href={`tel:${contact.number.split(" ")[0]}`}
                      className="font-serif text-2xl font-bold text-stitch-primary hover:text-stitch-secondary transition-colors"
                    >
                      {contact.number}
                    </a>
                  </div>
                  <a
                    href={`tel:${contact.number.split(" ")[0]}`}
                    className="w-11 h-11 rounded-xl bg-stitch-primary text-white flex items-center justify-center hover:bg-stitch-primary-container transition-all shadow-md"
                    title={`Call ${contact.title}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Transit & Information Desks */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-xs uppercase tracking-wider text-stitch-secondary font-bold mb-4">
            Official Transit Desks &amp; Municipal Offices
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {transitDesks.map((desk, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-stitch-outline-variant/30 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <desk.icon className="w-5 h-5 text-stitch-secondary mb-2" />
                  <h4 className="font-serif font-bold text-sm text-stitch-on-surface">
                    {desk.title}
                  </h4>
                  <p className="text-[11px] text-stitch-on-surface-variant mt-1">{desk.location}</p>
                </div>

                <div className="pt-3 border-t border-stitch-outline-variant/20">
                  <span className="text-[10px] text-stitch-on-surface-variant block font-medium">
                    {desk.hours}
                  </span>
                  <a
                    href={`tel:${desk.number}`}
                    className="font-serif font-bold text-sm text-stitch-primary hover:underline block mt-0.5"
                  >
                    {desk.number}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
