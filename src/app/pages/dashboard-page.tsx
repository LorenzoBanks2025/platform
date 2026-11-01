import Link from "next/link";
import type { AuthenticatedUser } from "@/server/authentication";

type DashboardProps = {
  user: AuthenticatedUser;
};

export default function Dashboard({ user }: DashboardProps) {
  const isAdmin = user.role === "admin";
  const displayName = `${user.firstName} ${user.lastName}`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          NFA Platform
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Welcome back, {displayName}.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Your access level
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
            {isAdmin ? "Administrator" : "Standard user"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {isAdmin
              ? "You have access to all staff features, including administrator-only options."
              : "You have access to standard staff features and your profile. Some options are reserved for administrators."}
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Account
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-white">
            {displayName}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {user.email}
          </p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-zinc-900 underline underline-offset-4 dark:text-white"
            href="/profile"
          >
            Manage your profile
          </Link>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
        <h2 className="font-semibold text-zinc-950 dark:text-white">
          Workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your organization dashboard is ready. Workspace features will appear
          here as they are added.
        </p>
      </section>

      {isAdmin && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
            Administrator options
          </p>
          <h2 className="mt-2 font-semibold text-zinc-950 dark:text-white">
            Organization management
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Administrator-only controls will be available here as organization
            management features are added.
          </p>
        </section>
      )}
    </main>
  );
}
