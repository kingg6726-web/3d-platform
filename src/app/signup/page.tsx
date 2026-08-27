"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    const username = `user_${randomNumber}`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/signin`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `Account created. Your username is ${username}. Check your email to confirm your account.`
      );
      setEmail("");
      setPassword("");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-24 text-white">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            3D Marketplace
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Create account
          </h1>

          <p className="mt-4 text-zinc-500">
            Create an account to start uploading and managing your assets.
          </p>
        </div>

        <form
          onSubmit={handleSignUp}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white outline-none transition focus:border-white/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Password
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-xl border border-white/10 bg-black px-4 text-white outline-none transition focus:border-white/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-white px-6 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          {message && (
            <p className="text-sm leading-6 text-zinc-400">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}