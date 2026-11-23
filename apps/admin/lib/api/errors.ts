export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: Record<string, string | string[]>;
};

export type ApiSuccessBody<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ApiEnvelope<T> = ApiSuccessBody<T> | ApiErrorBody;

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || `Erreur API (${status})`);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }
}

export function isApiSuccess<T>(
  body: ApiEnvelope<T>
): body is ApiSuccessBody<T> {
  return body.success === true;
}

export function normalizeApiError(
  status: number,
  payload: unknown
): ApiClientError {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as ApiErrorBody).success === false
  ) {
    const body = payload as ApiErrorBody;
    return new ApiClientError(status, {
      success: false,
      message: body.message || "Erreur API",
      errors: body.errors,
    });
  }

  return new ApiClientError(status, {
    success: false,
    message:
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : `Réponse API invalide (${status})`,
  });
}

export function toRouteErrorResponse(error: ApiClientError) {
  return Response.json(
    {
      success: false as const,
      message: error.message,
      errors: error.body.errors,
    },
    { status: error.status }
  );
}