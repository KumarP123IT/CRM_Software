import { useEffect, useCallback } from "react";

interface KeyboardNavigationOptions {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onMoveUp,
  onMoveDown,
  onOpen,
  onClose,
  onSearch,
  onHelp,
  enabled = true,
}: KeyboardNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      // Allow Esc in inputs
      if (e.key === "Escape" && onClose) {
        onClose();
        return;
      }

      // Don't trigger shortcuts if user is typing
      if (isInput && e.key !== "Escape") return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          onMoveDown?.();
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          onMoveUp?.();
          break;
        case "Enter":
          e.preventDefault();
          onOpen?.();
          break;
        case "/":
          e.preventDefault();
          onSearch?.();
          break;
        case "?":
          e.preventDefault();
          onHelp?.();
          break;
      }
    },
    [enabled, onMoveUp, onMoveDown, onOpen, onClose, onSearch, onHelp],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
