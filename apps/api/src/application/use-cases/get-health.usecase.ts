import { HealthResponseDto } from "../dtos/health.dto";

export class GetHealthUseCase {
  execute(): HealthResponseDto {
    return {
      status: "ok",
      timestamp: new Date().toISOString()
    };
  }
}
