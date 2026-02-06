import type { GatewayBrowserClient } from "../gateway.ts";

export type NotesFile = {
  name: string;
  path: string;
  size: number;
  modified: number;
};

export type NotesState = {
  client: GatewayBrowserClient | null;
  connected: boolean;
  notesLoading: boolean;
  notesList: NotesFile[];
  currentNotePath: string | null;
  currentNoteContent: string;
  currentNoteOriginal: string;
  notesDirty: boolean;
  notesSaving: boolean;
  lastError: string | null;
};

export async function loadNotesList(state: NotesState) {
  if (!state.client || !state.connected) {
    return;
  }
  state.notesLoading = true;
  state.lastError = null;
  try {
    const res = await state.client.request<{ files: NotesFile[] }>("notes.list", {});
    state.notesList = res.files;
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.notesLoading = false;
  }
}

export async function loadNote(state: NotesState, path: string) {
  if (!state.client || !state.connected) {
    return;
  }
  state.notesLoading = true;
  state.lastError = null;
  try {
    const res = await state.client.request<{ content: string; path: string }>("notes.read", {
      path,
    });
    state.currentNotePath = res.path;
    state.currentNoteContent = res.content;
    state.currentNoteOriginal = res.content;
    state.notesDirty = false;
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.notesLoading = false;
  }
}

export async function saveNote(state: NotesState) {
  if (!state.client || !state.connected || !state.currentNotePath) {
    return;
  }
  state.notesSaving = true;
  state.lastError = null;
  try {
    await state.client.request("notes.write", {
      path: state.currentNotePath,
      content: state.currentNoteContent,
    });
    state.currentNoteOriginal = state.currentNoteContent;
    state.notesDirty = false;
    // Reload list to update modified time
    await loadNotesList(state);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.notesSaving = false;
  }
}

export async function createNote(state: NotesState, name: string) {
  if (!state.client || !state.connected) {
    return;
  }
  const path = `notes/${name}`;
  state.notesSaving = true;
  state.lastError = null;
  try {
    await state.client.request("notes.write", {
      path,
      content: "# " + name.replace(".md", "") + "\n\n",
    });
    await loadNotesList(state);
    await loadNote(state, path);
  } catch (err) {
    state.lastError = String(err);
  } finally {
    state.notesSaving = false;
  }
}
