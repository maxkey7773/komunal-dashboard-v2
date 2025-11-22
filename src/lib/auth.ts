import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "kd_session";

export type SessionUser = { id: string; username: string; role: "ADMIN" | "USER"; fullName: string };

export async function signIn(username: string, password: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return { id: user.id, username: user.username, role: user.role, fullName: user.fullName };
}

export function setSession(user: SessionUser) {
  const secret = process.env.SESSION_SECRET!;
  const token = jwt.sign(user, secret, { expiresIn: "7d" });
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/" });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export function getSession(): SessionUser | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as SessionUser;
  } catch {
    return null;
  }
}
