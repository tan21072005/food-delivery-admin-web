"use client";

import { useFormStatus } from "react-dom";

export function PendingSubmitButton({ children, pendingLabel = "Saving...", className }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
