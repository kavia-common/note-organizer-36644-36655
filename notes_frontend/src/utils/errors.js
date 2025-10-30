//
// Centralized error handling util
//
/**
 * PUBLIC_INTERFACE
 */
export function reportError(err) {
  /** Log to console and return error for potential future integration */
  // eslint-disable-next-line no-console
  console.error('[AppError]', err);
  return err;
}
