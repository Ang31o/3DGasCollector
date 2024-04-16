import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import { Exhaust } from './exhaust/Exhaust';
import eventService from '../engine/utilities/eventService';
import { Events } from '../events';
import { Constants } from '../constants';
import { GameState } from './state/GameState';
import { Wheels } from './Wheels';

export class Car extends BaseEntity {
  public vehicle: CANNON.RaycastVehicle;
  public prop = {
    carLength: 1.6,
    carHeight: 0.5,
    carWidth: 1.2,
    wheelRadius: 0.3,
  };
  private exhaust!: Exhaust;
  private maxSteerVal: number = 1; // How sharp it steers
  private minForceForward: number = 300;
  private maxForceForward: number = 1000;
  private forceForward: number = 1000; // How fast it goes
  private forceBackward: number = 500; // How fast it goes
  private brakeForce: number = 5; // How fast it brakes
  private movementKeys = ['w', 'a', 's', 'd', ' '];
  private pressedKeys: string[] = [];
  private lightBrakeLeftMaterial: THREE.MeshStandardMaterial;
  private lightBrakeRightMaterial: THREE.MeshStandardMaterial;
  private surfaceDetectionBody: CANNON.Body;

  constructor(private engine: Engine) {
    super();
    this.initObject3D();
    this.initPhysics();
    this.addEventListeners();
  }

  initObject3D(): void {
    this.instance = this.engine.resources.getItem('Car').scene;
    // Make car parts cast a shadow
    this.instance.traverse((child) => {
      if (child.type === 'Mesh') child.castShadow = true;
    });
    const lightBrakeLeft = this.instance.getObjectByName(
      'lightBrakeLeft'
    ) as THREE.Mesh;
    this.lightBrakeLeftMaterial =
      lightBrakeLeft?.material as THREE.MeshStandardMaterial;
    const lightBrakeRight = this.instance.getObjectByName(
      'lightBrakeRight'
    ) as THREE.Mesh;
    this.lightBrakeRightMaterial =
      lightBrakeRight?.material as THREE.MeshStandardMaterial;

    this.instance.position.set(0, 0.32, 0);
    this.engine.scene.add(this.instance);
    eventService.emit(Events.SET_CAMERA_FOLLOW, this.instance);
    this.exhaust = new Exhaust(this.engine, this);
  }

  initPhysics(): void {
    // ADD CAR
    const chassisShape = new CANNON.Box(
      new CANNON.Vec3(
        this.prop.carWidth,
        this.prop.carHeight,
        this.prop.carLength
      )
    );
    this.body = new CANNON.Body({
      mass: 170,
      material: new CANNON.Material('carMaterial'),
    });
    this.body.addShape(chassisShape);
    this.body.position.set(
      Constants.STARTING_POINT.x,
      Constants.STARTING_POINT.y,
      Constants.STARTING_POINT.z
    );
    this.engine.physics.world.addBody(this.body);
    // SurfaceDetectionBody will be used as a dynamic body type which will detect the map's surface between road and grass
    this.surfaceDetectionBody = new CANNON.Body({
      mass: 1,
      collisionResponse: false,
    });
    const surfaceDetectionShape = new CANNON.Box(
      new CANNON.Vec3(
        this.prop.carWidth,
        this.prop.carHeight + 1,
        this.prop.carLength
      )
    );
    this.surfaceDetectionBody.addShape(surfaceDetectionShape);
    this.engine.physics.world.addBody(this.surfaceDetectionBody);

    // CREATE VEHICLE
    this.vehicle = new CANNON.RaycastVehicle({
      chassisBody: this.body,
      indexForwardAxis: 2,
      indexRightAxis: 0,
      indexUpAxis: 1,
    });
    new Wheels(this.engine, this);
    this.vehicle.addToWorld(this.engine.physics.world);
  }

  onForward(forceValue: number): void {
    if (forceValue < 0 && GameState.gas <= 0) return;
    this.vehicle.applyEngineForce(forceValue, 0);
    this.vehicle.applyEngineForce(forceValue, 1);
    GameState.burnGas();
    eventService.emit(Events.GAS, forceValue !== 0);
  }

  onReverse(): void {
    if (GameState.gas <= 0) return;
    this.vehicle.applyEngineForce(this.forceBackward, 0);
    this.vehicle.applyEngineForce(this.forceBackward, 1);
    GameState.burnGas();
    eventService.emit(Events.GAS);
  }

  onSteer(direction: number): void {
    this.vehicle.setSteeringValue(this.maxSteerVal * direction, 0);
    this.vehicle.setSteeringValue(this.maxSteerVal * direction, 1);
  }

  onBrake(brakeForce: number): void {
    this.lightBrakeLeftMaterial.emissive.r = brakeForce;
    this.lightBrakeRightMaterial.emissive.r = brakeForce;
    this.vehicle.setBrake(brakeForce, 0);
    this.vehicle.setBrake(brakeForce, 1);
    this.vehicle.setBrake(brakeForce, 2);
    this.vehicle.setBrake(brakeForce, 3);
  }

  stopVehicle() {
    this.vehicle.chassisBody.velocity.copy(
      this.vehicle.chassisBody.initVelocity
    );
  }

  updateMovement(): void {
    if (this.pressedKeys.length === 0) return;

    if (this.pressedKeys.indexOf('w') > -1) {
      this.onForward(-this.forceForward);
    }
    if (this.pressedKeys.indexOf('s') > -1) {
      this.onReverse();
    }
    if (this.pressedKeys.indexOf('a') > -1) {
      this.onSteer(1);
    }
    if (this.pressedKeys.indexOf('d') > -1) {
      this.onSteer(-1);
    }
    if (this.pressedKeys.indexOf(' ') > -1) {
      this.onBrake(this.brakeForce);
    }
  }

  updateMovementStop(eventKey: string): void {
    if (eventKey === 'w' || eventKey === 's') {
      this.onForward(0);
    }
    if (eventKey === 'a' || eventKey === 'd') {
      this.onSteer(0);
    }
    if (eventKey === ' ') {
      this.onBrake(0);
    }
  }

  updateEngineSound(): void {
    this.engine.audioPlayer?.setCarEngineSpeed(
      this.vehicle.currentVehicleSpeedKmHour
    );
  }

  resetToLastCheckpoint(): void {
    this.body.position.copy(GameState.lastCheckpoint.p);
    this.body.quaternion.copy(GameState.lastCheckpoint.q);
    GameState.loadCheckpoint();
    this.stopVehicle();
    this.forceForward = this.maxForceForward;
    eventService.emit(Events.CHECKPOINT_LOAD);
  }

  addKeyboardControls(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'r') {
        this.resetToLastCheckpoint();
        return;
      }
      if (
        this.pressedKeys.indexOf(event.key) === -1 &&
        this.movementKeys.indexOf(event.key) > -1
      ) {
        this.pressedKeys.push(event.key);
      }
    });

    document.addEventListener('keyup', (event) => {
      const keyIndex = this.pressedKeys.indexOf(event.key);
      if (keyIndex > -1) {
        this.pressedKeys.splice(keyIndex, 1);
        this.updateMovementStop(event.key);
      }
    });
  }

  onCheckpointPassed(gas: number): void {
    GameState.addGas(gas);
    GameState.checkpointPassed(
      this.body.position.clone(),
      this.body.quaternion.clone()
    );
    eventService.emit(Events.UPDATE_SCORE);
  }

  onStartRace(): void {
    this.addKeyboardControls();
  }

  onUpdateSpeed(surfaceMaterial: string): void {
    this.forceForward =
      surfaceMaterial === 'grassMaterial'
        ? this.minForceForward
        : this.maxForceForward;
  }

  addEventListeners(): void {
    eventService.on(Events.CHECKPOINT_PASSED, this.onCheckpointPassed, this);
    eventService.on(Events.RACE_START, this.onStartRace, this);
    eventService.on(Events.UPDATE_SPEED, this.onUpdateSpeed, this);
  }

  update(delta: number): void {
    this.updateMovement();
    this.instance.position.set(
      this.body.position.x,
      this.body.position.y,
      this.body.position.z
    );
    this.instance.quaternion.set(
      this.body.quaternion.x,
      this.body.quaternion.y,
      this.body.quaternion.z,
      this.body.quaternion.w
    );
    // SurfaceDetectionBody will just follow the car body and return the velocity values to initial
    this.surfaceDetectionBody.position.copy(this.body.position);
    this.surfaceDetectionBody.quaternion.copy(this.body.quaternion);
    this.surfaceDetectionBody.velocity.copy(
      this.surfaceDetectionBody.initVelocity
    );
    this.exhaust.update(delta);
  }
}
