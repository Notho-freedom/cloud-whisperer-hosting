import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/blog")({
  head: () => ({
    meta: [
      { title: "Blog | Hostiq" },
      { name: "description", content: "Conseils, tutoriels et nouveautés sur l'hébergement, le DNS et le déploiement web." },
      { property: "og:title", content: "Blog Hostiq" },
      { property: "og:description", content: "Le blog tech d'Hostiq." },
    ],
  }),
  component: BlogPage,
});

const POSTS = [
  { slug: "lancer-saas-2024", title: "Comment lancer un SaaS en 2024", excerpt: "Du choix du domaine au premier déploiement, le guide complet.", date: "12 mars 2024", tag: "Guide" },
  { slug: "dns-records-explained", title: "Comprendre les enregistrements DNS", excerpt: "A, AAAA, CNAME, MX, TXT — chaque record décrypté avec exemples.", date: "5 mars 2024", tag: "DNS" },
  { slug: "edge-vs-origin", title: "Edge vs origin : quelles différences ?", excerpt: "Pourquoi le edge change la donne pour vos performances web.", date: "28 février 2024", tag: "Performance" },
  { slug: "spf-dkim-dmarc", title: "SPF, DKIM, DMARC : la sainte trinité de l'email", excerpt: "Évitez les spams et améliorez votre délivrabilité.", date: "20 février 2024", tag: "Email" },
];

function BlogPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Blog</h1>
      <p className="mt-3 text-muted-foreground">Conseils, tutos et nouveautés Hostiq.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {POSTS.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }}>
            <Card className="h-full p-6 transition-colors hover:border-primary/40">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{p.tag}</Badge>
                <span className="text-xs text-muted-foreground">{p.date}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <span className="mt-4 inline-block text-sm text-primary">Lire l'article →</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
