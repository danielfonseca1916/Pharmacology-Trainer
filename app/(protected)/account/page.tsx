"use client";

import { useSession, signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function Account() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t.nav.account}</h1>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">
          ← {t.common.back}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <p className="text-gray-600 text-sm">Email</p>
          <p className="text-xl font-semibold text-gray-800">{session?.user?.email}</p>
        </div>

        <button
          onClick={() => signOut({ redirect: true })}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
        >
          {t.nav.logout}
        </button>
      </div>
    </div>
  );
}
