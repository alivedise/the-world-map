
export default class PopulationManager {
  private population: number;
  private currentTime: number;
  constructor() {
    this.population = 0;
    this.currentTime = 0;
  }

  update(deltaTime: number) {
    // decide to increase or decrease population
    // update population
    this.currentTime += deltaTime;
    if (this.currentTime > 10) {
      this.population += 1;
      this.currentTime = 0;
    }
  }

  getPopulation() {
    return this.population;
  }
}