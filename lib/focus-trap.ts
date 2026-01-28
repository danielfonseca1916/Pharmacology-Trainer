/**
 * Utility to trap focus within a dialog element
 * Prevents keyboard navigation outside the dialog
 */
export function createFocusTrap(element: HTMLElement) {
  const focusableElements =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableContent = element.querySelectorAll(focusableElements) as NodeListOf<HTMLElement>;
  const firstElement = focusableContent[0];
  const lastElement = focusableContent[focusableContent.length - 1];

  function handleKeyPress(event: KeyboardEvent) {
    // Close dialog on ESC key
    if (event.key === "Escape") {
      const closeEvent = new CustomEvent("close-dialog");
      element.dispatchEvent(closeEvent);
      return;
    }

    // Trap Tab key focus
    if (event.key === "Tab") {
      if (event.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }

  element.addEventListener("keydown", handleKeyPress);

  // Set initial focus to first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    element.removeEventListener("keydown", handleKeyPress);
  };
}
