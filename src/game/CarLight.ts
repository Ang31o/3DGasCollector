import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { Car } from './Car';
import eventService from '../engine/utilities/eventService';

export class CarLight {
  public instance!: THREE.RectAreaLight;
  public lightHelper!: RectAreaLightHelper;

  constructor(
    private car: Car,
    private lightModelName: string,
    private lightProps: {
      color: number;
      intensity: number;
      width: number;
      height: number;
    },
    private displayHelper?: boolean,
    private toggleVisibilityEvent?: string
  ) {
    this.init();
    this.addEventListeners();
  }

  init(): void {
    this.instance = new THREE.RectAreaLight(
      this.lightProps.color,
      this.lightProps.intensity,
      this.lightProps.width,
      this.lightProps.height
    );
    const lightModel = this.car.instance.getObjectByName(this.lightModelName);
    if (lightModel) {
      lightModel.visible = false;
      this.instance.position.copy(lightModel.position);
    }
    this.car.instance.add(this.instance);
    if (this.displayHelper) {
      this.lightHelper = new RectAreaLightHelper(this.instance);
      this.car.instance.add(this.lightHelper);
      this.lightHelper.visible = !this.toggleVisibilityEvent;
    }
    this.instance.visible = !this.toggleVisibilityEvent;
  }

  onToggleEvent(isPressed: boolean): void {
    this.instance.visible = isPressed;
    if (this.lightHelper) this.lightHelper.visible = isPressed;
  }

  addEventListeners(): void {
    if (this.toggleVisibilityEvent) {
      eventService.on(this.toggleVisibilityEvent, this.onToggleEvent, this);
    }
  }
}
