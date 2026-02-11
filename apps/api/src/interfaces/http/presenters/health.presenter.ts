import { HealthResponseDto } from "../../../application/dtos/health.dto";

export interface HealthHttpResponse {
  status: "ok";
  timestamp: string;
}

export class HealthPresenter {
  present(dto: HealthResponseDto): HealthHttpResponse {
    return {
      status: dto.status,
      timestamp: dto.timestamp
    };
  }
}
