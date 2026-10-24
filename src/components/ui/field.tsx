import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import styles from './ui.module.css';

interface FieldShellProps {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  id: string;
  children: ReactNode;
}

function FieldShell({ label, hint, error, id, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint} id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Common = { label: string; hint?: string | undefined; error?: string | undefined };

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export const Input = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ label, hint, error, id, className, ...rest }, ref) {
    const auto = useId();
    const fieldId = id ?? auto;
    return (
      <FieldShell label={label} hint={hint} error={error} id={fieldId}>
        <input
          ref={ref}
          id={fieldId}
          className={[styles.input, error ? styles.inputInvalid : '', className ?? ''].join(' ')}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          {...rest}
        />
      </FieldShell>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Common & TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ label, hint, error, id, className, ...rest }, ref) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <textarea
        ref={ref}
        id={fieldId}
        className={[styles.input, error ? styles.inputInvalid : '', className ?? ''].join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        {...rest}
      />
    </FieldShell>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  Common & SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ label, hint, error, id, className, children, ...rest }, ref) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell label={label} hint={hint} error={error} id={fieldId}>
      <select
        ref={ref}
        id={fieldId}
        className={[styles.input, error ? styles.inputInvalid : '', className ?? ''].join(' ')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, error, hint)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});
