import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="bg-card w-full max-w-md p-8 rounded-2xl shadow-xl border border-border text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">404 Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The path you are looking for does not exist in our royal records.
        </p>

        <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Return to Palace (Home)
        </Link>
      </div>
    </div>
  );
}
