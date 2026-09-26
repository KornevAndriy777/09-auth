import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchNotes } from "@/lib/api/serverApi";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
import type { NoteTag } from "@/types/note";
import NotesClient from "./Notes.client";

export const dynamic = "force-dynamic";

interface NotesProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: NotesProps): Promise<Metadata> {
  const { slug } = await params;
  const filter = slug[0] === "all" ? "All notes" : `${slug[0]} notes`;
  const title = `${filter} | NoteHub`;
  const description =
    slug[0] === "all"
      ? "Browse all your notes in NoteHub."
      : `Browse notes tagged "${slug[0]}" in NoteHub.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/notes/filter/${slug.join("/")}`,
      images: [OG_IMAGE],
    },
  };
}

export default async function Notes({ params }: NotesProps) {
  const { slug } = await params;
  const tag = slug[0] === "all" ? undefined : (slug[0] as NoteTag);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["notes", 1, "", tag],
    queryFn: () => fetchNotes({ page: 1, search: "", tag }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
