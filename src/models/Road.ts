export class Road {
  private points: { x: number; y: number }[];
  private shape: string; // SVG path shape

  constructor(points: { x: number; y: number }[]) {
    this.points = points;
    this.shape = this.generatePathShape();
  }

  private generatePathShape(): string {
    // 生成 SVG 路徑字符串
    return `M ${this.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  }

  public getShape(): string {
    return this.shape;
  }

  public getPoints(): { x: number; y: number }[] {
    return this.points;
  }
} 