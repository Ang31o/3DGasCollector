import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { Engine } from './Engine';
import { Constants } from '../constants';
import eventService from './utilities/eventService';
import { Events } from '../events';
import { GameEntity } from './GameEntity';

export class Physics implements GameEntity {
  public world: CANNON.World;
  public debugRenderer: any;
  public isDebugOn: boolean = false;
  public bodiesForRemoval: CANNON.Body[] = [];

  constructor(private engine: Engine) {
    this.initWorld();
    this.initGui();
    this.initDebugRenderer();
    this.addEventListeners();
  }

  initWorld(): void {
    this.world = new CANNON.World();
    this.world.gravity.set(0, Constants.GRAVITY, 0);
    this.world.allowSleep = false;
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    // this.world.defaultMaterial.friction = 0;
  }

  initDebugRenderer(): void {
    if (localStorage.getItem('debug') === 'true') {
      this.debugRenderer = new CannonDebugger(this.engine.scene, this.world);
    }
  }

  initGui(): void {
    this.isDebugOn = localStorage.getItem('debug') === 'true';
    this.engine.debug.gui
      .add(this, 'isDebugOn')
      .name('Enable Physics Debug')
      .onChange((isEnabled: boolean) => {
        // Focus on car with orbit controls
        localStorage.setItem('debug', isEnabled.toString());
      });
  }

  onRemoveBody(body: CANNON.Body): void {
    this.bodiesForRemoval.push(body);
  }

  addEventListeners(): void {
    eventService.on(Events.REMOVE_BODY, this.onRemoveBody, this);
  }

  update() {
    if (this.bodiesForRemoval.length > 0) {
      this.bodiesForRemoval.forEach((body) => {
        body.shapes.forEach((shape) => body.removeShape(shape));
        this.world.removeBody(body);
      });
      this.bodiesForRemoval = [];
    }
    this.world.step(1 / 60, this.engine.time.deltaTime, 3);
    this.debugRenderer?.update();
  }
}
