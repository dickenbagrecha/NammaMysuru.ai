import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, MapPin, MessageCircle, Moon, Phone, Settings, Sun, UserCircle, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/hooks/use-app-settings";
import { useState } from "react";

export function Header() {
  const [location] = useLocation();
  const { login, logout, setTheme, theme, user } = useAppSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navItems = [
    { href: "/spots", label: "Places", icon: MapPin },
    { href: "/restaurants", label: "Dining", icon: UtensilsCrossed },
    { href: "/helpline", label: "Helpline", icon: Phone },
    { href: "/chat", label: "Guide", icon: MessageCircle },
  ];

  const handleGuestLogin = () => {
    login({ name: "Guest Traveller", email: "guest@nammamysuru.ai" });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const SettingsMenu = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open settings"
        aria-expanded={isSettingsOpen}
        onClick={() => setIsSettingsOpen((open) => !open)}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-colors border",
          theme === "dark"
            ? "border-gold/20 text-slate-300 hover:text-gold hover:bg-dusk-800"
            : "border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-parchment-200"
        )}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isSettingsOpen && (
        <div className={cn(
          "absolute right-0 top-11 z-[70] w-64 max-w-[calc(100vw-2rem)] rounded-xl border p-2 shadow-2xl backdrop-blur-md",
          theme === "dark"
            ? "border-gold/30 bg-dusk-900 text-slate-100 shadow-black/60"
            : "border-[#E0D5C1] bg-white/95 text-slate-800 shadow-royal"
        )}>
          <div className={cn(
            "px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider",
            theme === "dark" ? "text-gold/70" : "text-slate-400"
          )}>
            Theme &amp; Preferences
          </div>
          <button
            onClick={() => {
              setTheme("light");
              setIsSettingsOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm font-medium transition",
              theme === "light"
                ? "bg-maroon/10 text-maroon font-semibold"
                : "text-slate-600 hover:bg-parchment-200 dark:text-slate-300 dark:hover:bg-dusk-800"
            )}
          >
            <Sun className="h-4 w-4 text-amber-500" />
            <span>Light Theme (Design 1)</span>
            {theme === "light" && <span className="ml-auto text-[10px] font-bold text-maroon uppercase bg-maroon/10 px-1.5 py-0.5 rounded">Active</span>}
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setIsSettingsOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm font-medium transition",
              theme === "dark"
                ? "bg-gold/15 text-gold-light font-semibold"
                : "text-slate-600 hover:bg-parchment-200 dark:text-slate-300 dark:hover:bg-dusk-800"
            )}
          >
            <Moon className="h-4 w-4 text-gold" />
            <span>Royal Evening Dark (Design 3)</span>
            {theme === "dark" && <span className="ml-auto text-[10px] font-bold text-gold uppercase bg-gold/15 px-1.5 py-0.5 rounded">Active</span>}
          </button>

          <div className={cn("my-1.5 h-px", theme === "dark" ? "bg-gold/15" : "bg-[#E6DECE]")} />

          {user ? (
            <>
              <div className="px-2.5 py-1.5">
                <span className="block text-xs sm:text-sm font-semibold">{user.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsSettingsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm transition",
                  theme === "dark" ? "hover:bg-dusk-800 text-slate-300" : "hover:bg-parchment-200 text-slate-700"
                )}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setIsSettingsOpen(false)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm transition",
                  theme === "dark" ? "hover:bg-dusk-800 text-slate-300" : "hover:bg-parchment-200 text-slate-700"
                )}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <button
                onClick={() => {
                  handleGuestLogin();
                  setIsSettingsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm transition",
                  theme === "dark" ? "hover:bg-dusk-800 text-slate-300" : "hover:bg-parchment-200 text-slate-700"
                )}
              >
                <UserCircle className="h-4 w-4" />
                Continue as guest
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-colors duration-300 shrink-0",
      theme === "dark"
        ? "bg-dusk-950/90 backdrop-blur-md border-b border-gold/20 shadow-lg shadow-black/50"
        : "bg-white/95 backdrop-blur-md border-b border-[#E6DDCE] shadow-xs"
    )}>
      {/* Stitch Live Cultural Notice Bar */}
      {theme === "dark" ? (
        <aside className="bg-gradient-to-r from-[#180A12] via-[#2A1120] to-[#180A12] text-amber-100 text-xs py-1.5 sm:py-2 px-3 sm:px-6 flex items-center justify-between border-b border-gold/20 shadow-md shadow-black/40 z-30 shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-500/20 text-gold-light font-semibold tracking-wider text-[9px] sm:text-[10px] uppercase border border-gold/40 shadow-xs shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping"></span>
              ✨ Live Notice
            </span>
            <span className="text-gold/40 font-serif hidden xs:inline">|</span>
            <span className="font-medium tracking-wide text-amber-50 text-[11px] sm:text-[13px] truncate">
              ✨ <strong className="text-gold font-semibold">ROYAL EVENING ILLUMINATION</strong> | Mysuru Dasara &amp; Palace: 100,000 bulbs lit
            </span>
          </div>
          <Link
            href="/chat"
            className="text-gold hover:text-gold-light text-xs font-semibold flex items-center gap-1 shrink-0 ml-3 transition-colors group"
          >
            <span>Ask Concierge</span>
            <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </aside>
      ) : (
        <aside className="bg-[#183B2B] text-emerald-100 text-xs py-1.5 sm:py-2 px-3 sm:px-6 flex items-center justify-between border-b border-emerald-900/40 z-30 shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold tracking-wider text-[9px] sm:text-[10px] uppercase border border-emerald-500/30 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Cultural Notice
            </span>
            <span className="text-emerald-200/60 font-serif hidden xs:inline">|</span>
            <span className="font-medium tracking-wide text-white text-[11px] sm:text-[13px] truncate">
              Mysuru Dasara &amp; Palace Illumination Schedule: Sunday 7:00 PM – 8:00 PM (100,000 royal incandescent bulbs illuminated)
            </span>
          </div>
          <Link
            href="/chat"
            className="text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1 shrink-0 ml-3 transition-colors"
          >
            <span>Ask Concierge</span>
            <span>→</span>
          </Link>
        </aside>
      )}

      {/* Main Brand and Navigation Header */}
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand identity with Gandaberunda royal emblem */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className={cn(
            "h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0 relative overflow-hidden",
            theme === "dark"
              ? "bg-gradient-to-br from-[#881337] via-[#580A23] to-[#360617] border border-gold/50 shadow-[#881337]/40"
              : "bg-gradient-to-br from-[#5E0F2B] via-[#45091E] to-[#360617] border border-gold/40 shadow-maroon/20"
          )}>
            <svg className={cn("w-5 h-5 sm:w-6 sm:h-6", theme === "dark" ? "text-gold-light" : "text-amber-300")} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M12 2L9.5 7H14.5L12 2Z" fill="currentColor" fillOpacity="0.3"></path>
              <path d="M3 10L6.5 13L12 8L17.5 13L21 10L19.5 19H4.5L3 10Z" strokeLinecap="round" strokeLinejoin="round"></path>
              <circle cx="12" cy="14" fill="currentColor" r="2"></circle>
              <path d="M5 21H19" strokeLinecap="round"></path>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className={cn(
                "text-lg sm:text-2xl font-serif font-bold tracking-tight",
                theme === "dark" ? "text-gold-light" : "text-maroon"
              )}>
                Namma<span className={theme === "dark" ? "text-slate-100" : "text-slate-900"}>Mysuru</span>
                <span className={cn("font-sans font-semibold text-sm sm:text-lg ml-0.5", theme === "dark" ? "text-gold" : "text-[#C59B27]")}>.ai</span>
              </span>
            </div>
            <p className={cn(
              "text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.24em] font-bold mt-0.5",
              theme === "dark" ? "text-amber-200/70" : "text-slate-500"
            )}>
              Royal Heritage &amp; Culture
            </p>
          </div>
        </Link>

        {/* Navigation links & actions */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-[13.5px]">
          <nav className={cn(
            "hidden md:flex items-center space-x-4 lg:space-x-5 font-medium",
            theme === "dark" ? "text-slate-300" : "text-slate-600"
          )}>
            {navItems.slice(0, 3).map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 transition-colors py-1",
                    theme === "dark"
                      ? (isActive ? "text-gold font-bold drop-shadow-[0_0_8px_rgba(243,194,70,0.5)]" : "hover:text-gold")
                      : (isActive ? "text-maroon font-bold" : "hover:text-maroon")
                  )}
                >
                  <item.icon className={cn("w-4 h-4", theme === "dark" ? "text-gold/70" : "text-slate-500")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Active Evening Illumination Theme Badge in Dark Mode */}
          {theme === "dark" && (
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dusk-850/80 border border-gold/40 text-gold-light text-xs font-medium shadow-xs">
              <span className="text-sm">🌙</span>
              <span>Royal Illumination</span>
            </div>
          )}

          {/* Direct 1-Click Theme Switcher Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
              "h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-colors border",
              theme === "dark"
                ? "border-gold/30 bg-dusk-900 text-gold hover:bg-dusk-800 hover:text-gold-light shadow-sm"
                : "border-[#DECDB8] bg-white text-amber-600 hover:bg-parchment-200 shadow-xs"
            )}
            title={theme === "dark" ? "Switch to Light Theme (Design 1)" : "Switch to Royal Evening Dark Theme (Design 3)"}
            aria-label="Toggle visual theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-gold hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-maroon hover:-rotate-12 transition-transform" />
            )}
          </Button>

          {/* Active Guide pill */}
          <Link
            href="/chat"
            className={cn(
              "hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full font-medium transition-all text-xs sm:text-sm",
              theme === "dark"
                ? "bg-gradient-to-r from-maroon to-maroon-dark text-gold-light shadow-md shadow-maroon/30 border border-gold/30 hover:border-gold"
                : "bg-maroon text-white hover:bg-maroon-dark shadow-sm"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Guide</span>
          </Link>

          {/* Settings Menu */}
          <SettingsMenu />

          {/* Login or User pill */}
          {user ? (
            <div className={cn(
              "hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border",
              theme === "dark"
                ? "border-gold/30 bg-dusk-900 text-gold-light"
                : "border-[#E0D5C1] bg-white text-slate-800 shadow-xs"
            )}>
              <UserCircle className="h-4 w-4" />
              <span className="max-w-24 truncate">{user.name}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "hidden xs:flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg font-semibold transition-colors text-xs border",
                theme === "dark"
                  ? "border-gold/50 text-gold-light hover:bg-gold/10"
                  : "border-maroon text-maroon hover:bg-maroon/5"
              )}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-stitch-outline-variant/30 bg-stitch-surface/95 px-1 py-1.5 flex justify-around items-center z-50 shadow-[0_-12px_30px_rgba(26,34,56,0.08)] backdrop-blur-xl safe-area-bottom">
        <Link
          href="/"
          className="flex min-w-[3rem] sm:w-16 flex-col items-center gap-1 rounded-lg p-1.5 text-stitch-primary transition-colors"
          aria-label="Home"
        >
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-md border border-stitch-secondary/40 bg-stitch-primary shadow-sm">
            <img src="/favicon.png" alt="NammaMysuru.ai logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors min-w-[3rem] sm:w-16",
                isActive ? "text-stitch-primary font-bold" : "text-stitch-on-surface-variant"
              )}
            >
              <div className={cn(
                "p-1 sm:p-1.5 rounded-full transition-all",
                isActive ? "bg-stitch-primary-container text-white" : "bg-transparent"
              )}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
