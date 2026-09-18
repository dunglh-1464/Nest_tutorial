import type {ValidationError} from '@nestjs/common';

/**
 * Groups validation messages by field name, matching the RealWorld error shape:
 * `{ email: ["can't be blank"], password: ["can't be blank"] }`.
 *
 * Request bodies are wrapped (`{ user: { ... } }`), so the failing fields sit in
 * the `children` of the wrapper. Messages are keyed by the leaf property
 * (`email`), not the dotted path (`user.email`), because that is what the
 * RealWorld test suite reads.
 */
export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  const walk = (list: ValidationError[]) => {
    for (const error of list) {
      // The wrapper (`user`) carries an empty constraints object; skip it so
      // the response does not gain a stray `"user": []` key.
      const messages = Object.values(error.constraints ?? {});
      if (messages.length) {
        (result[error.property] ??= []).push(...messages);
      }
      if (error.children?.length) walk(error.children);
    }
  };
  walk(errors);
  return result;
}
