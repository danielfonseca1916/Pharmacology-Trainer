"use client";
export const dynamic = "force-dynamic";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useI18n } from "@/lib/i18n";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorId] = useState("login-error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        setError(t.auth.invalidCredentials);
      }
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">PharmTrainer</h1>
          <LanguageToggle />
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">{t.auth.signIn}</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t.auth.email}
            </label>
            <input
              id="email"
              data-testid="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="demo@pharmtrainer.test"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition"
              required
              aria-required="true"
              aria-describedby={error ? errorId : undefined}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t.auth.password}
            </label>
            <input
              id="password"
              data-testid="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password123!"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition"
              required
              aria-required="true"
              aria-describedby={error ? errorId : undefined}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              id={errorId}
              className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            data-testid="login-button"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-busy={loading}
          >
            {loading ? t.common.loading : t.auth.signIn}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          {t.auth.noAccount}{" "}
          <Link
            href="/register"
            className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
          >
            {t.auth.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
