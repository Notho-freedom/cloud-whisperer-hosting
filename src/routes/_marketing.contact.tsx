import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Phone, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_marketing/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Hostiq" },
      { name: "description", content: "Une question ? Notre équipe vous répond rapidement." },
      { property: "og:title", content: "Contact Hostiq" },
      { property: "og:description", content: "Contactez l'équipe Hostiq." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Message envoyé ! Nous vous répondons sous 24h.");
    }, 800);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Contactez-nous</h1>
        <p className="mt-4 text-muted-foreground">
          Une question commerciale, technique ou un partenariat ? Écrivez-nous.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        <Card className="p-6">
          <Mail className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">hello@hostiq.io</p>
        </Card>
        <Card className="p-6">
          <MessageCircle className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Chat live</h3>
          <p className="mt-1 text-sm text-muted-foreground">Disponible 9h–19h CET</p>
        </Card>
        <Card className="p-6">
          <Phone className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Téléphone (Pro)</h3>
          <p className="mt-1 text-sm text-muted-foreground">+33 1 23 45 67 89</p>
        </Card>
      </div>

      <Card className="mx-auto mt-12 max-w-2xl p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input id="subject" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Send className="h-4 w-4" />
            {loading ? "Envoi…" : "Envoyer"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
