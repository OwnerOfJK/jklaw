import { NextResponse } from 'next/server';
import { listNotes, getNote, saveNote } from '@/lib/notes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (id) {
    const note = await getNote(id);
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json(note);
  }
  
  const notes = await listNotes();
  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  try {
    const { id, content } = await request.json();
    
    if (!id || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: id and content required' },
        { status: 400 }
      );
    }
    
    const note = await saveNote(id, content);
    return NextResponse.json(note);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}
