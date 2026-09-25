import { getSession, type SessionContext } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/auth/errors";

export { ForbiddenError };

export async function requireDoctor(): Promise<SessionContext> {
  const session = await getSession();
  if (session.role !== "doctor") {
    throw new ForbiddenError();
  }
  return session;
}
