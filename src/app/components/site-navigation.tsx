import Link from "next/link";

const linkClassName =
  "rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white";

export function SiteNavigation() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3"
      >
        <Link
          className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white"
          href="/"
        >
          NFA Platform
        </Link>
        <div className="flex items-center gap-2">
          <Link className={linkClassName} href="/">
            Home
          </Link>
          <Link className={linkClassName} href="/login">
            Sign in
          </Link>
          <Link
            className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            href="/register"
          >
            Create account
          </Link>
        </div>
      </nav>
    </header>
  );
}
