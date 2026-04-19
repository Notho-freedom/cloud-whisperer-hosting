import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { BLOG_POSTS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/blog")({
  component: BlogCMS,
});

function BlogCMS() {
  return (
    <>
      <AdminPageHeader title="Blog CMS" actions={<Button><Plus className="h-4 w-4" />Nouvel article</Button>} />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Tag</TableHead><TableHead>Auteur</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {BLOG_POSTS.map((p) => (
                <TableRow key={p.slug}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell><Badge variant="outline">{p.tag}</Badge></TableCell>
                  <TableCell className="text-sm">{p.author}</TableCell>
                  <TableCell className="text-sm">{p.date}</TableCell>
                  <TableCell><Button variant="ghost" size="icon"><Edit3 className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
