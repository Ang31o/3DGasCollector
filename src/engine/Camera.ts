import * as THREE from 'three';
import { CSM } from 'three/examples/jsm/csm/CSM';
import GUI from 'lil-gui';
import { Engine } from './Engine';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GameEntity } from './GameEntity';
import eventService from './utilities/eventService';
import { Events } from '../events';

export class Camera extends GameEntity {
  public csm!: CSM;
  public declare instance: THREE.PerspectiveCamera;
  private gui!: GUI;
  private orbitControls!: OrbitControls;
  private followTarget!: THREE.Object3D<THREE.Object3DEventMap>;

  constructor(private engine: Engine) {
    super();
    this.initCamera();
    this.addCascadeShadowMaps();
    this.initControls();
    this.initGui();
    this.addEventListeners();
  }

  private initCamera() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.instance.position.z = -7;
    this.instance.position.y = 2.5;
    this.engine.scene.add(this.instance);
  }

  addCascadeShadowMaps(): void {
    this.csm = new CSM({
      fade: true,
      far: this.instance.far,
      cascades: 4,
      shadowMapSize: 4096,
      lightDirection: new THREE.Vector3(-1, -1, 0),
      camera: this.instance,
      parent: this.engine.scene,
      lightIntensity: 0.5,
    });
  }

  initGui(): void {
    this.engine.debug.gui
      .add(this.orbitControls, 'enabled')
      .name('Enable Orbit Controls')
      .onChange((isEnabled: boolean) => {
        // Focus on car with orbit controls
        localStorage.setItem('orbitControlsEnabled', isEnabled.toString());
        this.orbitControls.target = this.followTarget.parent
          ?.position as THREE.Vector3;
      });
  }

  private initControls() {
    this.orbitControls = new OrbitControls(this.instance, this.engine.canvas);
    this.orbitControls.update();
    this.orbitControls.enabled =
      localStorage.getItem('orbitControlsEnabled') === 'true';
  }

  resize() {
    this.instance.aspect = this.engine.sizes.aspectRatio;
    this.instance.updateProjectionMatrix();
  }

  setFollowObject(objectToFollow: THREE.Object3D): void {
    this.followTarget = new THREE.Object3D();
    this.followTarget.position.copy(this.instance.position);
    this.engine.scene.add(this.followTarget);
    this.followTarget.parent = objectToFollow; // Mnogo bitna stvar da bi lepo pratio i position i quaternion od kola
  }

  addEventListeners(): void {
    eventService.on(Events.SET_CAMERA_FOLLOW, this.setFollowObject, this);
  }

  update() {
    // OrbitControls i bilo koje drugo pomeranje camere NE IDU ZAJEDNO!!!
    if (this.orbitControls.enabled) {
      this.orbitControls.update();
    } else if (this.followTarget) {
      this.instance.position.lerp(
        this.followTarget.getWorldPosition(new THREE.Vector3()),
        0.05
      );
      this.engine.camera.instance.lookAt(
        this.followTarget.parent?.position as THREE.Vector3
      );
    }
    this.csm?.update();
  }
}
