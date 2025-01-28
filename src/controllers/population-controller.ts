import { ReactiveController, ReactiveControllerHost } from 'lit';
import { WorldSimulation } from '../services/world-simulation';

export class PopulationController implements ReactiveController {
  private host: ReactiveControllerHost;
  private simulation: WorldSimulation;
  private unsubscribe?: () => void;

  constructor(host: ReactiveControllerHost, simulation: WorldSimulation) {
    this.host = host;
    this.simulation = simulation;
    host.addController(this);
  }

  hostConnected() {
    this.unsubscribe = this.simulation.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    this.unsubscribe?.();
  }

  get population() {
    return this.simulation.population;
  }
} 