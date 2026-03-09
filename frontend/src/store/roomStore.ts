import { create } from "zustand";
import type { Room, Category, Topic } from "../types";
import api from "../api/axios";
import type { AxiosError } from "axios";

function extractErrorMessage(err: unknown, fallback: string): string {
  const error = err as AxiosError<Record<string, string[]> | { detail?: string }>;
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === "object" && "detail" in data && typeof data.detail === "string") {
    return data.detail;
  }
  const messages: string[] = [];
  for (const [field, errors] of Object.entries(data)) {
    if (Array.isArray(errors)) {
      messages.push(`${field}: ${errors.join(", ")}`);
    }
  }
  return messages.length > 0 ? messages.join("; ") : fallback;
}

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  categories: Category[];
  topics: Topic[];
  isLoading: boolean;
  error: string | null;

  fetchRooms: (topicSlugs?: string[]) => Promise<void>;
  fetchRoom: (uuid: string) => Promise<void>;
  createRoom: (formData: FormData) => Promise<Room>;
  updateRoom: (uuid: string, formData: FormData) => Promise<Room>;
  deleteRoom: (uuid: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTopics: () => Promise<void>;
  clearError: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  currentRoom: null,
  categories: [],
  topics: [],
  isLoading: false,
  error: null,

  fetchRooms: async (topicSlugs) => {
    set({ isLoading: true, error: null });
    try {
      const params = topicSlugs?.length ? `?topic=${topicSlugs.join(",")}` : "";
      const res = await api.get<Room[]>(`rooms/${params}`);
      set({ rooms: res.data, isLoading: false });
    } catch (err) {
      set({ error: extractErrorMessage(err, "Failed to fetch rooms"), isLoading: false });
    }
  },

  fetchRoom: async (uuid) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Room>(`rooms/${uuid}/`);
      set({ currentRoom: res.data, isLoading: false });
    } catch (err) {
      set({ error: extractErrorMessage(err, "Failed to fetch room"), isLoading: false });
    }
  },

  createRoom: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<Room>("rooms/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        rooms: [res.data, ...state.rooms],
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: extractErrorMessage(err, "Failed to create room"), isLoading: false });
      throw err;
    }
  },

  updateRoom: async (uuid, formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.patch<Room>(`rooms/${uuid}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set((state) => ({
        rooms: state.rooms.map((r) => (r.uuid === uuid ? res.data : r)),
        currentRoom: res.data,
        isLoading: false,
      }));
      return res.data;
    } catch (err) {
      set({ error: extractErrorMessage(err, "Failed to update room"), isLoading: false });
      throw err;
    }
  },

  deleteRoom: async (uuid) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`rooms/${uuid}/`);
      set((state) => ({
        rooms: state.rooms.filter((r) => r.uuid !== uuid),
        currentRoom: null,
        isLoading: false,
      }));
    } catch (err) {
      set({ error: extractErrorMessage(err, "Failed to delete room"), isLoading: false });
      throw err;
    }
  },

  fetchCategories: async () => {
    try {
      const res = await api.get<Category[]>("categories/");
      set({ categories: res.data });
    } catch {
      // silent
    }
  },

  fetchTopics: async () => {
    try {
      const res = await api.get<Topic[]>("topics/");
      set({ topics: res.data });
    } catch {
      // silent
    }
  },

  clearError: () => set({ error: null }),
}));
