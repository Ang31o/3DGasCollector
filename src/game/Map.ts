import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { GameEntity } from '../engine/GameEntity';
import { RectLight } from './RectLight';
import { Events } from '../events';
import { Checkpoint } from './Checkpoint';
import eventService from '../engine/utilities/eventService';

export class Map extends GameEntity {
  public physicBody!: CANNON.Body;
  public proxies: any = {};
  public checkpoints: any = [];
  private sun!: THREE.DirectionalLight;
  private lightStartLeft: RectLight;
  private lightStartRight: RectLight;
  private roadMaterial: CANNON.Material;

  constructor(private engine: Engine) {
    super();
    this.initObject3D();
    this.addSun();
    this.addLights();
    this.initPhysics();
    this.addEventListeners();
  }

  initObject3D(): void {
    this.instance = this.engine.resources.getItem('Map').scene;
    // Make map parts receive a shadow
    this.instance.traverse((child) => {
      if (child.type === 'Mesh') child.receiveShadow = true;
    });
    this.engine.scene.add(this.instance);
  }

  addSun(): void {
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.position.set(40, 100, -20);
    this.sun.castShadow = true;
    this.engine.scene.add(this.sun);

    if (localStorage.getItem('debug') === 'true') {
      const helper = new THREE.DirectionalLightHelper(this.sun, 5);
      this.engine.scene.add(helper);
    }
  }

  addLights(): void {
    const startLightProps = {
      color: 0xff0000,
      intensity: 50,
      width: 2,
      height: 1,
      displayHelper: true,
    };
    this.lightStartLeft = new RectLight(
      this,
      'lightStartLeft',
      startLightProps
    );
    this.lightStartRight = new RectLight(
      this,
      'lightStartRight',
      startLightProps
    );
  }

  initPhysics(): void {
    // const shape = new CANNON.Plane();
    // const body = new CANNON.Body({ mass: 0 });
    // body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    // body.addShape(shape);
    // this.engine.physics.world.addBody(body);
    this.checkpoints = [];
    this.roadMaterial = new CANNON.Material('roadMaterial');
    this.instance.children.forEach((child: THREE.Object3D) => {
      if (child.name.includes('collider')) this.createRoadCollider(child);
    });
    this.instance.children.forEach((child: THREE.Object3D) => {
      if (child.name.includes('checkpoint')) this.createCheckpoint(child);
    });
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
      mass: 0,
      material: this.roadMaterial,
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
    // body.addEventListener(
    //   CANNON.Body.COLLIDE_EVENT_NAME,
    //   this.onCollide.bind(this)
    // );
    this.engine.physics.world.addBody(body);
  }

  createCheckpoint(checkpoint: THREE.Object3D): void {
    this.checkpoints.push(new Checkpoint(this.engine, checkpoint));
  }

  onRemoveInstance(checkpointInstance: Checkpoint): void {
    if (checkpointInstance instanceof Checkpoint) {
      this.checkpoints.splice(this.checkpoints.indexOf(checkpointInstance), 1);
    }
  }

  onStartRace(): void {
    this.lightStartLeft.changeLightColor(0x00ff00);
    this.lightStartRight.changeLightColor(0x00ff00);
    // this.initContactWheelsRoad();
  }

  // initContactWheelsRoad(): void {
  //   const wheel_ground = new CANNON.ContactMaterial(
  //     this.engine.experience.car.wheelMaterial,
  //     this.roadMaterial,
  //     {
  //       friction: 0.3,
  //       restitution: 100,
  //       contactEquationStiffness: 1000,
  //     }
  //   );
  //   this.engine.physics.world.addContactMaterial(wheel_ground);
  // }

  onCheckpointPassed(): void {
    this.lightStartLeft.toggleLight(false);
    this.lightStartRight.toggleLight(false);
  }

  // onCollide(): void {
  //   eventService.emit(Events.UPDATE_SPEED);
  // }

  addEventListeners(): void {
    eventService.on(Events.REMOVE_INSTANCE, this.onRemoveInstance, this);
    eventService.on(Events.START_RACE, this.onStartRace, this);
    eventService.on(Events.CHECKPOINT_PASSED, this.onCheckpointPassed, this);
  }

  update(delta: number): void {
    this.checkpoints.forEach((checkpoint: Checkpoint) =>
      checkpoint.update(delta)
    );
  }
}
