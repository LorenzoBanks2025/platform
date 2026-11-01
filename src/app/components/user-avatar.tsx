"use client";

import { useState } from "react";

type UserAvatarProps = {
  name: string;
  avatarUrl: string | null;
  gravatarUrl?: string | null;
  size?: "small" | "large";
};

function getSafeAvatarUrl(avatarUrl: string | null): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  try {
    const url = new URL(avatarUrl);
    return url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function UserAvatar({
  name,
  avatarUrl,
  gravatarUrl,
  size = "small",
}: UserAvatarProps) {
  const imageUrl =
    getSafeAvatarUrl(avatarUrl) ?? getSafeAvatarUrl(gravatarUrl ?? null);
  const [failedImageUrl, setFailedImageUrl] = useState<string>();
  const sizeClassName =
    size === "large" ? "size-24 text-3xl" : "size-9 text-sm";

  return (
    <span
      aria-label={`${name}'s avatar`}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100 ${sizeClassName}`}
      role="img"
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
      {imageUrl && imageUrl !== failedImageUrl && (
        // biome-ignore lint/performance/noImgElement: User-provided avatar URLs must bypass Next's image optimizer.
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedImageUrl(imageUrl)}
          referrerPolicy="no-referrer"
          src={imageUrl}
        />
      )}
    </span>
  );
}
