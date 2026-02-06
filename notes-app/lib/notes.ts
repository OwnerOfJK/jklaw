import fs from 'fs/promises';
import path from 'path';

const NOTES_DIR = process.env.NOTES_DIR || '/data/notes';

export interface Note {
  id: string;
  name: string;
  content: string;
  modified: number;
  size: number;
}

export async function ensureNotesDir() {
  try {
    await fs.access(NOTES_DIR);
  } catch {
    await fs.mkdir(NOTES_DIR, { recursive: true });
  }
}

export async function listNotes(): Promise<Omit<Note, 'content'>[]> {
  await ensureNotesDir();
  
  const files = await fs.readdir(NOTES_DIR);
  const notes = await Promise.all(
    files
      .filter(f => f.endsWith('.md'))
      .map(async (file) => {
        const filePath = path.join(NOTES_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          id: file.replace('.md', ''),
          name: file,
          modified: stats.mtimeMs,
          size: stats.size,
        };
      })
  );
  
  return notes.sort((a, b) => b.modified - a.modified);
}

export async function getNote(id: string): Promise<Note | null> {
  // Sanitize ID to prevent directory traversal
  const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitizedId) return null;
  
  const filePath = path.join(NOTES_DIR, `${sanitizedId}.md`);
  
  try {
    const [content, stats] = await Promise.all([
      fs.readFile(filePath, 'utf-8'),
      fs.stat(filePath),
    ]);
    
    return {
      id: sanitizedId,
      name: `${sanitizedId}.md`,
      content,
      modified: stats.mtimeMs,
      size: stats.size,
    };
  } catch {
    return null;
  }
}

export async function saveNote(id: string, content: string): Promise<Note> {
  await ensureNotesDir();
  
  const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitizedId) throw new Error('Invalid note ID');
  
  const filePath = path.join(NOTES_DIR, `${sanitizedId}.md`);
  await fs.writeFile(filePath, content, 'utf-8');
  
  const stats = await fs.stat(filePath);
  
  return {
    id: sanitizedId,
    name: `${sanitizedId}.md`,
    content,
    modified: stats.mtimeMs,
    size: stats.size,
  };
}

export async function deleteNote(id: string): Promise<boolean> {
  const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!sanitizedId) return false;
  
  const filePath = path.join(NOTES_DIR, `${sanitizedId}.md`);
  
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
