import { auth } from "@/auth";
import { connectDB, toUser, User as UserModel } from "./mongo";
import type { User } from "./types";

export async function getSessionUser(): Promise<User | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  await connectDB();
  const user = await UserModel.findById(userId).lean();
  return user ? toUser(user) : null;
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
  };
}