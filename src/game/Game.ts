import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Engine } from '../engine/Engine';
import { Experience } from '../engine/Experience';
import { resources } from './sources';
import { Resource } from '../engine/Resources';
import { Car } from './Car';
import { Map } from './Map';
import { GameState } from './state/GameState';
import { StartCountdown } from './StartCountdown';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';

export class Game implements Experience {
  resources: Resource[] = resources;
  public car: Car;
  public map: Map;
  public startCountdown?: StartCountdown;

  constructor(private engine: Engine) {}

  init() {
    GameState.init();
    this.engine.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    this.addBackground();

    const color = 0xe2e2e3;
    this.engine.scene.fog = new THREE.Fog(color, 10, 130);

    if (localStorage.getItem('debug') === 'true') {
      const axesHelper = new THREE.AxesHelper(5);
      axesHelper.position.y = 1;
      this.engine.scene.add(axesHelper);
    }
    this.addMapAndCar();
    this.addEventListeners();
  }

  addMapAndCar(): void {
    this.map = new Map(this.engine);
    this.car = new Car(this.engine);
  }

  addBackground(): void {
    const sky = new Sky();
    sky.scale.setScalar(1000);
    this.engine.scene.add(sky);
    const sun = new THREE.Vector3();

    const effectController = {
      turbidity: 10,
      rayleigh: 0.3,
      mieCoefficient: 0,
      mieDirectionalG: 0,
      elevation: 17,
      azimuth: 180,
    };

    const uniforms = sky.material.uniforms;
    uniforms['turbidity'].value = effectController.turbidity;
    uniforms['rayleigh'].value = effectController.rayleigh;
    uniforms['mieCoefficient'].value = effectController.mieCoefficient;
    uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    uniforms['sunPosition'].value.copy(sun);

    sky.material.uniforms['sunPosition'].value.copy(sun);
  }

  onStartGame(): void {
    setTimeout(
      () => (this.startCountdown = new StartCountdown(this.engine)),
      1500
    );
  }

  resize() {}

  onRemoveInstance(instance: any) {
    if (instance instanceof StartCountdown) {
      delete this.startCountdown;
    }
  }

  addEventListeners(): void {
    eventService.on(Events.REMOVE_INSTANCE, this.onRemoveInstance, this);
    eventService.on(Events.START_GAME, this.onStartGame, this);
  }

  update(delta: number) {
    this.map.update();
    this.car.update(delta);
    this.startCountdown?.update();
  }
}
