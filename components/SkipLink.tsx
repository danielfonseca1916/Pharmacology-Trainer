"use client";

/**
 * Accessible skip link that allows keyboard users to jump to main content
 * Visible only on focus, appears when Tab key is pressed
 */
export function SkipLink() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className="absolute top-0 left-0 z-[100] bg-blue-600 text-white px-4 py-2 rounded-none
 focus:outline-2 focus:outline-offset-2 focus:outline-blue-400
 -translate-y-full focus:translate-y-0 transition-transform duration-150"
    >
      Skip to main content
    </a>
  );
}
