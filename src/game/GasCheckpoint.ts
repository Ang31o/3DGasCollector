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
    this.addEventListeners();
  }

  initPhysics(): void {
    const shape = new CANNON.Box(
      new CANNON.Vec3(
        this.instance.scale.x,
        this.instance.scale.y,
        this.instance.scale.z
      )
    );
    this.body = new CANNON.Body({
      mass: 0,
      collisionResponse: false, // Don't slow down the car when collided
      material: new CANNON.Material('checkpointMaterial'),
    });
    this.body.addShape(shape);
    this.body.position.set(
      this.instance.position.x,
      this.instance.position.y,
      this.instance.position.z
    );
    this.engine.physics.world.addBody(this.body);
  }

  onCollide(): void {
    if (!this.isCollected) {
      eventService.emit(Events.REMOVE_BODY, this.body);
      eventService.emit(Events.CHECKPOINT_PASSED, this.gas);
      this.isCollected = true;
      // Must clone a material so we can fade-out just this collected checkpoint box and not all others,
      // bc they are sharing the same material
      this.instance.material = (
        this.instance.material as THREE.Material
      ).clone();
      this.instance.material.transparent = true;

      setTimeout(() => this.destroy(), 2000);
    }
  }

  addEventListeners(): void {
    this.body.addEventListener(
      CANNON.Body.COLLIDE_EVENT_NAME,
      this.onCollide.bind(this)
    );
  }

  destroy(): void {
    this.instance.parent?.remove(this.instance);
    this.instance.geometry.dispose();
    for (const key in this.instance.material) {
      const value = this.instance.material[key];
      if (value && typeof value.dispose === 'function') {
        value.dispose();
      }
    }
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
