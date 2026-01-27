"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { LanguageToggle } from "@/components/LanguageToggle";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { content } from "@/lib/content";

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
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">PharmTrainer</h1>
          <div className="flex gap-4 items-center">
            <LanguageToggle />
            <Link href="/progress" className="text-sm text-blue-600 hover:underline">
              {t.nav.progress}
            </Link>
            <Link href="/drugs" className="text-sm text-blue-600 hover:underline">
              {t.nav.drugs}
            </Link>
            <Link href="/account" className="text-sm text-blue-600 hover:underline">
              {t.nav.account}
            </Link>
            <button
              onClick={() => signOut({ redirect: true })}
              className="text-sm text-red-600 hover:underline"
            >
              {t.nav.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{t.nav.dashboard}</h2>
          <p className="text-gray-600">Select a course block and module to continue learning.</p>
        </div>

        {/* Course Blocks */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Course Blocks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map((block) => (
              <div key={block.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <h4 className="font-bold text-lg mb-2">
                  {language === "en" ? block.title.en : block.title.cs}
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  {language === "en" ? block.description.en : block.description.cs}
                </p>
                <button
                  onClick={() => router.push(`/modules/questions?block=${block.id}`)}
                  className="text-blue-600 text-sm font-semibold hover:underline"
                >
                  Start Learning →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Modules */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">{t.nav.modules}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center gap-4"
              >
                <span className="text-4xl">{module.icon}</span>
                <span className="font-semibold text-gray-800">{module.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm mb-2">
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
