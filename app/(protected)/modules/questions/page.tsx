"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { content } from "@/lib/content";
import { useI18n } from "@/lib/i18n";

export default function QuestionsModule() {
  const searchParams = useSearchParams();
  const blockId = searchParams.get("block");
  const { t, language } = useI18n();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const filtered = blockId
    ? content.questions.filter((q) => q.courseBlockId === blockId)
    : content.questions;

  if (filtered.length === 0) {
    return (
      <div className="p-8">
        <p className="text-gray-600">{t.common.loading}</p>
      </div>
    );
  }

  const question = filtered[currentIndex];
  const isCorrect = selected ? question.options.find((o) => o.id === selected)?.correct : false;

  const handleSubmit = async () => {
    setSubmitted(true);
    setFeedback(language === "en" ? question.explanation.en : question.explanation.cs);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      // Log attempt to backend
      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: "question",
          entityId: question.id,
          module: "Question Bank",
          courseBlock: question.courseBlockId,
          tags: question.tags,
          answers: { selected },
          score: 100,
          feedback: { explanation: question.explanation },
        }),
      }).catch(() => {});
    }
  };

  const handleNext = () => {
    setSelected(null);
    setSubmitted(false);
    setFeedback(null);
    setCurrentIndex((prev) => (prev + 1) % filtered.length);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.modules.questionBank}</h1>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {filtered.length} | {t.progress.accuracyRate}: {filtered.length > 0 ? Math.round((score / (currentIndex + (submitted ? 1 : 0))) * 100) : 0}%
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {language === "en" ? question.stem.en : question.stem.cs}
          </h2>

          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 rounded border-2 cursor-pointer transition ${
                  selected === option.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                } ${
                  submitted && option.correct
                    ? "border-green-500 bg-green-50"
                    : submitted && selected === option.id && !option.correct
                    ? "border-red-500 bg-red-50"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={selected === option.id}
                  onChange={(e) => setSelected(e.target.value)}
                  disabled={submitted}
                  className="mr-3"
                />
                <span className="text-gray-800">{language === "en" ? option.text.en : option.text.cs}</span>
                {submitted && option.correct && <span className="ml-auto text-green-600 font-semibold">✓</span>}
                {submitted && selected === option.id && !option.correct && <span className="ml-auto text-red-600 font-semibold">✗</span>}
              </label>
            ))}
          </div>
        </div>

        {feedback && (
          <div className={`p-4 rounded mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
            <p className="font-semibold text-gray-800 mb-2">{t.questions.explanation}</p>
            <p className="text-gray-700">{feedback}</p>
          </div>
        )}

        <div className="flex gap-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded transition"
            >
              {t.questions.submit}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
            >
              {t.common.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
