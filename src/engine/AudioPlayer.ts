import * as THREE from 'three';
import { Engine } from './Engine';
import eventService from './utilities/eventService';
import { Events } from '../events';
import { GameState } from '../game/state/GameState';

export class AudioPlayer {
  private music: THREE.Audio<GainNode>;
  private listener: THREE.AudioListener;
  private carEngine: THREE.Audio<GainNode>;

  constructor(private engine: Engine) {
    this.listener = new THREE.AudioListener();
    this.engine.camera.instance.add(this.listener);
    this.playBackgroundMusic();
    this.playEngineSound();
    this.addEventListeners();
  }

  playBackgroundMusic(): void {
    this.music = new THREE.Audio(this.listener);
    this.music.setBuffer(this.engine.resources.getItem('music'));
    this.fadeInSound(this.music, 1);
    this.music.setLoop(true);
    if (GameState.isMusicOn) this.music.play();
    const fadeInInterval = setInterval(() => {
      this.music.setVolume(this.music.getVolume() + 0.1);
      if (this.music.getVolume() >= 1) {
        clearInterval(fadeInInterval);
        this.music.setVolume(1);
      }
    }, 200);
  }

  playEngineSound(): void {
    this.carEngine = new THREE.Audio(this.listener);
    this.carEngine.setBuffer(this.engine.resources.getItem('engine'));
    this.carEngine.setLoop(true);
    this.fadeInSound(this.carEngine, 0.2);
    if (GameState.isSoundOn) this.carEngine.play();
  }

  setBufferAndPlaySound(soundName: string): void {
    if (!GameState.isSoundOn) return;
    const audio = new THREE.Audio(this.listener);
    audio.setBuffer(this.engine.resources.getItem(soundName));
    audio.play();
  }

  fadeInSound(sound: THREE.Audio, volume: number): void {
    sound.setVolume(0);
    const step = volume / 10;
    const fadeInInterval = setInterval(() => {
      sound.setVolume(sound.getVolume() + step);
      if (sound.getVolume() >= volume) {
        clearInterval(fadeInInterval);
        sound.setVolume(volume);
      }
    }, 200);
  }

  onCheckpoint(): void {
    this.setBufferAndPlaySound('checkpoint');
  }

  onStartGame(): void {
    this.setBufferAndPlaySound('click');
  }

  onCountdown(): void {
    this.setBufferAndPlaySound('beep');
  }

  onStartRace(): void {
    this.setBufferAndPlaySound('beepEnd');
  }

  onFinishRace(): void {
    this.setBufferAndPlaySound('finish1');
    setTimeout(() => this.setBufferAndPlaySound('finish2'), 350);
  }

  onCheckpointLoad(): void {
    this.setBufferAndPlaySound('checkpointLoad');
  }

  onBump(): void {
    this.setBufferAndPlaySound('kick');
  }

  setCarEngineSpeed(carSpeed: number): void {
    this.carEngine.setDetune(carSpeed);
  }

  onUpdateMusic(isMusicOn: boolean): void {
    if (isMusicOn) {
      this.music.play();
    } else {
      this.music.pause();
    }
  }

  onUpdateSound(isSoundOn: boolean): void {
    if (isSoundOn) {
      this.carEngine.play();
    } else {
      this.carEngine.pause();
    }
  }

  addEventListeners(): void {
    eventService.on(Events.CHECKPOINT_PASSED, this.onCheckpoint, this);
    eventService.on(Events.CHECKPOINT_LOAD, this.onCheckpointLoad, this);
    eventService.on(Events.START_GAME, this.onStartGame, this);
    eventService.on(Events.RACE_START, this.onStartRace, this);
    eventService.on(Events.RACE_FINISH, this.onFinishRace, this);
    eventService.on(Events.COUNTDOWN, this.onCountdown, this);
    eventService.on(Events.UPDATE_MUSIC, this.onUpdateMusic, this);
    eventService.on(Events.UPDATE_SOUND, this.onUpdateSound, this);
    eventService.on(Events.BUMP, this.onBump, this);
  }
}
