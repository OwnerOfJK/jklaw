import { NextResponse } from 'next/server';
import { listNotes, getNote, saveNote, deleteNote } from '@/lib/notes';

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID required' },
        { status: 400 }
      );
    }
    
    const success = await deleteNote(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
