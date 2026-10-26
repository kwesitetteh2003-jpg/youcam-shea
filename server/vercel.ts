// Vercel serverless entry. All /api/* routes are rewritten here (see vercel.json).
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHandler } from "./core";
const handle = createHandler();
export default function handler(req: IncomingMessage, res: ServerResponse) { return handle(req, res); }
