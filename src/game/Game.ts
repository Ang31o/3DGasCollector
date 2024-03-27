import { Engine } from '../engine/Engine';
import * as THREE from 'three';
import { Experience } from '../engine/Experience';
import { resources } from './sources';
import { Resource } from '../engine/Resources';
import { Car } from './Car';
import { Map } from './Map';

export class Game implements Experience {
  resources: Resource[] = resources;
  private car!: Car;
  private map!: Map;

  constructor(private engine: Engine) {}

  init() {
    this.engine.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    this.map = new Map(this.engine);
    this.car = new Car(this.engine);
    this.engine.scene.background = this.engine.resources.getItem('SkyBox');

    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.y = 1;
    this.engine.scene.add(axesHelper);
  }

  resize() {}

  update(delta: number) {
    this.map.update(delta);
    this.car.update(delta);
  }
}
