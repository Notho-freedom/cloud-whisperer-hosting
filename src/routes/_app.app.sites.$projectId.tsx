import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/app/sites/$projectId")({
  head: ({ params }) => ({ meta: [{ title: `${params.projectId} | Hostiq` }] }),
  component: () => <Outlet />,
});
