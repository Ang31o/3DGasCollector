import * as THREE from 'three';
import { RenderEngine } from './RenderEngine';
import { RenderLoop } from './RenderLoop';
import { DebugUI } from './interface/DebugUI';
import { Sizes } from './Sizes';
import { Camera } from './Camera';
import { Resources } from './Resources';
import { InfoConfig, InfoUI } from './interface/InfoUI';
import { Experience, ExperienceConstructor } from './Experience';
import { Loader } from './interface/Loader';
import { Raycaster } from './Raycaster';
import { Physics } from './Physics';
import eventService from './utilities/eventService';
import { Events } from '../events';
import { GameState } from '../game/state/GameState';
import { GamePhase } from './core/enums/GamePhase.enum';
import { AudioPlayer } from './AudioPlayer';

export class Engine {
  public readonly camera!: Camera;
  public readonly scene!: THREE.Scene;
  public readonly renderEngine!: RenderEngine;
  public readonly time!: RenderLoop;
  public debug!: DebugUI;
  public readonly raycaster!: Raycaster;
  public infoUI!: InfoUI;
  public readonly sizes!: Sizes;
  public readonly canvas!: HTMLCanvasElement;
  public readonly resources!: Resources;
  public readonly experience!: Experience;
  public readonly physics: Physics;
  public audioPlayer!: AudioPlayer;
  private readonly loader!: Loader;
  private info: InfoConfig | undefined;
  private resourcesLoaded: boolean = false;

  constructor({
    canvas,
    experience,
    info,
  }: {
    canvas: HTMLCanvasElement;
    experience: ExperienceConstructor;
    info?: InfoConfig;
  }) {
    if (!canvas) {
      throw new Error('No canvas provided');
    }
    this.info = info;
    this.canvas = canvas;
    this.sizes = new Sizes(this);
    this.time = new RenderLoop(this);
    this.scene = new THREE.Scene();
    this.debug = new DebugUI();
    this.camera = new Camera(this);
    this.raycaster = new Raycaster(this);
    this.renderEngine = new RenderEngine(this);
    this.experience = new experience(this);
    this.resources = new Resources(this.experience.resources);
    this.loader = new Loader();
    this.physics = new Physics(this);

    this.resources.on('loaded', () => {
      this.experience.init();
      this.loader.complete();
      this.resourcesLoaded = true;
      // Delay the initialization of audio player to be sure it's loaded correctly
      setTimeout(() => (this.audioPlayer = new AudioPlayer(this)), 500);
    });

    this.resources.on('progress', (progress: number) => {
      this.loader.setProgress(progress);
    });
    this.addEventListeners();
  }

  onStartGame(): void {
    this.infoUI = new InfoUI(this.info);
    GameState.updateGamePhase(GamePhase.GAME_START);
  }

  addEventListeners(): void {
    eventService.on(Events.START_GAME, this.onStartGame, this);
  }

  update(delta: number) {
    if (!this.resourcesLoaded) return;
    this.camera.update();
    this.renderEngine.update();
    this.experience.update(delta);
    this.debug.update();
    this.physics.update();
  }

  resize() {
    this.camera.resize();
    this.renderEngine.resize();
    if (this.experience.resize) {
      this.experience.resize();
    }
  }
}
