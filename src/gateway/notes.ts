import fs from "node:fs/promises";
import path from "node:path";

export type NotesListResult = {
  files: Array<{ name: string; path: string; size: number; modified: number }>;
};

export type NotesReadResult = {
  content: string;
  path: string;
};

export type NotesWriteParams = {
  path: string;
  content: string;
};

export async function listNotes(workspacePath: string): Promise<NotesListResult> {
  const notesDir = path.join(workspacePath, "notes");
  
  try {
    await fs.access(notesDir);
  } catch {
    // Create notes dir if it doesn't exist
    await fs.mkdir(notesDir, { recursive: true });
    return { files: [] };
  }

  const entries = await fs.readdir(notesDir, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map(async (entry) => {
        const fullPath = path.join(notesDir, entry.name);
        const stats = await fs.stat(fullPath);
        return {
          name: entry.name,
          path: `notes/${entry.name}`,
          size: stats.size,
          modified: stats.mtimeMs,
        };
      }),
  );

  return { files: files.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function readNote(workspacePath: string, notePath: string): Promise<NotesReadResult> {
  // Validate path to prevent directory traversal
  if (notePath.includes("..") || !notePath.startsWith("notes/")) {
    throw new Error("Invalid note path");
  }

  const fullPath = path.join(workspacePath, notePath);
  const content = await fs.readFile(fullPath, "utf-8");
  
  return { content, path: notePath };
}

export async function writeNote(
  workspacePath: string,
  params: NotesWriteParams,
): Promise<{ success: boolean }> {
  // Validate path
  if (params.path.includes("..") || !params.path.startsWith("notes/")) {
    throw new Error("Invalid note path");
  }

  const fullPath = path.join(workspacePath, params.path);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(fullPath, params.content, "utf-8");

  return { success: true };
}
