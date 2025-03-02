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
    try {
      if (!this.simulation) {
        console.error('Simulation is not initialized in CompanyController!');
        return [];
      }
      
      const companies = this.simulation.getCompanies();
      console.log('CompanyController.companies getter called, returning:', companies);
      
      if (!companies || !Array.isArray(companies)) {
        console.error('Companies is not an array or is undefined:', companies);
        return [];
      }
      
      return companies;
    } catch (error) {
      console.error('Error in CompanyController.companies getter:', error);
      return [];
    }
  }
}