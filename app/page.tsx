import Dashboard from "@/app/components/dashboard";
import MyTasks from "@/app/components/my-tasks";
import SignInPanel from "@/app/components/sign-in-panel";
import SignOutButton from "@/app/components/sign-out-button";
import { getSessionUser } from "@/lib/auth";
import { listCourseViews } from "@/lib/courses";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);

  if (!user) {
    const error = typeof params.error === "string" ? params.error : undefined;
    return <SignInPanel error={error} />;
  }

  const courses = await listCourseViews(user.id);

  return (
    <Dashboard
      user={{ id: user.id, email: user.email, displayName: user.displayName }}
      courses={courses}
      headerAction={<SignOutButton />}
      myTasks={<MyTasks userId={user.id} />}
    />
  );
}