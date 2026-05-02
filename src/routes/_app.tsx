import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppGuard,
});

function AppGuard() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <AppLayout />;
}
