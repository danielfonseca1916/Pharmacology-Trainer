"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { content } from "@/lib/content";

export default function MOAModule() {
  const { t, language } = useI18n();
  const params = useSearchParams();
  const block = params.get("block") || undefined;

  const drugs = (block ? content.drugs.filter((d) => d.courseBlockId === block) : content.drugs);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = drugs[index];
  const next = () => { setIndex((i) => (i + 1) % drugs.length); setRevealed(false); };
  const prev = () => { setIndex((i) => (i - 1 + drugs.length) % drugs.length); setRevealed(false); };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.modules.moa}</h1>
      <div className="bg-white shadow rounded p-6">
        <div className="mb-4">
          <div className="text-3xl font-bold">{language === "en" ? current.name.en : current.name.cs}</div>
          <div className="text-gray-600">{language === "en" ? current.class.en : current.class.cs}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Mechanism of Action</div>
          {!revealed ? (
            <div className="p-4 bg-gray-50 border rounded text-gray-500">Hidden — click Reveal</div>
          ) : (
            <div className="p-4 bg-green-50 border rounded">{language === "en" ? current.mechanism.en : current.mechanism.cs}</div>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setRevealed(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Reveal</button>
          <button onClick={prev} className="px-4 py-2 bg-gray-800 text-white rounded">Prev</button>
          <button onClick={next} className="px-4 py-2 bg-gray-800 text-white rounded">Next</button>
        </div>
      </div>
    </div>
  );
}
