import { ReactiveController, ReactiveControllerHost } from 'lit';
import { WorldSimulation } from '../services/world-simulation';
import { Company } from '../models/Company';

export class CompanyController implements ReactiveController {
  private host: ReactiveControllerHost;
  private simulation: WorldSimulation;

  constructor(host: ReactiveControllerHost, simulation: WorldSimulation) {
    this.host = host;
    this.simulation = simulation;
    this.host.addController(this);
  }

  hostConnected() {
    this.simulation.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    // 清理訂閱
  }

  get companies(): Company[] {
    return Array.from(this.simulation.gameState.companyManager.companies.values());
  }
} 