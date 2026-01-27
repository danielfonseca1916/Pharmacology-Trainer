"use client";

import { useState } from "react";
import { content, searchContent } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useRouter } from "next/navigation";

export default function DrugsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { t, language } = useI18n();

  const results = search.trim() ? searchContent(search) : { drugs: content.drugs, questions: [], cases: [] };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t.nav.drugs}</h1>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline"
        >
          ← {t.common.back}
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder={t.drugs.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6">
        {results.drugs.map((drug) => (
          <div key={drug.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {language === "en" ? drug.name.en : drug.name.cs}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {language === "en" ? drug.class.en : drug.class.cs}
            </p>
            <div className="space-y-2 text-sm text-gray-700 mb-4">
              <p>
                <span className="font-semibold">{t.drugs.indications}:</span>{" "}
                {language === "en" ? drug.indications.en : drug.indications.cs}
              </p>
              <p>
                <span className="font-semibold">{t.drugs.mechanism}:</span>{" "}
                {language === "en" ? drug.mechanism.en : drug.mechanism.cs}
              </p>
              <p>
                <span className="font-semibold">{t.drugs.adverseEffects}:</span>{" "}
                {language === "en" ? drug.adverseEffects.en : drug.adverseEffects.cs}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {drug.tags.map((tag) => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {results.drugs.length === 0 && search && (
        <div className="text-center py-12 text-gray-600">
          {t.common.error} - No drugs found
        </div>
      )}
    </div>
  );
}
