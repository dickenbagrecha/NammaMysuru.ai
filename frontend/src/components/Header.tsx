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

  const SettingsMenu = () => (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label="Open settings"
        aria-expanded={isSettingsOpen}
        onClick={() => setIsSettingsOpen((open) => !open)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isSettingsOpen && (
        <div className="absolute right-0 top-11 z-[70] w-60 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-xl">
          <div className="px-2 py-1.5 text-sm font-semibold">Settings</div>
          <button
            onClick={() => {
              setTheme("light");
              setIsSettingsOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent"
          >
            <Sun className="h-4 w-4" />
            Light mode
            {theme === "light" && <span className="ml-auto text-xs text-primary">On</span>}
          </button>
          <button
            onClick={() => {
              setTheme("dark");
              setIsSettingsOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent"
          >
            <Moon className="h-4 w-4" />
            Dark mode
            {theme === "dark" && <span className="ml-auto text-xs text-primary">On</span>}
          </button>

          <div className="my-1 h-px bg-muted" />

          {user ? (
            <>
              <div className="px-2 py-1.5">
                <span className="block text-sm font-medium">{user.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsSettingsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent"
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
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <button
                onClick={() => {
                  handleGuestLogin();
                  setIsSettingsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition hover:bg-accent"
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
    <header className="sticky top-0 z-50 w-full border-b border-stitch-outline-variant/30 bg-stitch-surface/90 shadow-[0_4px_20px_-2px_rgba(26,34,56,0.06)] backdrop-blur-xl">
      {/* Stitch Cultural Notice Bar */}
      <div className="bg-stitch-tertiary text-stitch-on-tertiary px-4 py-1 text-xs">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-stitch-secondary-fixed animate-pulse shrink-0" />
            <span className="uppercase tracking-wider text-stitch-secondary-fixed font-bold text-[10px] shrink-0">Live Cultural Notice</span>
            <span className="hidden sm:inline text-stitch-on-tertiary/60">|</span>
            <span className="font-medium truncate text-[11px] sm:text-xs">
              Mysuru Dasara &amp; Palace Illumination Schedule: Sunday 7:00 PM – 8:00 PM (100,000 bulbs illuminated)
            </span>
          </div>
          <Link
            href="/chat"
            className="hidden md:inline-flex items-center gap-1 text-stitch-secondary-fixed hover:text-white transition-colors text-xs font-semibold shrink-0 ml-3"
          >
            <span>Ask Concierge</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-lg border border-stitch-secondary/40 bg-stitch-primary shadow-md shadow-stitch-primary/20 transition-transform duration-300 group-hover:scale-105 shrink-0">
            <img
              src="/favicon.png"
              alt="NammaMysuru.ai logo"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
          </div>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl sm:text-2xl font-bold text-stitch-primary tracking-tight">
              Namma<span className="text-stitch-secondary font-medium">Mysuru.ai</span>
            </span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-stitch-on-surface-variant sm:block">
              Royal Heritage &amp; Culture
            </span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-semibold text-sm",
                    isActive
                      ? "bg-stitch-primary-container text-stitch-on-primary shadow-sm"
                      : "text-stitch-on-surface-variant hover:text-stitch-primary hover:bg-stitch-surface-container"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-stitch-on-primary" : "text-stitch-secondary")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <SettingsMenu />
          {user ? (
            <div className="flex items-center gap-2 rounded-lg border border-stitch-outline-variant/40 bg-stitch-surface-container-lowest px-3 py-1.5 text-sm font-medium text-stitch-on-surface">
              <UserCircle className="h-4 w-4 text-stitch-primary" />
              <span className="max-w-28 truncate">{user.name}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-stitch-primary px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stitch-primary-container transition"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <SettingsMenu />
          {user ? (
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stitch-outline-variant/40 bg-white text-stitch-primary"
              aria-label="Logout"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          ) : (
            <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-lg border border-stitch-outline-variant/40 bg-white text-stitch-primary" aria-label="Login">
              <LogIn className="h-5 w-5" />
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
