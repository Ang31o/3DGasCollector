import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { GameEntity } from './GameEntity';
import { Engine } from './Engine';
import { Constants } from '../constants';

export class Physics implements GameEntity {
  public instance!: CANNON.World;
  public debugRenderer: any;

  constructor(private engine: Engine) {
    this.initWorld();
    this.initDebugRenderer();
  }

  initWorld(): void {
    this.instance = new CANNON.World();
    this.instance.gravity.set(0, Constants.GRAVITY, 0);
    this.instance.allowSleep = false;
    this.instance.broadphase = new CANNON.SAPBroadphase(this.instance);
    this.instance.defaultMaterial.friction = 0;
  }

  initDebugRenderer(): void {
    this.debugRenderer = new CannonDebugger(this.engine.scene, this.instance);
  }

  update() {
    this.instance.step(1 / 60, this.engine.time.deltaTime, 3);
    this.debugRenderer?.update();
  }
}
