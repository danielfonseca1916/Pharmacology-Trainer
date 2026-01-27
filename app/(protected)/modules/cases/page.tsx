"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { content } from "@/lib/content";

export default function CasesModule() {
  const { t, language } = useI18n();
  const params = useSearchParams();
  const block = params.get("block") || undefined;

  const cases = (block ? content.cases.filter((c) => c.courseBlockId === block) : content.cases);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; score: number } | null>(null);

  const current = cases[index];
  if (!current) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{t.modules.caseReasoning}</h1>
        <p className="text-gray-600">No cases available.</p>
      </div>
    );
  }

  const stem = language === "en" ? current.stem.en : current.stem.cs;

  const onSubmit = async () => {
    if (!selected) return;
    const isCorrect = selected === current.rubric.correctChoiceId;
    const score = isCorrect ? current.rubric.scoring.correct : 0;
    setResult({ correct: isCorrect, score });
    setSubmitted(true);

    try {
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "case",
          entityId: current.id,
          module: "caseReasoning",
          courseBlock: current.courseBlockId,
          tags: current.tags,
          answers: { selected },
          score,
          feedback: {
            correctChoiceId: current.rubric.correctChoiceId,
            contraindicationsMissed: current.rubric.contraindicationsMissed,
            interactionsMissed: current.rubric.interactionsMissed,
            monitoringMissing: current.rubric.monitoringMissing,
          },
        }),
      });
    } catch {
      // ignore
    }
  };

  const next = () => {
    setSelected(null);
    setSubmitted(false);
    setResult(null);
    setIndex((i) => (i + 1) % cases.length);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t.modules.caseReasoning}</h1>

      <div className="bg-white shadow rounded p-6">
        <p className="mb-4 whitespace-pre-line">{stem}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-semibold mb-2">Patient</h3>
            <div className="text-sm text-gray-700">
              {current.patient.age !== undefined && <div>Age: {current.patient.age}</div>}
              {current.patient.sex && <div>Sex: {current.patient.sex}</div>}
              {current.patient.weightKg !== undefined && <div>Weight: {current.patient.weightKg} kg</div>}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vitals</h3>
            <div className="text-sm text-gray-700">
              {Object.entries(current.vitals).map(([k, v]) => (
                <div key={k}>{k}: {String(v)}</div>
              ))}
            </div>
          </div>
        </div>

        {current.labs && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Labs</h3>
            <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
              {Object.entries(current.labs).map(([k, v]) => (
                <div key={k}>{k}: {v}</div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {current.choices.map((c) => (
            <label key={c.id} className={`block p-3 border rounded ${selected === c.id ? "border-blue-500" : "border-gray-200"}`}>
              <input
                type="radio"
                name="choice"
                className="mr-2"
                checked={selected === c.id}
                onChange={() => setSelected(c.id)}
              />
              <span>{language === "en" ? c.option.en : c.option.cs}</span>
            </label>
          ))}
        </div>

        {!submitted ? (
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={!selected}
          >
            Submit
          </button>
        ) : (
          <div className={`p-4 rounded ${result?.correct ? "bg-green-50 border border-green-300" : "bg-red-50 border border-red-300"}`}>
            <div className="font-semibold mb-2">{result?.correct ? "Correct" : "Incorrect"} — Score: {result?.score}</div>
            <div className="text-sm text-gray-700 space-y-2">
              {current.choices.map((c) => (
                <div key={c.id}>
                  <div className="font-medium">{language === "en" ? c.option.en : c.option.cs}</div>
                  <div>{language === "en" ? c.explanation.en : c.explanation.cs}</div>
                </div>
              ))}
            </div>
            <button onClick={next} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
