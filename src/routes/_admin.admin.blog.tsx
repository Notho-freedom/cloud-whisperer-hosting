import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import { adminListBlogPosts } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/blog")({ component: BlogCMS });

function BlogCMS() {
  const { data: posts = [], isLoading } = useQuery({ queryKey: ["admin", "blog"], queryFn: () => adminListBlogPosts() });
  return (
    <>
      <AdminPageHeader title="Blog CMS" actions={<Button><Plus className="h-4 w-4" />Nouvel article</Button>} />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Tag</TableHead><TableHead>Auteur</TableHead><TableHead>Statut</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
            <TableBody>
              {(posts as Array<{ id: string; slug: string; title: string; tag: string | null; author: string | null; published: boolean | null; created_at: string }>).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.tag && <Badge variant="outline">{p.tag}</Badge>}</TableCell>
                  <TableCell className="text-sm">{p.author ?? "—"}</TableCell>
                  <TableCell><Badge variant={p.published ? "success" : "secondary"}>{p.published ? "Publié" : "Brouillon"}</Badge></TableCell>
                  <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && !isLoading && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">Aucun article</TableCell></TableRow>}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
