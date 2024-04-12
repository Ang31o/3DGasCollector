import { Engine } from '../engine/Engine';
import * as THREE from 'three';
import { Box } from './Box';
import { Experience } from '../engine/Experience';
import { Resource } from '../engine/Resources';

export class Demo implements Experience {
  resources: Resource[] = [];
  box: Box;

  constructor(private engine: Engine) {}

  init() {
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    this.engine.scene.add(plane);
    this.engine.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.castShadow = true;
    directionalLight.position.set(2, 2, 2);

    this.engine.scene.add(directionalLight);

    this.box = new Box();
    this.box.castShadow = true;
    this.box.rotation.y = Math.PI / 4;
    this.box.position.set(0, 0.5, 0);

    this.engine.scene.add(this.box);
  }

  resize() {}

  update() {
    this.box.rotation.x += 0.1;
  }
}
