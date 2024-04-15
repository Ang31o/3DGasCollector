import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';
import { Font } from 'three/examples/jsm/loaders/FontLoader';

export class StartCountdown extends BaseEntity {
  private geometry: TextGeometry;
  private material: THREE.MeshMatcapMaterial;
  private textGeometryParameters: any = {
    font: Font,
    size: 5,
    height: 0.2,
    curveSegments: 6,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 0.3,
    bevelOffset: 0,
    bevelSegments: 3,
  };
  private texts: string[] = ['3', '2', '1', 'GO!'];
  private textsCounter: number = 0;
  private startupTime: number;

  constructor(private engine: Engine) {
    super();
    this.textGeometryParameters.font =
      this.engine.resources.getItem('Airstrike');
    this.startupTime = this.engine.time.currentTime;
    this.setText(this.texts[this.textsCounter]);
  }

  setText(text: string): void {
    this.destroy();
    if (text !== 'GO!') eventService.emit(Events.COUNTDOWN);
    this.geometry = new TextGeometry(text, this.textGeometryParameters);
    this.geometry.center();
    this.material = new THREE.MeshMatcapMaterial({
      matcap: this.engine.resources.getItem('matcap5'),
    });
    this.material.transparent = true;
    this.instance = new THREE.Mesh(this.geometry, this.material);
    this.instance.position.set(0, 5, -1);
    this.instance.scale.x = -1;
    this.instance.castShadow = true;
    this.engine.scene.add(this.instance);
  }

  moveCloser(): void {
    this.instance.position.z -= 0.05;
    if (
      this.engine.time.currentTime - this.startupTime >=
      this.textsCounter + 1
    ) {
      this.textsCounter++;
      this.setText(this.texts[this.textsCounter]);
      if (this.texts[this.textsCounter] === 'GO!') {
        eventService.emit(Events.RACE_START);
      }
    }
  }

  fadeOut(): void {
    this.material.opacity -= 0.01;
    if (this.material.opacity <= 0) {
      this.destroy();
      eventService.emit(Events.REMOVE_INSTANCE, this);
    }
  }

  update(): void {
    if (this.textsCounter < this.texts.length - 1) {
      this.moveCloser();
    } else {
      this.fadeOut();
    }
  }
}
