"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Modal from "@/components/Modal/Modal";
import { fetchNoteById } from "@/lib/api/clientApi";
import css from "./NotePreview.module.css";

export default function NotePreviewClient() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const {
    data: note,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["note", id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal onClose={handleClose}>
      {isLoading && <p>Loading, please wait...</p>}
      {(isError || (!isLoading && !note)) && <p>Something went wrong.</p>}
      {note && (
        <div className={css.container}>
          <div className={css.item}>
            <button className={css.backBtn} onClick={handleClose}>
              ← Back
            </button>
            <div className={css.header}>
              <h2>{note.title}</h2>
            </div>
            <p className={css.tag}>{note.tag}</p>
            <p className={css.content}>{note.content}</p>
            <p className={css.date}>Created: {note.createdAt.slice(0, 10)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
