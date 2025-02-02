interface SubActionType {
  name: string;
  duration: number;
  mood: number; // 影響心情值 -5 到 +5
}

export const RestSubActions: SubActionType[] = [
  { name: '聽音樂', duration: 15, mood: 3 },
  { name: '看電視', duration: 30, mood: 2 },
  { name: '做模型', duration: 45, mood: 4 },
  { name: '上網', duration: 20, mood: 1 },
  { name: '打遊戲', duration: 25, mood: 3 },
  { name: '閱讀', duration: 35, mood: 2 },
  { name: '畫畫', duration: 40, mood: 4 },
  { name: '冥想', duration: 10, mood: 5 },
  { name: '運動', duration: 30, mood: 4 },
  { name: '園藝', duration: 25, mood: 3 }
];

export class SubAction {
  name: string;
  duration: number;
  mood: number;
  progress: number = 0;

  constructor(type: SubActionType) {
    this.name = type.name;
    this.duration = type.duration;
    this.mood = type.mood;
  }

  update(): boolean {
    this.progress++;
    return this.progress >= this.duration;
  }
} 