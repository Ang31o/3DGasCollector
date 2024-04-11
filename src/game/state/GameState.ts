import * as CANNON from 'cannon-es';
import { GamePhase } from '../../engine/core/enums/GamePhase.enum';

export class GameState {
  private static _mapCounter: number;
  private static _gamePhase: GamePhase;
  private static _score: number;
  private static _scoreMax: number;
  private static _gas: number;
  private static _lastGas: number;
  private static _lastCheckpointPosition: CANNON.Vec3;
  private static _lastCheckpointQuaternion: CANNON.Quaternion;
  private static _isSoundOn: boolean;
  private static _isMusicOn: boolean;

  static get map(): string {
    return `map${this._mapCounter}`;
  }

  static get lastCheckpoint(): { p: CANNON.Vec3; q: CANNON.Quaternion } {
    return {
      p: this._lastCheckpointPosition,
      q: this._lastCheckpointQuaternion,
    };
  }

  static get gamePhase(): GamePhase {
    return this._gamePhase;
  }

  static get maxScore(): number {
    return this._scoreMax;
  }

  static get gas(): number {
    return this._gas;
  }

  static get score(): number {
    return this._score;
  }

  static get isSoundOn(): boolean {
    return this._isSoundOn;
  }

  static get isMusicOn(): boolean {
    return this._isMusicOn;
  }

  static updateGamePhase(newGamePhase: GamePhase): void {
    this._gamePhase = newGamePhase;
  }

  static setMaxScore(maxScore: number) {
    this._scoreMax = maxScore;
  }

  static setSoundOn(isOn: boolean) {
    this._isSoundOn = isOn;
    localStorage.setItem('isSoundOn', isOn.toString());
  }

  static setMusicOn(isOn: boolean) {
    this._isMusicOn = isOn;
    localStorage.setItem('isMusicOn', isOn.toString());
  }

  static addGas(value: number): void {
    if (this._gas < 100) this._gas += value;
  }

  static burnGas(): void {
    this._gas -= 0.05;
  }

  static init(): void {
    this.resetStateData();
  }

  static resetStateData(): void {
    this._gamePhase = GamePhase.INIT;
    this._gas = 20;
    this.setSoundOn(
      localStorage.getItem('isSoundOn')
        ? localStorage.getItem('isSoundOn') === 'true'
        : true
    );
    this.setMusicOn(
      localStorage.getItem('isMusicOn')
        ? localStorage.getItem('isMusicOn') === 'true'
        : true
    );
    this._mapCounter = 1;
    this._score = 0;
    this._scoreMax = 0;
    this._lastCheckpointPosition = new CANNON.Vec3(0, 0, 0);
    this._lastCheckpointQuaternion = new CANNON.Quaternion(0, 0, 0, 1);
  }

  static loadCheckpoint(): void {
    this._gas = this._lastGas;
  }

  static checkpointPassed(
    checkpointPosition: CANNON.Vec3,
    checkpointQuaternion: CANNON.Quaternion
  ): void {
    this._lastCheckpointPosition.copy(checkpointPosition);
    this._lastCheckpointQuaternion.copy(checkpointQuaternion);
    this._score++;
    this._lastGas = this.gas;
  }
}
