import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Cpu, Globe, RefreshCw, Database, Briefcase, GitBranch, Container } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createService } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/new")({
  head: () => ({ meta: [{ title: "New Service | Hostiq" }] }),
  component: NewServicePage,
});

type ServiceType = "web_service" | "private_service" | "background_worker" | "cron_job" | "static_site";
type Runtime = "node" | "python" | "ruby" | "go" | "rust" | "elixir" | "docker" | "image" | "static";

const TYPE_CARDS: Array<{ value: ServiceType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = [
  { value: "web_service", label: "Web Service", icon: Globe, desc: "HTTP service with custom domains & TLS." },
  { value: "private_service", label: "Private Service", icon: Cpu, desc: "Internal API not exposed to the internet." },
  { value: "background_worker", label: "Worker", icon: Briefcase, desc: "Long-running background process." },
  { value: "cron_job", label: "Cron Job", icon: RefreshCw, desc: "Scheduled command on a CRON expression." },
  { value: "static_site", label: "Static Site", icon: Database, desc: "Static build deployed to global edge." },
];

function NewServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [type, setType] = React.useState<ServiceType>("web_service");
  const [source, setSource] = React.useState<"git" | "image">("git");
  const [form, setForm] = React.useState({
    name: "",
    runtime: "node" as Runtime,
    region: "oregon",
    plan: "starter",
    repo: "",
    branch: "main",
    rootDir: "",
    buildCommand: "",
    startCommand: "",
    imageUrl: "",
    scheduleCron: "0 * * * *",
    healthCheckPath: "/",
    ownerId: "",
  });

  const m = useMutation({
    mutationFn: () => createService({ data: {
      ...form,
      type,
      repo: source === "git" ? form.repo : undefined,
      imageUrl: source === "image" ? form.imageUrl : undefined,
    } as any }),
    onSuccess: (svc: any) => {
      toast.success("Service created");
      navigate({ to: "/app/services/$serviceId", params: { serviceId: svc.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((p) => ({ ...p, [k]: v })); }

  return (
    <>
      <PageHeader
        title="Create a new service"
        description="Pick a type, connect your source, and deploy on Render."
        breadcrumbs={[{ label: "Services", to: "/app/services" }, { label: "New" }]}
      />
      <PageContent className="!max-w-3xl">
        <ol className="mb-6 flex items-center gap-2 text-xs">
          {["Type", "Source", "Configure"].map((s, i) => (
            <li key={s} className={cn("flex items-center gap-2", step === i + 1 ? "text-foreground" : "text-muted-foreground")}>
              <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                step >= i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{i + 1}</span>
              {s}{i < 2 && <span className="mx-1 h-px w-6 bg-border" />}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <Card>
            <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
              {TYPE_CARDS.map((c) => (
                <button key={c.value} onClick={() => { setType(c.value); setStep(2); }}
                  className={cn("rounded-lg border p-4 text-left transition-colors",
                    type === c.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                  <div className="flex items-center gap-2 font-medium"><c.icon className="h-4 w-4" /> {c.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card><CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSource("git")}
                className={cn("flex items-center gap-2 rounded-lg border px-3 py-3 text-sm",
                  source === "git" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <GitBranch className="h-4 w-4" /> Git repository
              </button>
              <button onClick={() => setSource("image")}
                className={cn("flex items-center gap-2 rounded-lg border px-3 py-3 text-sm",
                  source === "image" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                <Container className="h-4 w-4" /> Public Docker image
              </button>
            </div>
            {source === "git" ? (
              <>
                <Field label="Repository URL"><Input value={form.repo} onChange={(e) => update("repo", e.target.value)} placeholder="https://github.com/your-org/repo" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Branch"><Input value={form.branch} onChange={(e) => update("branch", e.target.value)} /></Field>
                  <Field label="Root directory (optional)"><Input value={form.rootDir} onChange={(e) => update("rootDir", e.target.value)} placeholder="apps/api" /></Field>
                </div>
              </>
            ) : (
              <Field label="Docker image"><Input value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="docker.io/library/nginx:latest" /></Field>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
              <Button onClick={() => setStep(3)}>Continue</Button>
            </div>
          </CardContent></Card>
        )}

        {step === 3 && (
          <Card><CardContent className="space-y-4 p-5">
            <Field label="Name"><Input value={form.name} onChange={(e) => update("name", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="my-api" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Runtime">
                <Select value={form.runtime} onValueChange={(v) => update("runtime", v as Runtime)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["node", "python", "ruby", "go", "rust", "elixir", "docker", "image", "static"] as Runtime[]).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Region">
                <Select value={form.region} onValueChange={(v) => update("region", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["oregon", "frankfurt", "ohio", "singapore", "virginia"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Plan">
                <Select value={form.plan} onValueChange={(v) => update("plan", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["starter", "standard", "pro", "pro_plus"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {(type === "web_service" || type === "private_service" || type === "background_worker") && source === "git" && (
              <>
                <Field label="Build command"><Input value={form.buildCommand} onChange={(e) => update("buildCommand", e.target.value)} placeholder="npm ci && npm run build" /></Field>
                <Field label="Start command"><Input value={form.startCommand} onChange={(e) => update("startCommand", e.target.value)} placeholder="node dist/server.js" /></Field>
              </>
            )}
            {type === "cron_job" && (
              <Field label="Schedule (CRON)"><Input value={form.scheduleCron} onChange={(e) => update("scheduleCron", e.target.value)} placeholder="0 * * * *" /></Field>
            )}
            {type === "web_service" && (
              <Field label="Health check path"><Input value={form.healthCheckPath} onChange={(e) => update("healthCheckPath", e.target.value)} placeholder="/healthz" /></Field>
            )}
            <Field label="Render owner ID">
              <Input value={form.ownerId} onChange={(e) => update("ownerId", e.target.value)} placeholder="tea-…" />
              <p className="mt-1 text-[11px] text-muted-foreground">Identifier of the Render workspace that should host this service.</p>
            </Field>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-3.5 w-3.5" /> Back</Button>
              <Button onClick={() => m.mutate()} disabled={m.isPending || !form.name || !form.ownerId}>
                {m.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Create service
              </Button>
            </div>
          </CardContent></Card>
        )}
      </PageContent>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
