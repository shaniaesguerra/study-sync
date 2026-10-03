import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";

const PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "github", label: "Continue with GitHub" },
] as const;

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Sign-in is not configured yet. Add your OAuth credentials to .env.local.",
  AccessDenied: "That account is not allowed to sign in to StudySync.",
  OAuthAccountNotLinked: "That email is already registered with a different sign-in method.",
  OAuthCallback: "The sign-in provider returned an error. Please try again.",
};

export default function SignInPanel({ error }: { error?: string }) {
  const message = error ? (ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          StudySync
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          One course hub for study materials. Sign in to get started.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {message && (
          <p
            role="alert"
            className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300"
          >
            {message}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {PROVIDERS.map((provider) => (
            <form
              key={provider.id}
              action={async () => {
                "use server";
                try {
                  await signIn(provider.id, { redirectTo: "/" });
                } catch (error) {
                  if (error instanceof AuthError) {
                    redirect(`/?error=${error.type}`);
                  }
                  throw error;
                }
              }}
            >
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500"
              >
                {provider.label}
              </button>
            </form>
          ))}
        </div>

        <p className="mt-5 text-xs text-zinc-500 dark:text-zinc-400">
          StudySync never sees your provider password. Your display name and email come from the
          provider you choose.
        </p>
      </div>
    </main>
  );
}