import * as CANNON from 'cannon-es';
import { GamePhase } from '../../engine/core/enums/GamePhase.enum';

export class GameState {
  private static _mapCounter: number;
  private static _gamePhase: GamePhase;
  private static _score: number;
  private static _lastCheckpointPosition: CANNON.Vec3;
  private static _lastCheckpointQuaternion: CANNON.Quaternion;

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

  static get score(): number {
    return this._score;
  }

  static init(): void {
    this.resetStateData();
  }

  static resetStateData(): void {
    this._mapCounter = 1;
    this._score = 0;
    // this._lastCheckpointPosition = new CANNON.Vec3(0, 0, 0);
    // this._lastCheckpointQuaternion = new CANNON.Quaternion(0, 0, 0, 1);
    this._lastCheckpointPosition = new CANNON.Vec3(
      80.71468772403756,
      0.9055674094114929,
      123.96261442020729
    );
    this._lastCheckpointQuaternion = new CANNON.Quaternion(
      0.013669761284159117,
      -0.7160714627932293,
      0.01402683087036715,
      0.6977521378077842
    );
  }

  static checkpointPassed(
    checkpointPosition: CANNON.Vec3,
    checkpointQuaternion: CANNON.Quaternion
  ): void {
    this._lastCheckpointPosition.copy(checkpointPosition);
    this._lastCheckpointQuaternion.copy(checkpointQuaternion);
    this._score++;
  }
}
