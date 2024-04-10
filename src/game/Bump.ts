import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';

export class Bump extends BaseEntity {
  private isKicked: boolean = false;
  constructor(private engine: Engine, public instance: THREE.Mesh) {
    super();
    this.initPhysics();
    this.addEventListeners();
  }

  initPhysics(): void {
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        this.instance.scale.x / 16,
        this.instance.scale.y / 16,
        this.instance.scale.z / 16
      )
    );
    this.body = new CANNON.Body({
      mass: 0.01,
      material: new CANNON.Material('bumpMaterial'),
    });
    this.body.addShape(shape);
    this.body.position.set(
      this.instance.position.x,
      this.instance.position.y + 5,
      this.instance.position.z
    );
    this.engine.physics.world.addBody(this.body);
  }

  addEventListeners(): void {
    this.body.addEventListener(
      CANNON.Body.COLLIDE_EVENT_NAME,
      this.onCollide.bind(this)
    );
  }

  onCollide(event: {
    body: CANNON.Body;
    contact: CANNON.ContactEquation;
    target: CANNON.Body;
    type: string;
  }): void {
    if (event.body.material?.name === 'carMaterial') {
      this.isKicked = true;
      setTimeout(() => (this.isKicked = false), 2000);
    }
    if (this.isKicked) eventService.emit(Events.BUMP);
  }

  update(): void {
    this.instance.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
    this.instance.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );
  }
}
