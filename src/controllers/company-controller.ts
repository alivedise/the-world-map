import { ReactiveController, ReactiveControllerHost } from 'lit';
import { GameState } from '../services/game-state';
import { Company } from '../models/Company';

export class CompanyController implements ReactiveController {
  private host: ReactiveControllerHost;
  private gameState: GameState;
  private unsubscribe?: () => void;
  private initialized: boolean = false;

  constructor(host: ReactiveControllerHost, gameState: GameState) {
    this.host = host;
    this.gameState = gameState;
    this.host.addController(this);
    
    // 當遊戲狀態準備好時，初始化此控制器
    this.initializeWhenReady();
  }

  private initializeWhenReady() {
    // 檢查遊戲狀態是否已經準備好
    try {
      if (this.gameState && this.gameState.companyManager) {
        console.log('CompanyController: 遊戲狀態已準備好，正在初始化。');
        this.initialized = true;
        this.host.requestUpdate();
      } else {
        // 如果尚未準備好，100ms 後再次嘗試
        console.log('CompanyController: 遊戲狀態尚未準備好，正在重試。');
        setTimeout(() => this.initializeWhenReady(), 100);
      }
    } catch (error) {
      console.error('初始化 CompanyController 時發生錯誤:', error);
      // 再試一次
      setTimeout(() => this.initializeWhenReady(), 100);
    }
  }

  hostConnected() {
    console.log('CompanyController: hostConnected');
    try {
      // 訂閱遊戲狀態的更新
      if (this.gameState && this.gameState.subscribe && typeof this.gameState.subscribe === 'function') {
        this.unsubscribe = this.gameState.subscribe(() => {
          this.host.requestUpdate();
        });
      }
    } catch (error) {
      console.error('連接主機時發生錯誤:', error);
    }
  }

  hostDisconnected() {
    // 取消訂閱遊戲狀態的更新
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  get companies(): Company[] {
    try {
      if (!this.gameState || !this.gameState.companyManager) {
        console.log('CompanyController: 遊戲狀態尚未初始化，返回空陣列。');
        return [];
      }
      
      // 安全地獲取公司列表
      const companies = this.gameState.companyManager.getCompanies();
      
      if (!companies || !Array.isArray(companies)) {
        return [];
      }
      
      return companies;
    } catch (error) {
      console.error('CompanyController.companies 獲取時出錯：', error);
      return [];
    }
  }
}