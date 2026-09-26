import { cookies } from "next/headers";
import type { AxiosResponse } from "axios";
import { api } from "./api";
import type { CheckSessionResponse, FetchNotesParams, FetchNotesResponse } from "./clientApi";
import type { Note } from "@/types/note";
import type { User } from "@/types/user";

const getCookieHeader = async () => {
  const cookieStore = await cookies();
  return { Cookie: cookieStore.toString() };
};

export const fetchNotes = async ({
  page,
  perPage = 12,
  search = "",
  tag,
}: FetchNotesParams): Promise<FetchNotesResponse> => {
  const response = await api.get<FetchNotesResponse>("/notes", {
    params: {
      page,
      perPage,
      ...(search !== "" && { search }),
      ...(tag && { tag }),
    },
    headers: await getCookieHeader(),
  });
  return response.data;
};

export const fetchNoteById = async (id: string): Promise<Note> => {
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: await getCookieHeader(),
  });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await api.get<User>("/users/me", {
    headers: await getCookieHeader(),
  });
  return response.data;
};

// Returns the full response so that proxy can read refreshed cookies from its headers
export const checkSession = async (): Promise<AxiosResponse<CheckSessionResponse>> => {
  return api.get<CheckSessionResponse>("/auth/session", {
    headers: await getCookieHeader(),
  });
};
