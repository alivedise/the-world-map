export type ActionType = 'rest' | 'move' | 'work';

export class Action {
  type: ActionType;
  duration: number; // 行動所消耗的時長，移動行動可以是可變的

  constructor(type: ActionType, duration: number) {
    this.type = type;
    this.decideDuration();
  }

  decideDuration() {
    this.duration = Math.floor(100 * Math.random()) + 1;
  }
} 