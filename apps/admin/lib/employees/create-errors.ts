import { BffRequestError } from "@/lib/auth/bff-client";

import { mapBffEmployeeError } from "./employees-bff";

export function isUncertainCreateFailure(err: BffRequestError): boolean {
  return err.status === 503 || err.status >= 500;
}

export function isValidationCreateFailure(err: BffRequestError): boolean {
  return err.status === 422;
}

export function mapCreateEmployeeError(err: BffRequestError): string {
  if (isValidationCreateFailure(err)) {
    return mapBffEmployeeError(err);
  }
  if (isUncertainCreateFailure(err)) {
    return (
      "La connexion a échoué ou a expiré. Le compte a peut-être été créé. " +
      "Vérifiez la liste des employés avant de réessayer avec le même e-mail."
    );
  }
  return mapBffEmployeeError(err);
}