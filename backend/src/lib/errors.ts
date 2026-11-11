export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const unauthorized = (message = "Authentication required") =>
  new AppError(401, "unauthorized", message);
export const forbidden = (message = "You don't have permission to do this") =>
  new AppError(403, "forbidden", message);
export const notFound = (message = "Not found") => new AppError(404, "not_found", message);
export const conflict = (code: string, message: string) => new AppError(409, code, message);
export const badRequest = (code: string, message: string) => new AppError(400, code, message);
export const tooMany = (message = "Too many requests, try again later") =>
  new AppError(429, "rate_limited", message);
