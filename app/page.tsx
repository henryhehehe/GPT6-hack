import Classroom from "@/components/worlds/Classroom";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  // Preserve the direct entry point used by existing student invitations.
  if (typeof query.join === "string" && typeof query.class === "string") return <Classroom />;
  return <LandingPage />;
}
