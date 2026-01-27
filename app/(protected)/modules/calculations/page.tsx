"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { content } from "@/lib/content";

export default function CalculationsModule() {
  const { t, language } = useI18n();
  const templates = content.doseTemplates;
  const [selectedId, setSelectedId] = useState<string | null>(templates[0]?.id ?? null);
  const selected = templates.find((d) => d.id === selectedId) ?? templates[0];
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.modules.calculations}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="font-semibold mb-2">Templates</h2>
          <div className="bg-white border rounded p-3 max-h-[50vh] overflow-auto">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setSelectedId(tpl.id)}
                className={`block w-full text-left p-2 rounded mb-1 ${selectedId === tpl.id ? "bg-blue-50 border" : "hover:bg-gray-50"}`}
              >
                {language === "en" ? tpl.title.en : tpl.title.cs}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="font-semibold mb-2">Practice</h2>
          <div className="bg-white border rounded p-4">
            <div className="mb-3 text-gray-700">{language === "en" ? selected.title.en : selected.title.cs}</div>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              {selected.inputs.map((inp) => (
                <div key={inp.name}>
                  <label className="block text-sm text-gray-700 mb-1">{language === "en" ? inp.label.en : inp.label.cs}</label>
                  <input
                    type={inp.type}
                    value={values[inp.name] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [inp.name]: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder={inp.type === "number" ? "0" : "text"}
                  />
                </div>
              ))}
              <div className="p-3 bg-gray-50 border rounded">
                <div className="font-semibold mb-2">Formula</div>
                <div>{language === "en" ? selected.formula.en : selected.formula.cs}</div>
              </div>
              <div className="p-3 bg-green-50 border rounded">
                <div className="font-semibold mb-2">Example</div>
                <div>{language === "en" ? selected.example.en : selected.example.cs}</div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Practice (no eval)</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
