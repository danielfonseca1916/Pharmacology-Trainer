"use client";

import { DisclaimerModal } from "@/components/DisclaimerModal";
import { MobileNav } from "@/components/MobileNav";
import { content } from "@/lib/content";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { t, language } = useI18n();

  const modules = [
    { href: "/modules/questions", label: t.modules.questionBank, icon: "📝" },
    { href: "/modules/cases", label: t.modules.caseReasoning, icon: "🔬" },
    { href: "/modules/moa", label: t.modules.moa, icon: "⚙️" },
    { href: "/modules/ae-ci", label: t.modules.ae_ci, icon: "⚠️" },
    { href: "/modules/interactions", label: t.modules.interactions, icon: "🔗" },
    { href: "/modules/calculations", label: t.modules.calculations, icon: "🧮" },
  ];

  const blocks = content.courseBlocks;

  return (
    <div className="min-h-screen bg-gray-50">
      <DisclaimerModal />

      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex justify-between items-center relative">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">PharmTrainer</h1>
          <MobileNav />
        </div>
      </header>

      {/* Main Content */}
      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 py-6 sm:py-8 focus:outline-none"
        tabIndex={-1}
      >
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">{t.nav.dashboard}</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Select a course block and module to continue learning.
          </p>
        </div>

        {/* Course Blocks */}
        <section className="mb-10 sm:mb-12" aria-labelledby="course-blocks-heading">
          <h3
            id="course-blocks-heading"
            className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6"
          >
            Course Blocks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => router.push(`/modules/questions?block=${block.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg active:shadow-md transition p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`${language === "en" ? block.title.en : block.title.cs} - ${language === "en" ? block.description.en : block.description.cs}`}
              >
                <h4 className="font-bold text-base sm:text-lg mb-2">
                  {language === "en" ? block.title.en : block.title.cs}
                </h4>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  {language === "en" ? block.description.en : block.description.cs}
                </p>
                <span className="text-blue-600 text-xs sm:text-sm font-semibold hover:underline">
                  Start Learning →
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section aria-labelledby="modules-heading">
          <h3
            id="modules-heading"
            className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6"
          >
            {t.nav.modules}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="bg-white rounded-lg shadow hover:shadow-lg active:shadow-md transition p-4 sm:p-6 flex items-center gap-3 sm:gap-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={module.label}
              >
                <span className="text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true">
                  {module.icon}
                </span>
                <span className="font-semibold text-sm sm:text-base text-gray-800">
                  {module.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-10 sm:mt-12 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs sm:text-sm mb-2">
            {t.disclaimer.title.replace("⚠️ ", "")} - {t.disclaimer.content}
          </p>
          <p className="text-xs text-gray-500">
            © 2026 PharmTrainer. {t.disclaimer.clinicalWarning}
          </p>
        </div>
      </footer>
    </div>
  );
}
