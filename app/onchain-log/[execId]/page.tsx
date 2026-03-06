import { OnchainRescueDetailView } from "@/components/onchain-log/OnchainRescueDetailView";

export default async function OnchainRescueDetailPage({
  params,
}: {
  params: Promise<{ execId: string }>;
}) {
  const { execId } = await params;

  return <OnchainRescueDetailView execId={execId} />;
}
