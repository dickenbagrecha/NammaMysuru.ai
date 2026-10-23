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
    <header className="sticky top-0 z-50 w-full border-b border-secondary/25 bg-background/86 shadow-sm backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all group">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-secondary/50 bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
            <img
              src="/favicon.png"
              alt="NammaMysuru.ai logo"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
          </div>
          <span className="font-['Outfit'] text-2xl font-bold text-primary tracking-tight flex flex-col leading-none">
            <span>Namma<span className="text-secondary font-medium">Mysuru.ai</span></span>
            <span className="mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:block">Royal guide</span>
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
                    "px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200 font-medium text-sm",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-secondary/30"
                      : "text-muted-foreground hover:bg-secondary/10 hover:text-primary"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-primary")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <SettingsMenu />
          {user ? (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
              <UserCircle className="h-4 w-4 text-primary" />
              <span className="max-w-28 truncate">{user.name}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm ring-1 ring-secondary/25 transition hover:bg-primary/90"
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
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary"
              aria-label="Logout"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          ) : (
            <Link href="/login" className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary" aria-label="Login">
              <LogIn className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-secondary/25 bg-background/95 px-1 py-1.5 flex justify-around items-center z-50 shadow-[0_-12px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl safe-area-bottom">
        <Link
          href="/"
          className="flex min-w-[3rem] sm:w-16 flex-col items-center gap-1 rounded-lg p-1.5 text-primary transition-colors"
          aria-label="Home"
        >
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center overflow-hidden rounded-md border border-secondary/40 bg-primary shadow-sm">
            <img src="/favicon.png" alt="NammaMysuru.ai logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors min-w-[3rem] sm:w-16",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "p-1 sm:p-1.5 rounded-full",
                isActive ? "bg-primary/10 ring-1 ring-secondary/30" : "bg-transparent"
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
