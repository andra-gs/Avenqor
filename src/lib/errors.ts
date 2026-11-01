// An error caused by input the user can fix (for example an empty name).
// Its message is written for the user and is safe to show as it is.
// `field` names the input the message belongs to (for example "title"), so a form can show the message
// under that input and highlight it. Without a field the message is about the form as a whole.
export class ValidationError extends Error {
  readonly field: string | undefined;

  constructor(message: string, field?: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// What a form keeps after a failed save: the text to show and, when known, the input it belongs to.
export interface FormError {
  message: string;
  field?: string;
}

export function toFormError(error: unknown): FormError {
  return { message: describeError(error), field: error instanceof ValidationError ? error.field : undefined };
}

// Text to show the user for any error. Validation messages are shown as written;
// anything else is a technical failure, so it gets a general sentence and the technical detail.
export function describeError(error: unknown): string {
  if (error instanceof ValidationError) return error.message;
  const detail = error instanceof Error ? error.message : String(error);
  return `Something went wrong while saving. (${detail})`;
}
