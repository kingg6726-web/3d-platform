"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StartCreatingButton() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsLoggedIn(!!user);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <span className="inline-flex h-12 items-center justify-center rounded-full border border-theme px-7 text-sm font-medium text-foreground">
        Start creating
      </span>
    );
  }

  return (
    <a
      href={isLoggedIn ? "/profile" : "/signup"}
      className="inline-flex h-12 items-center justify-center rounded-full border border-theme px-7 text-sm font-medium text-foreground transition-colors hover:bg-surface"
    >
      Start creating
    </a>
  );
}