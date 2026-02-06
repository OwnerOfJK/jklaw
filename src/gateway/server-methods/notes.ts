import type { GatewayRequestHandlers } from "./types.js";
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../../agents/agent-scope.js";
import { listNotes, readNote, writeNote } from "../notes.js";
import { ErrorCodes, errorShape } from "../protocol/index.js";

export const notesMethods: GatewayRequestHandlers = {
  "notes.list": async ({ params, respond, state }) => {
    try {
      const agentId = resolveDefaultAgentId(state.config);
      const workspacePath = resolveAgentWorkspaceDir(state.config, agentId);
      const result = await listNotes(workspacePath);
      respond({ ok: true, payload: result });
    } catch (err) {
      respond(errorShape(ErrorCodes.InternalError, String(err)));
    }
  },

  "notes.read": async ({ params, respond, state }) => {
    try {
      const path = (params as { path?: unknown })?.path;
      if (typeof path !== "string" || !path) {
        respond(errorShape(ErrorCodes.InvalidParams, "path is required"));
        return;
      }

      const agentId = resolveDefaultAgentId(state.config);
      const workspacePath = resolveAgentWorkspaceDir(state.config, agentId);
      const result = await readNote(workspacePath, path);
      respond({ ok: true, payload: result });
    } catch (err) {
      respond(errorShape(ErrorCodes.InternalError, String(err)));
    }
  },

  "notes.write": async ({ params, respond, state }) => {
    try {
      const path = (params as { path?: unknown })?.path;
      const content = (params as { content?: unknown })?.content;

      if (typeof path !== "string" || !path) {
        respond(errorShape(ErrorCodes.InvalidParams, "path is required"));
        return;
      }

      if (typeof content !== "string") {
        respond(errorShape(ErrorCodes.InvalidParams, "content must be a string"));
        return;
      }

      const agentId = resolveDefaultAgentId(state.config);
      const workspacePath = resolveAgentWorkspaceDir(state.config, agentId);
      const result = await writeNote(workspacePath, { path, content });
      respond({ ok: true, payload: result });
    } catch (err) {
      respond(errorShape(ErrorCodes.InternalError, String(err)));
    }
  },
};
