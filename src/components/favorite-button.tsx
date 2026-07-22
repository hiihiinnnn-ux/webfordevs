"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

type Props = {
  itemType: "model" | "tool";
  itemId: string;
  initiallySaved?: boolean;
};

export function FavoriteButton({ itemType, itemId, initiallySaved = false }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(initiallySaved);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggle() {
    if (!user) {
      setMessage("Create an account to save items.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (saved) {
        const res = await fetch(
          `/api/favorites?itemType=${itemType}&itemId=${encodeURIComponent(itemId)}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Failed to remove");
        setSaved(false);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemType, itemId }),
        });
        if (!res.ok) throw new Error("Failed to save");
        setSaved(true);
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="favorite-wrap">
      <button
        type="button"
        className={saved ? "btn btn-secondary compact" : "btn btn-ghost compact"}
        onClick={() => void toggle()}
        disabled={busy}
      >
        {saved ? "Saved" : "Save"}
      </button>
      {message ? <span className="tiny muted">{message}</span> : null}
    </div>
  );
}
