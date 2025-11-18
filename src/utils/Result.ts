/**
 * Result type for type-safe error handling
 * Inspired by functional programming patterns and the IVS Demo
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Creates a successful result
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Creates a failed result
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Wraps a promise to return a Result type
 */
export async function toResult<T>(
  promise: Promise<T>
): Promise<Result<T, Error>> {
  try {
    const data = await promise;
    return success(data);
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Maps a Result to another Result
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> {
  if (result.success) {
    return success(fn(result.data)) as Result<U, E>;
  }
  return result as Result<U, E>;
}

/**
 * Chains Result operations
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result as Result<U, E>;
}
