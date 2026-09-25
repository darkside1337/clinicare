export class ForbiddenError extends Error {
  constructor(message = "Forbidden: Doctor role required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ClinicNotAssignedError extends Error {
  constructor(message = "Account not set up: No clinic assigned") {
    super(message);
    this.name = "ClinicNotAssignedError";
  }
}
