"use client";

import { useState } from "react";

export function BookmarkButton({
  toolId,
  modelId,
  initiallyBookmarked = false,
}: {
  toolId?: string;
  modelId?: string;
  initiallyBookmarked?: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initiallyBookmarked);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    setMessage(null);
    try {
      if (bookmarked) {
        const params = new URLSearchParams(
          toolId ? { toolId } : { modelId: modelId! },
        );
        const response = await fetch(`/api/bookmarks?${params}`, {
          method: "DELETE",
        });
        if (response.status === 401) {
          setMessage("Log in to manage bookmarks.");
          return;
        }
        if (!response.ok) {
          const data = await response.json();
          setMessage(data.error ?? "Could not remove bookmark");
          return;
        }
        setBookmarked(false);
      } else {
        const response = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toolId ? { toolId } : { modelId }),
        });
        if (response.status === 401) {
          setMessage("Log in to save bookmarks.");
          return;
        }
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.error ?? "Could not bookmark");
          return;
        }
        setBookmarked(true);
      }
    } catch {
      setMessage("Network error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="bookmark-wrap">
      <button
        type="button"
        className={bookmarked ? "btn primary" : "btn ghost"}
        onClick={toggle}
        disabled={pending}
      >
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </button>
      {message ? <p className="muted small">{message}</p> : null}
    </div>
  );
}
