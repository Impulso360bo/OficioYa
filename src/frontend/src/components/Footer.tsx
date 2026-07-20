import { HardHat } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-4 w-4" />
            </div>
            <span className="font-display font-semibold text-foreground">
              BuscaOficio
            </span>
          </div>

          {/* Categories */}
          <p className="text-xs text-muted-foreground font-body text-center">
            Albañil · Carpintero · Pintor · Electricista · Plomero · Soldador ·
            Jardinero · Mecánico
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground font-body">
            © {year}.{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
