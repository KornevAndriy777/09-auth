"use client";

import { useState, useSyncExternalStore } from "react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote } from "@/lib/api/clientApi";
import { initialDraft, useNoteStore } from "@/lib/store/noteStore";
import type { NoteDraft } from "@/lib/store/noteStore";
import css from "./NoteForm.module.css";

type FormErrors = Partial<Record<keyof NoteDraft, string>>;

const NoteSchema = Yup.object().shape({
  title: Yup.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters")
    .required("Title is required"),
  content: Yup.string().max(500, "Content must be at most 500 characters"),
  tag: Yup.string()
    .oneOf(["Todo", "Work", "Personal", "Meeting", "Shopping"], "Invalid tag")
    .required("Tag is required"),
});

const subscribe = () => () => {};

export default function NoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { draft, setDraft, clearDraft } = useNoteStore();
  const [errors, setErrors] = useState<FormErrors>({});

  // The draft lives in localStorage, so it is only available in the browser.
  // The server renders empty fields, and the form is re-mounted with the draft after hydration.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const values = isClient ? draft : initialDraft;

  const { mutate, isPending } = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes/filter/all");
    },
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setDraft({
      ...draft,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (formData: FormData) => {
    const newNote = {
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
      tag: formData.get("tag") as NoteDraft["tag"],
    };

    try {
      await NoteSchema.validate(newNote, { abortEarly: false });
      setErrors({});
      mutate(newNote);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const fieldErrors: FormErrors = {};
        error.inner.forEach(({ path, message }) => {
          if (path) fieldErrors[path as keyof NoteDraft] = message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form key={isClient ? "client" : "server"} className={css.form} action={handleSubmit}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          className={css.input}
          defaultValue={values.title}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={50}
        />
        {errors.title && <span className={css.error}>{errors.title}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          className={css.textarea}
          defaultValue={values.content}
          onChange={handleChange}
          maxLength={500}
        />
        {errors.content && <span className={css.error}>{errors.content}</span>}
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          className={css.select}
          defaultValue={values.tag}
          onChange={handleChange}
          required
        >
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
        {errors.tag && <span className={css.error}>{errors.tag}</span>}
      </div>

      <div className={css.actions}>
        <button type="button" className={css.cancelButton} onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={isPending}>
          Create note
        </button>
      </div>
    </form>
  );
}
