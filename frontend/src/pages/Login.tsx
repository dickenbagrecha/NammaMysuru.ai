import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { LockKeyhole, LogIn, Mail, User } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/hooks/use-app-settings";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, theme } = useAppSettings();
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        className="flex flex-grow items-center justify-center bg-cover bg-center px-4 py-12 pb-28 md:pb-12"
        style={{
          backgroundImage: `${theme === "dark"
            ? "linear-gradient(rgba(18, 3, 8, 0.86), rgba(18, 3, 8, 0.78))"
            : "linear-gradient(rgba(255, 250, 240, 0.88), rgba(255, 250, 240, 0.82))"
            }, url('/images/royal-silk-pattern.svg')`,
        }}
      >
        <section className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold text-primary">Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Continue planning your Mysuru trip with NammaMysuru.ai.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
              />
            </div>

            {error && (
              <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
