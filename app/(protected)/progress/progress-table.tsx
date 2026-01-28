"use client";

import { useI18n } from "@/lib/i18n";

interface ProgressTableProps {
  items: Array<{
    id: number;
    userId: number;
    module: string;
    courseBlock: string;
    tag: string;
    correctCount: number;
    wrongCount: number;
    lastAttemptAt: Date | null;
  }>;
}

export function ProgressTable({ items }: ProgressTableProps) {
  const { t } = useI18n();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{t.progress.title}</h1>
        <p className="text-gray-600">Overview of your learning progress by topic.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">Module</th>
              <th className="p-3">Course Block</th>
              <th className="p-3">Tag</th>
              <th className="p-3">Correct</th>
              <th className="p-3">Wrong</th>
              <th className="p-3">Accuracy</th>
              <th className="p-3">Last Attempt</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-gray-600" colSpan={7}>
                  No progress yet. Try the modules to get started.
                </td>
              </tr>
            ) : (
              items.map((it) => {
                const total = it.correctCount + it.wrongCount;
                const acc = total > 0 ? Math.round((it.correctCount / total) * 100) : 0;
                return (
                  <tr key={`${it.module}-${it.courseBlock}-${it.tag}`} className="border-t">
                    <td className="p-3">{it.module}</td>
                    <td className="p-3">{it.courseBlock}</td>
                    <td className="p-3">{it.tag}</td>
                    <td className="p-3">{it.correctCount}</td>
                    <td className="p-3">{it.wrongCount}</td>
                    <td className="p-3">{acc}%</td>
                    <td className="p-3">
                      {new Date(it.lastAttemptAt ?? Date.now()).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
