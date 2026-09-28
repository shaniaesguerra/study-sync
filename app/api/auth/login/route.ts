import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { createSession, publicUser, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { connectDB, toUser, User as UserModel } from "@/lib/mongo";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: string; password?: string };
  const normalizedEmail = (email ?? "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  await connectDB();
  const doc = await UserModel.findOne({ email: normalizedEmail }).lean();
  const user = doc ? toUser(doc) : null;
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const session = await createSession(user.id);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return NextResponse.json({ user: publicUser(user) });
}