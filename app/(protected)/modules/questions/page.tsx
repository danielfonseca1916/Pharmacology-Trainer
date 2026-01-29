"use client";

import { content } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  if (!question) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">{t.modules.questionBank}</h1>
        <div className="bg-white shadow rounded p-6">
          <p className="text-gray-600">No questions available</p>
        </div>
      </div>
    );
  }

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

  const handleKeyDown = (e: KeyboardEvent | React.KeyboardEvent) => {
    const q = question; // Capture in local variable to help TypeScript
    if (!q || !q.options) return;

    // Alt+S for submit
    if (e.altKey && e.key === "s" && !submitted && selected) {
      e.preventDefault();
      handleSubmit();
    }
    // Alt+N for next
    if (e.altKey && e.key === "n" && submitted) {
      e.preventDefault();
      handleNext();
    }
    // Alt+A, B, C, D for selecting options
    if (e.altKey && /^[a-d]$/i.test(e.key)) {
      e.preventDefault();
      const index = e.key.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
      const options = q.options!;
      if (index < options.length && options[index]) {
        setSelected(options[index]!.id);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown as EventListener);
    return () => window.removeEventListener("keydown", handleKeyDown as EventListener);
  }, [selected, submitted]);

  return (
    <div className="max-w-2xl mx-auto p-8" onKeyDown={handleKeyDown}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t.modules.questionBank}</h1>
        <div className="text-sm text-gray-600" aria-live="polite" aria-atomic="true">
          {currentIndex + 1} / {filtered.length} | {t.progress.accuracyRate}:{" "}
          {filtered.length > 0
            ? Math.round((score / (currentIndex + (submitted ? 1 : 0))) * 100)
            : 0}
          %
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {language === "en" ? question.stem.en : question.stem.cs}
          </h2>

          <fieldset className="space-y-3" data-testid="question-container">
            <legend className="sr-only">Answer options</legend>
            {question.options.map((option, index) => (
              <label
                data-testid={`answer-option-${index}`}
                key={option.id}
                className={`flex items-center p-4 rounded border-2 cursor-pointer transition focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 ${
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
                  className="mr-3 focus:outline-none"
                  aria-label={`Option ${String.fromCharCode(65 + index)}: ${language === "en" ? option.text.en : option.text.cs}`}
                />
                <span className="text-gray-800">
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}:</span>
                  {language === "en" ? option.text.en : option.text.cs}
                </span>
                {submitted && option.correct && (
                  <span className="ml-auto text-green-600 font-semibold">✓</span>
                )}
                {submitted && selected === option.id && !option.correct && (
                  <span className="ml-auto text-red-600 font-semibold">✗</span>
                )}
              </label>
            ))}
          </fieldset>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded mb-6 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}
            role="region"
            aria-live="polite"
            aria-label="Explanation"
          >
            <p className="font-semibold text-gray-800 mb-2">{t.questions.explanation}</p>
            <p className="text-gray-700">{feedback}</p>
          </div>
        )}

        <div className="flex gap-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              data-testid="submit-answer-button"
              disabled={!selected}
              className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-400 text-white font-semibold py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              title="Alt+S"
            >
              {t.questions.submit} (Alt+S)
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-2 rounded transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              title="Alt+N"
            >
              {t.common.next} (Alt+N)
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          💡 Tip: Press Alt+A/B/C/D to select options, Alt+S to submit, Alt+N for next
        </p>
      </div>
    </div>
  );
}
