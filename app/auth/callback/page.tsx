"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      );

      if (error) {
        console.error("OAuth error:", error.message);
        return;
      }

      router.replace("/list"); // your protected page
    };

    handleCallback();
  }, []);

  return <p>Signing you in...</p>;
}
