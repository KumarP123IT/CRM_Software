import { useBlocker } from "@tanstack/react-router";

interface UnsavedChangesGuardOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UnsavedChangesGuardOptions) {
  useBlocker({
    disabled: !hasUnsavedChanges,
    enableBeforeUnload: hasUnsavedChanges,
    shouldBlockFn: () => {
      if (!hasUnsavedChanges) return false;
      return !window.confirm(message);
    },
  });
}
