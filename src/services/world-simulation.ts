import { GameState } from './game-state';
import { GameLoop } from './game-loop';

export class WorldSimulation {
  private gameState: GameState;
  private gameLoop: GameLoop;
  private subscribers: Set<() => void> = new Set();
  private static instance: WorldSimulation;

  static getInstance(): WorldSimulation {
    if (!WorldSimulation.instance) {
      WorldSimulation.instance = new WorldSimulation();
    }
    return WorldSimulation.instance;
  }
  constructor() {
    this.gameState = new GameState({ width: 30, height: 20 });
    this.gameLoop = new GameLoop(this.updateSimulation.bind(this));
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

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    const gameStateUnsubscribe = this.gameState.subscribe(callback);
    
    return () => {
      this.subscribers.delete(callback);
      gameStateUnsubscribe();
    };
  }

  private updateSimulation(deltaTime: number) {
    this.gameState.updateGameTime(deltaTime);
  }

  setGameSpeed(speed: number) {
    this.gameState.setGameSpeed(speed);
  }

  setPaused(isPaused: boolean) {
    this.gameState.setPaused(isPaused);
  }

  handleTileClick(x: number, y: number) {
    this.gameState.handleTileClick(x, y);
  }

  get isPaused() {
    return this.gameState.isPaused;
  }

  get gameSpeed() {
    return this.gameState.gameSpeed;
  }

  get gameTime() {
    return this.gameState.gameTime;
  }

  get mapData() {
    return this.gameState.mapData;
  }
} 