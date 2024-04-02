import { Engine } from '../engine/Engine';
import * as THREE from 'three';
import { Experience } from '../engine/Experience';
import { resources } from './sources';
import { Resource } from '../engine/Resources';
import { Car } from './Car';
import { Map } from './Map';
import { GameState } from './state/GameState';
import { StartCountdown } from './StartCountdown';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';
import { formatTime } from '../engine/utilities/Number-Utils';

export class Game implements Experience {
  resources: Resource[] = resources;
  public car: Car;
  public map: Map;
  public startCountdown: StartCountdown;

  constructor(private engine: Engine) {}

  init() {
    GameState.init();
    this.engine.scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    this.map = new Map(this.engine);
    this.car = new Car(this.engine);
    this.engine.scene.background = this.engine.resources.getItem('SkyBox');
    // const color = 0x9baabb;
    // this.engine.scene.background = new THREE.Color(color);
    // this.engine.scene.fog = new THREE.Fog(color, 10, 50);

    if (localStorage.getItem('debug') === 'true') {
      const axesHelper = new THREE.AxesHelper(5);
      axesHelper.position.y = 1;
      this.engine.scene.add(axesHelper);
    }
    this.addEventListeners();
    setTimeout(this.addStartCountdown.bind(this), 1000);
    // window.g = this;
  }

  addStartCountdown(): void {
    this.startCountdown = new StartCountdown(this.engine);
  }

  resize() {}

  onRemoveInstance(instance: any) {
    if (instance instanceof StartCountdown) {
      delete this.startCountdown;
    }
  }

  onStartRace(): void {
    let time = 0;
    const timeContainer = document.querySelector('#time-container');
    setInterval(() => {
      if (timeContainer) {
        timeContainer.innerHTML = `Race time:\n${formatTime(time)}`;
        time++;
      }
    }, 1000);
  }

  addEventListeners(): void {
    eventService.on(Events.REMOVE_INSTANCE, this.onRemoveInstance, this);
    eventService.on(Events.START_RACE, this.onStartRace, this);
  }

  update(delta: number) {
    this.map.update(delta);
    this.car.update(delta);
    this.startCountdown?.update();
  }
}
