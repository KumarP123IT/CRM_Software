import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";

interface UnsavedChangesGuardOptions {
  hasUnsavedChanges: boolean;
  message?: string;
}

export function useUnsavedChangesGuard({
  hasUnsavedChanges,
  message = "You have unsaved changes. Are you sure you want to leave?",
}: UnsavedChangesGuardOptions) {
  const navigate = useNavigate();
  const previousLocation = useRef<string | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  useEffect(() => {
    // Handle route changes via TanStack Router
    const unblock = navigate.block(({ currentLocation, nextLocation }) => {
      if (hasUnsavedChanges && currentLocation.href !== nextLocation.href) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          return false; // Block navigation
        }
      }
      return true; // Allow navigation
    });

    return () => unblock();
  }, [hasUnsavedChanges, message, navigate]);
}
