export interface ApplicationErrorProps {
  code: string;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(props: ApplicationErrorProps) {
    super(props.message);
    this.name = "ApplicationError";
    this.code = props.code;
    this.statusCode = props.statusCode ?? 500;
    this.details = props.details;
  }
}
