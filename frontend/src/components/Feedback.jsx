import { useEffect, useRef, useState } from "react";

export function notify(message, type = "success") {
  window.dispatchEvent(new CustomEvent("app:notify", { detail: { message, type } }));
}

export function confirmAction({ title = "Confirmer l'action", message, confirmLabel = "Supprimer" }) {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent("app:confirm", { detail: { title, message, confirmLabel, resolve } }));
  });
}

export function FeedbackLayer() {
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const cancelButton = useRef(null);

  useEffect(() => {
    const onNotify = ({ detail }) => setToast({ ...detail, id: Date.now() });
    const onConfirm = ({ detail }) => setDialog(detail);
    window.addEventListener("app:notify", onNotify);
    window.addEventListener("app:confirm", onConfirm);
    return () => {
      window.removeEventListener("app:notify", onNotify);
      window.removeEventListener("app:confirm", onConfirm);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!dialog) return undefined;
    cancelButton.current?.focus();
    const onKeyDown = (event) => { if (event.key === "Escape") closeDialog(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  function closeDialog(confirmed) {
    dialog?.resolve(confirmed);
    setDialog(null);
  }

  return <>
    {toast && <div className={`toast toast-${toast.type}`} role={toast.type === "error" ? "alert" : "status"} aria-live="polite">
      <span aria-hidden="true">{toast.type === "error" ? "!" : "✓"}</span>
      <p>{toast.message}</p>
      <button type="button" onClick={() => setToast(null)} aria-label="Fermer la notification">×</button>
    </div>}
    {dialog && <div className="dialog-backdrop" role="presentation" onMouseDown={() => closeDialog(false)}>
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" onMouseDown={(event) => event.stopPropagation()}>
        <span className="confirm-dialog-icon" aria-hidden="true">!</span>
        <h2 id="confirm-title">{dialog.title}</h2>
        <p>{dialog.message}</p>
        <div className="confirm-dialog-actions">
          <button ref={cancelButton} type="button" onClick={() => closeDialog(false)}>Annuler</button>
          <button className="confirm-danger" type="button" onClick={() => closeDialog(true)}>{dialog.confirmLabel}</button>
        </div>
      </section>
    </div>}
  </>;
}
