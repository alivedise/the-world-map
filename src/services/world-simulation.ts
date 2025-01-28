import { GameState } from './game-state';
import { GameLoop } from './game-loop';

export class WorldSimulation {
  private static instance: WorldSimulation;
  private gameState: GameState;
  private gameLoop: GameLoop;

  private constructor() {
    this.gameState = new GameState({ width: 30, height: 20 });
    this.gameLoop = new GameLoop((deltaTime) => {
      this.gameState.update(deltaTime);
    });
  }

  static getInstance(): WorldSimulation {
    if (!WorldSimulation.instance) {
      WorldSimulation.instance = new WorldSimulation();
      window.wsi = WorldSimulation.instance;
    }
    return WorldSimulation.instance;
  }

  // 代理所有需要的 GameState 屬性
  get population() { return this.gameState.population; }
  get building() { return this.gameState.buildingManager.buildings.length; }
  get gameSpeed() { return this.gameState.gameSpeed; }
  get isPaused() { return this.gameState.isPaused; }
  get gameTime() { return this.gameState.gameTime; }

  // 代理訂閱機制
  subscribe(callback: () => void) {
    return this.gameState.subscribe(callback);
  }

  initialize() {
    this.gameState.initialize();
  }

  start() {
    this.gameLoop.start();
  }

  stop() {
    this.gameLoop.stop();
  }

  setGameSpeed(speed: number) {
    this.gameState.setGameSpeed(speed);
  }

  setPaused(isPaused: boolean) {
    this.gameState.setPaused(isPaused);
  }

  handleBlockClick(x: number, y: number) {
    this.gameState.handleBlockClick(x, y);
  }

  update(deltaTime: number) {
    this.gameState.update(deltaTime);
  }
} 