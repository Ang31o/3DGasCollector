import * as THREE from 'three';

export class Box extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 'green',
    });

    super(geometry, material);
  }
}
