export class GameLoop {
  private lastTime: number = 0;
  private running: boolean = false;
  private updateCallback: (deltaTime: number) => void;

  constructor(updateCallback: (deltaTime: number) => void) {
    this.updateCallback = updateCallback;
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  private loop() {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // 轉換為秒
    this.lastTime = currentTime;

    this.updateCallback(deltaTime);
    requestAnimationFrame(() => this.loop());
  }
} 