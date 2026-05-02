import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_admin")({
  component: AdminGuard,
});

function AdminGuard() {
  const { isAuthenticated, hasRole, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!hasRole("admin")) return <Navigate to="/app" />;
  return <AdminLayout />;
}
