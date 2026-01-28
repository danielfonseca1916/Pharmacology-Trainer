"use client";

import { content } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AECIModule() {
  const { t, language } = useI18n();
  const params = useSearchParams();
  const block = params.get("block") || undefined;

  const drugs = block ? content.drugs.filter((d) => d.courseBlockId === block) : content.drugs;
  const [index, setIndex] = useState(0);
  const [showAE, setShowAE] = useState(false);
  const [showCI, setShowCI] = useState(false);

  const current = drugs[index];
  const next = () => {
    setIndex((i) => (i + 1) % drugs.length);
    setShowAE(false);
    setShowCI(false);
  };

  if (!current) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{t.modules.ae_ci}</h1>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-600">No drugs available for this section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.modules.ae_ci}</h1>
      <div className="bg-white shadow rounded p-6">
        <div className="mb-2">
          <div className="text-2xl font-bold">
            {language === "en" ? current.name.en : current.name.cs}
          </div>
          <div className="text-gray-600">
            {language === "en" ? current.class.en : current.class.cs}
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowAE((v) => !v)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {showAE ? "Hide" : "Show"} Adverse Effects
          </button>
          <button
            onClick={() => setShowCI((v) => !v)}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {showCI ? "Hide" : "Show"} Contraindications
          </button>
          <button onClick={next} className="px-4 py-2 bg-gray-800 text-white rounded">
            Next
          </button>
        </div>
        {showAE && (
          <div className="mb-4 p-4 bg-yellow-50 border rounded">
            <h3 className="font-semibold mb-2">Adverse Effects</h3>
            <p>{language === "en" ? current.adverseEffects.en : current.adverseEffects.cs}</p>
          </div>
        )}
        {showCI && (
          <div className="p-4 bg-red-50 border rounded">
            <h3 className="font-semibold mb-2">Contraindications</h3>
            <p>{language === "en" ? current.contraindications.en : current.contraindications.cs}</p>
          </div>
        )}
      </div>
    </div>
  );
}
