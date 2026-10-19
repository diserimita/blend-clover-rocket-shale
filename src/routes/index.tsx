import { createFileRoute } from "@tanstack/react-router";
import { HolmesTimeline } from "@/components/holmes-timeline";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <HolmesTimeline />;
}
