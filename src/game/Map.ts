import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { GameEntity } from '../engine/GameEntity';

export class Map implements GameEntity {
  public instance!: THREE.Object3D;
  public physicBody!: CANNON.Body;
  public proxies: any = {};
  public checkpoints: any = [];
  private sun!: THREE.DirectionalLight;

  constructor(private engine: Engine) {
    this.initObject3D();
    this.addSun();
    this.initPhysics();
  }

  initObject3D(): void {
    this.instance = this.engine.resources.getItem('Map').scene;
    // Make map parts receive a shadow
    this.instance.traverse((child) => {
      if (child.type === 'Mesh') child.receiveShadow = true;
    });
    const roadModels = this.instance.children.filter(
      (child) => child.name.includes('road') || child.name.includes('ramp')
    );
    roadModels.forEach((roadModel) => {
      this.engine.scene.add(roadModel);
    });
  }

  addSun(): void {
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.position.set(40, 100, -20);
    this.sun.castShadow = true;
    this.engine.scene.add(this.sun);

    const helper = new THREE.DirectionalLightHelper(this.sun, 5);
    this.engine.scene.add(helper);
  }

  initPhysics(): void {
    const shape = new CANNON.Plane();
    const body = new CANNON.Body({ mass: 0 });
    body.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    body.addShape(shape);
    this.engine.physics.instance.addBody(body);

    const colliders = this.instance.children.filter((child) =>
      child.name.includes('collider')
    );
    colliders.forEach((collider: THREE.Object3D) =>
      this.createCollider(collider)
    );
  }

  createCollider(collider: THREE.Object3D): void {
    const shape = new CANNON.Box(
      new CANNON.Vec3(collider.scale.x, collider.scale.y, collider.scale.z)
    );
    const body = new CANNON.Body({ mass: 0 });
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
    this.engine.physics.instance.addBody(body);
  }

  update(): void {}
}
