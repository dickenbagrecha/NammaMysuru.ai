import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, Mail, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAppSettings } from "@/hooks/use-app-settings";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAppSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail || password.length < 4) {
      setError("Enter your name, email, and a password with at least 4 characters.");
      return;
    }

    login({ name: trimmedName, email: trimmedEmail });
    setLocation("/chat");
  };

  return (
    <div className="min-h-screen flex flex-col bg-stitch-surface text-stitch-on-surface font-sans selection:bg-stitch-primary-container selection:text-white">
      <Header />

      <main className="flex flex-grow items-center justify-center px-4 py-16 pb-28 md:pb-16 bg-stitch-surface-container-low relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-stitch-secondary-fixed/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-stitch-primary/10 blur-3xl pointer-events-none" />

        <section className="relative z-10 w-full max-w-md rounded-3xl border border-stitch-outline-variant/40 bg-white p-7 sm:p-9 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stitch-primary text-white shadow-lg shadow-stitch-primary/20">
              <LockKeyhole className="h-7 w-7" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-stitch-primary">
              Traveller Portal
            </h1>
            <p className="text-xs sm:text-sm text-stitch-on-surface-variant leading-relaxed">
              Sign in to save your curated itineraries, conversation history, and royal trail bookmarks.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-bold text-stitch-secondary uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stitch-on-surface-variant/70" />
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Maharani Gayatri Devi"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stitch-outline-variant/40 bg-stitch-surface-container-low text-sm text-stitch-on-surface focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-stitch-secondary uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stitch-on-surface-variant/70" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="traveller@nammamysuru.ai"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stitch-outline-variant/40 bg-stitch-surface-container-low text-sm text-stitch-on-surface focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-bold text-stitch-secondary uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl border border-stitch-outline-variant/40 bg-stitch-surface-container-low text-sm text-stitch-on-surface focus:outline-none focus:bg-white"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-stitch-primary text-white font-bold text-sm shadow-lg hover:bg-stitch-primary-container transition active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Sign In to Royal Guide</span>
            </button>
          </form>

          <div className="border-t border-stitch-outline-variant/20 pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                login({ name: "Guest Traveller", email: "guest@nammamysuru.ai" });
                setLocation("/chat");
              }}
              className="text-xs text-stitch-secondary font-bold hover:underline"
            >
              Continue without signing in as Guest Traveller →
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
