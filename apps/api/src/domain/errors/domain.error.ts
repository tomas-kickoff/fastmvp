export interface DomainErrorProps {
  code: string;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export class DomainError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(props: DomainErrorProps) {
    super(props.message);
    this.name = "DomainError";
    this.code = props.code;
    this.statusCode = props.statusCode ?? 400;
    this.details = props.details;
  }
}
