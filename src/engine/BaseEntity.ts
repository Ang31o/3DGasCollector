import * as THREE from 'three';
import * as CANNON from 'cannon-es';
export class BaseEntity {
  public instance: THREE.Mesh | THREE.Group | THREE.PerspectiveCamera;
  public body: CANNON.Body;
  constructor() {}

  update?(delta: number): void;
  resize?(): void;
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
    this.body?.shapes.forEach((shape) => this.body?.removeShape(shape));
  }

  destroyMaterialOfMesh(instance: THREE.Mesh): void {
    if (Array.isArray(instance.material)) {
      instance.material.forEach((child) => child.dispose());
    } else {
      instance.material.dispose();
    }
  }
}
