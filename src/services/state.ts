import { randomBytes } from "node:crypto";
import { RequestWithSession } from "../types/session";

export function setState(req: RequestWithSession) {
  const state: string = randomBytes(32).toString("hex");
  req.session.state = state;
  return state
}

export function checkState(req: RequestWithSession, query_state: string) {
  if (req.session.state !== query_state) {
    throw new Error("State Mismatch, Potential CSRF Attack")
  }
}
