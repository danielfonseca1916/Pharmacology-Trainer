"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { content } from "@/lib/content";

export default function InteractionsModule() {
  const { t, language } = useI18n();
  const drugs = content.drugs;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedDrugs = useMemo(() => drugs.filter((d) => selectedIds.includes(d.id)), [selectedIds, drugs]);

  const matched = useMemo(() => {
    if (selectedIds.length === 0) return [];
    return content.interactions.filter((rule) => {
      const { appliesWhen } = rule;
      let match = false;
      if (appliesWhen.drugIds && appliesWhen.drugIds.some((id) => selectedIds.includes(id))) match = true;
      if (!match && appliesWhen.classes) {
        const selectedClasses = selectedDrugs.map((d) => d.class.en);
        if (appliesWhen.classes.some((c) => selectedClasses.includes(c))) match = true;
      }
      if (!match && appliesWhen.tags) {
        const selTags = new Set(selectedDrugs.flatMap((d) => d.tags));
        if (appliesWhen.tags.some((t) => selTags.has(t))) match = true;
      }
      return match;
    });
  }, [selectedIds, selectedDrugs]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.modules.interactions}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="font-semibold mb-2">Select Drugs</h2>
          <div className="bg-white border rounded p-3 max-h-[50vh] overflow-auto">
            {drugs.map((d) => (
              <label key={d.id} className="flex items-center gap-2 py-1">
                <input type="checkbox" checked={selectedIds.includes(d.id)} onChange={() => toggle(d.id)} />
                <span>{language === "en" ? d.name.en : d.name.cs}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="font-semibold mb-2">Matched Interaction Rules</h2>
          {matched.length === 0 ? (
            <div className="p-4 bg-gray-50 border rounded">No interactions matched yet.</div>
          ) : (
            <table className="w-full bg-white border rounded">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Severity</th>
                  <th className="p-2">Mechanism</th>
                  <th className="p-2">Recommendation</th>
                  <th className="p-2">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {matched.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 capitalize">{r.severity}</td>
                    <td className="p-2">{language === "en" ? r.mechanism.en : r.mechanism.cs}</td>
                    <td className="p-2">{language === "en" ? r.recommendation.en : r.recommendation.cs}</td>
                    <td className="p-2 text-gray-700">{language === "en" ? r.rationale.en : r.rationale.cs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
