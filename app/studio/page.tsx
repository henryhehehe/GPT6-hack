import Classroom from "@/components/worlds/Classroom";
import catalog from "@/lib/curriculum/catalog.json";

export default async function Studio({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const lessonId = typeof query.lesson === "string" && catalog.worlds.some(world => world.lessons.some(lesson => lesson.id === query.lesson)) ? query.lesson : undefined;
  return <Classroom initialLessonId={lessonId} />;
}
