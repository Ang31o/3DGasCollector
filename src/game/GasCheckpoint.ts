import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';

export class GasCheckpoint extends BaseEntity {
  public isCollected: boolean = false;
  private opacity: number = 1;
  private fadeSpeed: number = 0.01;
  public gas: number;
  constructor(public engine: Engine, public instance: THREE.Mesh) {
    super();
    this.gas = instance.userData.gas || 15;
    this.initPhysics();
    this.cloneMaterial();
    this.addEventListeners();
  }

  cloneMaterial(): void {
    // Must clone a material so we can fade-out just this collected checkpoint box and not all others,
    // bc they are sharing the same material
    this.instance.material = (this.instance.material as THREE.Material).clone();
    this.instance.material.transparent = true;
  }

  createShape(): CANNON.Box {
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
    return shape;
  }

  initPhysics(): void {
    const shape = this.createShape();
    this.body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      collisionResponse: false, // Don't slow down the car when collided
      material: new CANNON.Material('checkpointMaterial'),
    });
    this.body.addShape(shape);
    this.body.position.set(
      this.instance.position.x,
      this.instance.position.y,
      this.instance.position.z
    );
    this.body.sleep();

    this.engine.physics.world.addBody(this.body);
  }

  onCollide(): void {
    if (!this.isCollected) {
      this.isCollected = true;
      setTimeout(() => this.destroy(), 2000);
      eventService.emit(Events.CHECKPOINT_PASSED, this.gas);
    }
  }

  addEventListeners(): void {
    this.body.addEventListener(
      CANNON.Body.COLLIDE_EVENT_NAME,
      this.onCollide.bind(this)
    );
  }

  removeEventListeners(): void {
    this.body.removeEventListener(
      CANNON.Body.COLLIDE_EVENT_NAME,
      this.onCollide.bind(this)
    );
  }

  destroy(): void {
    super.destroy();
    eventService.emit(Events.REMOVE_INSTANCE, this);
  }

  update(): void {
    this.instance.rotation.y += this.isCollected ? 0.02 : 0.01;
    if (this.isCollected) {
      this.instance.position.y += 0.02;
      // Update the opacity
      this.opacity -= this.fadeSpeed;
      this.opacity = Math.max(0, this.opacity); // Ensure opacity doesn't go below 0

      // Update the material's opacity
      (this.instance.material as THREE.Material).opacity = this.opacity;
    }
  }
}
