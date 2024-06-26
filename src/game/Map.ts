import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import { Events } from '../events';
import { GasCheckpoint } from './GasCheckpoint';
import eventService from '../engine/utilities/eventService';
import { Bump } from './Bump';
import { GameState } from './state/GameState';
import { FinishCheckpoint } from './FinishCheckpoint';

export class Map extends BaseEntity {
  public physicBody!: CANNON.Body;
  public proxies: any = {};
  public checkpoints: GasCheckpoint[] = [];
  public bumps: Bump[] = [];
  private sun!: THREE.DirectionalLight;
  private lightStartLeftMaterial: THREE.MeshStandardMaterial;
  private lightStartRightMaterial: THREE.MeshStandardMaterial;
  private currentSurfaceMaterial: string | undefined = 'roadMaterial';

  constructor(private engine: Engine) {
    super();
    this.initObject3D();
    this.addSun();
    this.initPhysics();
    this.addEventListeners();
  }

  initObject3D(): void {
    this.instance = this.engine.resources.getItem('Map').scene;
    const shadowCasters = ['tree', 'grandStand', 'pylon', 'tent', 'checkpoint'];
    const shadowReceivers = ['grass', 'road'];
    // Make map parts receive a shadow
    this.instance.traverse((child) => {
      if (child.type === 'Mesh') {
        if (!child.name.includes('collider')) {
          if (shadowCasters.find((s) => child.name.indexOf(s) > -1))
            child.castShadow = true;
          if (shadowReceivers.find((s) => child.name.indexOf(s) > -1))
            child.receiveShadow = true;
        }
      }
    });
    const lighthStartLeft = this.instance.getObjectByName(
      'lightStartLeft'
    ) as THREE.Mesh;
    this.lightStartLeftMaterial =
      lighthStartLeft?.material as THREE.MeshStandardMaterial;
    this.lightStartLeftMaterial.emissive.r = 1;
    const lighthStartRight = this.instance.getObjectByName(
      'lightStartRight'
    ) as THREE.Mesh;
    this.lightStartRightMaterial =
      lighthStartRight?.material as THREE.MeshStandardMaterial;
    this.lightStartRightMaterial.emissive.r = 1;
    this.engine.scene.add(this.instance);
  }

  addSun(): void {
    this.sun = new THREE.DirectionalLight(0xffffff, 0.5);
    this.sun.position.set(40, 100, -20);
    this.engine.scene.add(this.sun);

    if (localStorage.getItem('debug') === 'true') {
      const helper = new THREE.DirectionalLightHelper(this.sun, 5);
      this.engine.scene.add(helper);
    }
  }

  initPhysics(): void {
    // const shape = new CANNON.Plane();
    // const body = new CANNON.Body({
    //   mass: 0,
    //   material: new CANNON.Material('grassMaterial'),
    // });
    // body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    // body.position.set(0, -0.7, 0);
    // body.addShape(shape);
    // this.engine.physics.world.addBody(body);
    this.checkpoints = [];
    this.instance.children.forEach((child: THREE.Object3D | THREE.Mesh) => {
      if (child.name.includes('collider')) this.createRoadCollider(child);
      if (child instanceof THREE.Mesh) {
        if (child.name.includes('checkpoint')) this.createCheckpoint(child);
        if (child.name.includes('pylon')) this.createBump(child);
        if (child.name.includes('finish')) this.createFinish(child);
      }
    });
    GameState.setMaxScore(this.checkpoints.length);
    eventService.emit(Events.UPDATE_SCORE);
  }

  createRoadCollider(collider: THREE.Object3D): void {
    const shape = collider.name.includes('Cube')
      ? new CANNON.Box(
          new CANNON.Vec3(collider.scale.x, collider.scale.y, collider.scale.z)
        )
      : new CANNON.Cylinder(
          collider.scale.x,
          collider.scale.z,
          collider.scale.y,
          32
        );
    // Do not render the 3D cube model
    collider.visible = false;
    const body = new CANNON.Body({
      type: CANNON.Body.STATIC,
      material: collider.name.includes('Grass')
        ? new CANNON.Material('grassMaterial')
        : new CANNON.Material('roadMaterial'),
    });
    body.addShape(shape);
    body.position.set(
      collider.position.x,
      collider.position.y,
      collider.position.z
    );
    body.quaternion.set(
      collider.quaternion.x,
      collider.quaternion.y,
      collider.quaternion.z,
      collider.quaternion.w
    );
    body.addEventListener(
      CANNON.Body.COLLIDE_EVENT_NAME,
      this.onCollide.bind(this)
    );
    this.engine.physics.world.addBody(body);
  }

  createCheckpoint(checkpoint: THREE.Mesh): void {
    this.checkpoints.push(new GasCheckpoint(this.engine, checkpoint));
  }

  createBump(bump: THREE.Mesh): void {
    this.bumps.push(new Bump(this.engine, bump));
  }

  createFinish(finishCube: THREE.Mesh): void {
    new FinishCheckpoint(this.engine, finishCube);
  }

  onRemoveInstance(checkpointInstance: GasCheckpoint): void {
    if (checkpointInstance instanceof GasCheckpoint) {
      this.checkpoints.splice(this.checkpoints.indexOf(checkpointInstance), 1);
    }
  }

  onStartRace(): void {
    this.lightStartLeftMaterial.emissive.r = 0;
    this.lightStartRightMaterial.emissive.r = 0;
    this.lightStartLeftMaterial.emissive.g = 1;
    this.lightStartRightMaterial.emissive.g = 1;
  }

  onCheckpointPassed(): void {
    this.lightStartLeftMaterial.emissive.g = 0;
    this.lightStartRightMaterial.emissive.g = 0;
  }

  onCollide(event: {
    body: CANNON.Body;
    contact: CANNON.ContactEquation;
    target: CANNON.Body;
    type: string;
  }): void {
    if (this.currentSurfaceMaterial !== event.target.material?.name) {
      this.currentSurfaceMaterial = event.target.material?.name;
      eventService.emit(Events.UPDATE_SPEED, this.currentSurfaceMaterial);
    }
  }

  addEventListeners(): void {
    eventService.on(Events.REMOVE_INSTANCE, this.onRemoveInstance, this);
    eventService.on(Events.RACE_START, this.onStartRace, this);
    eventService.on(Events.CHECKPOINT_PASSED, this.onCheckpointPassed, this);
  }

  update(): void {
    this.checkpoints.forEach((checkpoint: GasCheckpoint) =>
      checkpoint.update()
    );
    this.bumps.forEach((bump: Bump) => bump.update());
  }
}
