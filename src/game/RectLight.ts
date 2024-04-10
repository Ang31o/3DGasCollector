import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper';
import { BaseEntity } from '../engine/BaseEntity';

export class RectLight {
  public instance!: THREE.RectAreaLight;
  public lightHelper!: RectAreaLightHelper;
  public isLightOn!: boolean;

  constructor(
    private gameEntity: BaseEntity,
    private lightModelName: string,
    private lightProps: {
      color: number;
      intensity: number;
      width: number;
      height: number;
      displayHelper: boolean;
      visible: boolean;
    }
  ) {
    this.init();
    this.toggleLight(lightProps.visible);
  }

  init(): void {
    this.instance = new THREE.RectAreaLight(
      this.lightProps.color,
      this.lightProps.intensity,
      this.lightProps.width,
      this.lightProps.height
    );
    const lightModel = this.gameEntity.instance.getObjectByName(
      this.lightModelName
    );
    if (lightModel) {
      // Hide the light model so only the helper and light will be rendered
      lightModel.visible = false;
      this.instance.position.copy(lightModel.position);
      // Must be rotated by 90deg because Blender model rotation is not the same as in ThreeJS
      const quaternion = new THREE.Quaternion();
      quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
      this.instance.quaternion.copy(lightModel.quaternion.multiply(quaternion));
    }
    this.gameEntity.instance.add(this.instance);
    if (this.lightProps.displayHelper) {
      this.lightHelper = new RectAreaLightHelper(this.instance);
      this.gameEntity.instance.add(this.lightHelper);
    }
  }

  changeLightColor(color: number): this {
    this.instance.color = new THREE.Color(color);
    return this;
  }

  toggleLight(isVisible: boolean): this {
    this.instance.visible = isVisible;
    if (this.lightHelper) this.lightHelper.visible = isVisible;
    this.isLightOn = isVisible;
    return this;
  }
}
