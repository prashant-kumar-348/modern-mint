import { Request, Response, NextFunction } from "express";

interface AppError {
  status?:  number;
  message?: string;
  stack?:   string;
  code?:    string;   // PostgreSQL error code
}

/**
 * Translate PostgreSQL error codes into clean HTTP responses.
 * https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
function normalizePgError(err: AppError): { status: number; message: string } {
  switch (err.code) {
    case "22P02": // invalid_text_representation (bad UUID, bad enum value, etc.)
      return { status: 400, message: "Invalid ID format." };
    case "23503": // foreign_key_violation
      return { status: 400, message: "Referenced resource does not exist." };
    case "23505": // unique_violation
      return { status: 409, message: "A conflicting record already exists." };
    case "23514": // check_violation
      return { status: 400, message: "Value out of allowed range." };
    case "57014": // query_canceled
      return { status: 503, message: "Database request timed out." };
    default:
      return { status: 500, message: "An unexpected error occurred." };
  }
}

/**
 * Global error handler — must be registered last in the Express middleware chain.
 * Translates both thrown objects and Error instances into a uniform JSON response.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== "production";

  // Normalise PostgreSQL driver errors (they have a `code` field, no `status`)
  const isPgError = err.code !== undefined && err.status === undefined;
  const { status, message } = isPgError
    ? normalizePgError(err)
    : { status: err.status ?? 500, message: err.message ?? "An unexpected error occurred." };

  if (status >= 500) {
    console.error("[Error]", err.stack ?? err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(isDev && status >= 500 && { stack: err.stack }),
  });
}
