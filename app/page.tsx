"use client";

import { supabase } from "@/lib/supabaseClient";

export default function Home() {

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        flowType: "pkce",
      },
    });
  };

  return (
    <div>
      <h1>Hello World</h1>

      <button onClick={loginWithGoogle}>
        Continue with Google
      </button>
    </div>
  );
}
