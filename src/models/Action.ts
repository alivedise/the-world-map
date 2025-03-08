import { SubAction, RestSubActions } from './SubAction';

export enum ActionType {
  REST = 'rest',
  MOVE = 'move',
  WORK = 'work'
}

export class Action {
  type: ActionType;
  duration: number; // 行動所消耗的時長，移動行動可以是可變的
  private subActions: SubAction[] = [];
  private currentSubAction: SubAction | null = null;

  constructor(type: ActionType, duration: number) {
    this.type = type;
    this.duration = duration;
    
    if (type === ActionType.REST) {
      this.generateRestSubActions();
    }
  }

  private generateRestSubActions() {
    // 隨機選擇 2-4 個子行動
    const count = Math.floor(Math.random() * 3) + 2;
    const availableActions = [...RestSubActions];
    
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * availableActions.length);
      const subActionType = availableActions.splice(index, 1)[0];
      this.subActions.push(new SubAction(subActionType));
    }
  }

  update(): { completed: boolean; subActionName?: string; mood?: number } {
    if (this.type !== ActionType.REST) {
      return { completed: false };
    }

    if (!this.currentSubAction && this.subActions.length > 0) {
      this.currentSubAction = this.subActions.shift() || null;
    }

    if (this.currentSubAction) {
      const completed = this.currentSubAction.update();
      if (completed) {
        const result = {
          completed: false,
          subActionName: this.currentSubAction.name,
          mood: this.currentSubAction.mood
        };
        this.currentSubAction = null;
        return result;
      }
    }

    return { completed: this.subActions.length === 0 };
  }

  getCurrentSubActionName(): string | null {
    return this.currentSubAction?.name || null;
  }
} 