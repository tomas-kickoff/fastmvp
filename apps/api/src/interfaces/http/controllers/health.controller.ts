import { GetHealthUseCase } from "../../../application/use-cases/get-health.usecase";
import {
  HealthHttpResponse,
  HealthPresenter
} from "../presenters/health.presenter";

export class HealthController {
  constructor(
    private readonly getHealthUseCase: GetHealthUseCase,
    private readonly healthPresenter: HealthPresenter
  ) {}

  async handle(): Promise<HealthHttpResponse> {
    const health = this.getHealthUseCase.execute();
    return this.healthPresenter.present(health);
  }
}
