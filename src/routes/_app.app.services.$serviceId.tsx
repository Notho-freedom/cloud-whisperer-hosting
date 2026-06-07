import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/app/services/$serviceId")({
  head: () => ({ meta: [{ title: "Service | Hostiq" }] }),
  component: () => <Outlet />,
});
