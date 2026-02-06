import { html, nothing } from "lit";
import type { NotesFile } from "../controllers/notes.ts";

export type NotesProps = {
  loading: boolean;
  files: NotesFile[];
  currentPath: string | null;
  currentContent: string;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectFile: (path: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onCreate: () => void;
};

export function renderNotesView(props: NotesProps) {
  return html`
    <div class="notes-view" style="display: flex; height: 100%; flex-direction: column;">
      <div class="notes-header" style="padding: 1rem; border-bottom: 1px solid var(--border-color, #e5e7eb); background: var(--bg-secondary, #f9fafb);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="margin: 0; font-size: 1.25rem;">Collaborative Notes</h2>
          <div style="display: flex; gap: 0.5rem;">
            <button
              @click=${props.onRefresh}
              ?disabled=${props.loading}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              ${props.loading ? "Loading..." : "Refresh"}
            </button>
            <button
              @click=${props.onCreate}
              ?disabled=${props.loading}
              style="padding: 0.5rem 1rem; cursor: pointer;"
            >
              New Note
            </button>
          </div>
        </div>
        ${props.error ? html`<div style="color: red; margin-top: 0.5rem;">${props.error}</div>` : nothing}
      </div>

      <div style="display: flex; flex: 1; overflow: hidden;">
        <!-- File list -->
        <div style="width: 250px; border-right: 1px solid var(--border-color, #e5e7eb); overflow-y: auto; background: var(--bg-secondary, #f9fafb);">
          ${props.files.length === 0
            ? html`<div style="padding: 1rem; color: #6b7280;">No notes yet. Create one to get started!</div>`
            : html`
                <ul style="list-style: none; margin: 0; padding: 0;">
                  ${props.files.map(
                    (file) => html`
                      <li
                        @click=${() => props.onSelectFile(file.path)}
                        style="padding: 0.75rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-color, #e5e7eb); background: ${file.path ===
                        props.currentPath
                          ? "var(--bg-active, #e0e7ff)"
                          : "transparent"};"
                      >
                        <div style="font-weight: 500;">${file.name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">
                          ${new Date(file.modified).toLocaleDateString()}
                        </div>
                      </li>
                    `,
                  )}
                </ul>
              `}
        </div>

        <!-- Editor -->
        <div style="flex: 1; display: flex; flex-direction: column;">
          ${props.currentPath
            ? html`
                <div style="padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color, #e5e7eb); display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 500;">${props.currentPath}</span>
                  <button
                    @click=${props.onSave}
                    ?disabled=${!props.dirty || props.saving}
                    style="padding: 0.5rem 1rem; cursor: pointer; ${props.dirty ? 'background: #3b82f6; color: white; border: none;' : ''}"
                  >
                    ${props.saving ? "Saving..." : props.dirty ? "Save *" : "Saved"}
                  </button>
                </div>
                <textarea
                  .value=${props.currentContent}
                  @input=${(e: Event) => props.onContentChange((e.target as HTMLTextAreaElement).value)}
                  style="flex: 1; border: none; padding: 1rem; font-family: monospace; resize: none; outline: none;"
                  placeholder="Start writing..."
                ></textarea>
              `
            : html`
                <div style="flex: 1; display: flex; align-items: center; justify-content: center; color: #6b7280;">
                  Select a note or create a new one
                </div>
              `}
        </div>
      </div>
    </div>
  `;
}
