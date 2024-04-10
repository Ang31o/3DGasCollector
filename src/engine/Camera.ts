import * as THREE from 'three';
import { CSM } from 'three/examples/jsm/csm/CSM';
import { Engine } from './Engine';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import eventService from './utilities/eventService';
import { Events } from '../events';
import { GameState } from '../game/state/GameState';
import { GamePhase } from './core/enums/GamePhase.enum';
import { GameEntity } from './GameEntity';

export class Camera implements GameEntity {
  public csm!: CSM;
  public declare instance: THREE.PerspectiveCamera;
  private orbitControls!: OrbitControls;
  private followTarget!: THREE.Object3D<THREE.Object3DEventMap>;

  constructor(private engine: Engine) {
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
    this.followTarget.parent = objectToFollow; // Needs to be set in order to copy car's position and quaternion properly
  }

  addEventListeners(): void {
    eventService.on(Events.SET_CAMERA_FOLLOW, this.setFollowObject, this);
  }

  rotateAroundTarget(): void {
    // Calculate new position for the camera based on polar coordinates
    const angle = this.engine.time.currentTime * 0.2; // Use time to animate the orbit
    const parent = this.followTarget.parent;
    if (parent) {
      const x = parent?.position.x + 10 * Math.cos(angle);
      const z = parent?.position.z + 10 * Math.sin(angle);
      // Update camera's position
      this.instance.position.set(x, parent?.position.y + 2, z);
    }
  }

  update() {
    if (this.orbitControls.enabled) {
      this.orbitControls.update();
    } else if (this.followTarget) {
      if (GameState.gamePhase === GamePhase.INIT) {
        this.rotateAroundTarget();
      } else if (GameState.gamePhase !== GamePhase.GAME_END) {
        this.instance.position.lerp(
          this.followTarget.getWorldPosition(new THREE.Vector3()),
          0.05
        );
      }
      this.engine.camera.instance.lookAt(
        this.followTarget.parent?.position as THREE.Vector3
      );
    }
    this.csm?.update();
  }
}
