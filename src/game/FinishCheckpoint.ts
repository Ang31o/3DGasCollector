import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';
import { GasCheckpoint } from './GasCheckpoint';
import { GameState } from './state/GameState';
import { GamePhase } from '../engine/core/enums/GamePhase.enum';

export class FinishCheckpoint extends GasCheckpoint {
  private passedCheckpoints: number;
  constructor(public engine: Engine, public instance: THREE.Mesh) {
    super(engine, instance);
    this.gas = 0;
    this.passedCheckpoints = 0;
    this.instance.visible = false;
  }

  createShape(): CANNON.Box {
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        this.instance.scale.x,
        this.instance.scale.y,
        this.instance.scale.z
      )
    );
    return shape;
  }

  onCollide(): void {
    if (!this.isCollected && this.passedCheckpoints >= 8) {
      this.isCollected = true;
      eventService.emit(Events.RACE_FINISH);
      GameState.updateGamePhase(GamePhase.GAME_END);
    }
  }

  onCheckpointPassed(): void {
    this.passedCheckpoints++;
  }

  addEventListeners(): void {
    super.addEventListeners();
    eventService.on(Events.CHECKPOINT_PASSED, this.onCheckpointPassed, this);
  }
}
