import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import eventService from './utilities/eventService';
import { Events } from '../events';
export class BaseEntity {
  public instance: THREE.Mesh | THREE.Group | THREE.PerspectiveCamera;
  public body: CANNON.Body;
  constructor() {}

  update?(delta: number): void;
  resize(): void {}
  removeEventListeners(): void {}

  destroy(): void {
    this.instance?.parent?.remove(this.instance);
    if (this.instance instanceof THREE.Mesh) {
      this.instance.geometry?.dispose();
      this.destroyMaterialOfMesh(this.instance);
    } else if (this.instance instanceof THREE.Group) {
      this.instance.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          this.destroyMaterialOfMesh(child);
        }
      });
    }
    if (this.body) {
      eventService.emit(Events.REMOVE_BODY, this.body);
    }
    this.removeEventListeners();
  }

  destroyMaterialOfMesh(instance: THREE.Mesh): void {
    if (Array.isArray(instance.material)) {
      instance.material.forEach((child) => {
        child.dispose();
        this.destroyTexture(child);
      });
    } else {
      instance.material.dispose();
      this.destroyTexture(instance.material);
    }
  }

  destroyTexture(material: THREE.Material): void {
    if (material instanceof THREE.MeshMatcapMaterial) {
      material.matcap?.dispose();
    }
  }
}
