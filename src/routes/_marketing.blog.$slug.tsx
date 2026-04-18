import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | Blog Hostiq` },
      { name: "description", content: "Article du blog Hostiq." },
      { property: "og:title", content: `${params.slug} | Blog Hostiq` },
      { property: "og:description", content: "Article du blog Hostiq." },
    ],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <article className="container mx-auto max-w-3xl px-4 py-16">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour au blog
      </Link>
      <div className="mt-8 flex items-center gap-2">
        <Badge variant="secondary">Article</Badge>
        <span className="text-xs text-muted-foreground">5 min de lecture</span>
      </div>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">{title}</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p>
          Bienvenue sur cet article du blog Hostiq. Le contenu réel sera connecté via une API CMS
          (à brancher en phase backend). Cette page sert de gabarit visuel pour les futurs contenus.
        </p>
        <h2 className="text-2xl font-semibold text-foreground">Introduction</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
        </p>
        <h2 className="text-2xl font-semibold text-foreground">Approche technique</h2>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur. Excepteur sint occaecat cupidatat non proident.
        </p>
        <pre className="rounded-lg border border-border bg-card p-4 text-sm">
          <code>{`$ hostiq deploy --prod\n✓ Built in 12.3s\n✓ Deployed to https://${slug}.hostiq.app`}</code>
        </pre>
        <h2 className="text-2xl font-semibold text-foreground">Conclusion</h2>
        <p>
          Sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </article>
  );
}
