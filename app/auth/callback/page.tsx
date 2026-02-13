"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      await supabase.auth.getSession();
      router.replace("/list");
    };

    finishLogin();
  }, []);

  return <p>Signing you in...</p>;
}
