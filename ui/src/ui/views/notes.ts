import { html } from "lit";

export type NotesProps = {
  content: string;
};

export function renderNotesView(props: NotesProps) {
  return html`
    <div class="notes-view">
      <div class="notes-header">
        <h2>Notes</h2>
        <p>Collaborative notes workspace (coming soon)</p>
      </div>
      <div class="notes-content">
        <p>This tab will show collaborative notes between you and jklaw.</p>
      </div>
    </div>
  `;
}
