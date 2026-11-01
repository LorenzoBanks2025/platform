This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## App structure

- `src/app/page.tsx` defines the `/` route and renders its page from `src/app/pages/`.
- `src/app/pages/` contains route page components.
- `src/app/components/` contains UI components used by pages.
- `src/app/components/site-navigation.tsx` provides shared links between app routes.
- The `/login` and `/register` routes render the authentication forms.
- Keep Next.js route entry files such as `page.tsx`, `layout.tsx`, and API `route.ts` files in their route directories.

## Authentication API

- `POST /api/auth/register` accepts `firstName`, `lastName`, `email`, and `password`.
- `POST /api/auth/login` accepts `email` and `password`.
- `POST /api/auth/logout` revokes the current session.
- `GET /api/auth/me` returns the current user or `401` when signed out.

Successful registration and login set an HttpOnly, SameSite=Lax session cookie.
Passwords must contain at least 12 characters. Sessions expire after seven days;
the database stores only a hash of each opaque session token. Public registration
creates regular user accounts, not administrators.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
