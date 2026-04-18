import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Github, Twitter, Linkedin } from "lucide-react";

const SECTIONS: Array<{
  title: string;
  links: Array<{ to: string; label: string }>;
}> = [
  {
    title: "Produits",
    links: [
      { to: "/domains", label: "Domaines" },
      { to: "/hosting", label: "Hébergement" },
      { to: "/email", label: "Email Pro" },
      { to: "/pricing", label: "Tarifs" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { to: "/about", label: "À propos" },
      { to: "/blog", label: "Blog" },
      { to: "/contact", label: "Contact" },
      { to: "/status", label: "Statut" },
    ],
  },
  {
    title: "Légal",
    links: [
      { to: "/legal/terms", label: "Conditions" },
      { to: "/legal/privacy", label: "Confidentialité" },
      { to: "/legal/cookies", label: "Cookies" },
      { to: "/legal/sla", label: "SLA" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Hébergement, domaines et emails pro — sans infrastructure à gérer.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h4 className="text-sm font-semibold">{s.title}</h4>
              <ul className="mt-3 space-y-2">
                {s.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Hostiq. Tous droits réservés.</p>
          <p className="font-mono">Built without infra · Powered by APIs</p>
        </div>
      </div>
    </footer>
  );
}
