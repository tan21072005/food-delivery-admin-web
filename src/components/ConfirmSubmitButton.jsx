"use client";

import { useFormStatus } from "react-dom";

export function ConfirmSubmitButton({ children, confirmMessage, pendingLabel = "Saving...", className, disabled = false }) {
  const { pending } = useFormStatus();

  function handleClick(event) {
    if (disabled || pending || !confirmMessage) {
      return;
    }

    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <button type="submit" onClick={handleClick} disabled={disabled || pending} className={className}>
      {pending ? pendingLabel : children}
    </button>
  );
}
