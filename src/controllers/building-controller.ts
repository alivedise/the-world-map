import { ReactiveController, ReactiveControllerHost } from 'lit';
import { WorldSimulation } from '../services/world-simulation';

export class BuildingController implements ReactiveController {
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

  get buildings() {
    return this.simulation.building;
  }
} 