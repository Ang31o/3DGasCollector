import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { Engine } from '../engine/Engine';
import { BaseEntity } from '../engine/BaseEntity';
import { Car } from './Car';

export class Wheels extends BaseEntity {
  private wheelBodies: CANNON.Body[];
  private wheels: THREE.Object3D<THREE.Object3DEventMap>[];
  private wheelOptions = {
    radius: 0,
    directionLocal: new CANNON.Vec3(0, -1, 0), // Direction of down
    suspensionStiffness: 30, // How soft the suspension is
    suspensionRestLength: 0.7, // Suspension height
    maxSuspensionTravel: 0.6, // maxSuspensionTravel can never be more than suspensionRestLength
    frictionSlip: 2,
    dampingRelaxation: 8,
    dampingCompression: 10,
    maxSuspensionForce: 100000,
    axleLocal: new CANNON.Vec3(1, 0, 0), // Axle on this car goes on the X axis
    chassisConnectionPointLocal: new CANNON.Vec3(0, 0, 0), // Dummy value, will be set for each of the wheel we apply
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  } as CANNON.WheelInfo;

  constructor(private engine: Engine, private car: Car) {
    super();
    this.initObject3D();
    this.initPhysics();
    this.addEventListeners();
  }

  initObject3D(): void {
    // Move wheels to a separate objects so they can be updated with world transform on "postStep" event
    this.wheels = this.car.instance.children
      .filter((child) => child.name.includes('wheel'))
      .sort((a, b) => parseInt(a.name) - parseInt(b.name));
    this.engine.scene.add(...this.wheels);
  }

  initPhysics(): void {
    this.setupWheelsPointLocal();
    this.addWheelBodies();
  }

  setupWheelsPointLocal(): void {
    // ADDING WHEELS
    this.wheelOptions.radius = this.car.prop.wheelRadius;
    this.wheelOptions.chassisConnectionPointLocal.set(
      -this.car.prop.carWidth,
      0,
      1.1
    ); // Top right wheel
    this.car.vehicle.addWheel(this.wheelOptions);
    this.wheelOptions.chassisConnectionPointLocal.set(
      this.car.prop.carWidth,
      0,
      1.1
    ); // Top left wheel
    this.car.vehicle.addWheel(this.wheelOptions);
    this.wheelOptions.chassisConnectionPointLocal.set(
      -this.car.prop.carWidth,
      0,
      -1.2
    ); // Bottom right wheel
    this.car.vehicle.addWheel(this.wheelOptions);
    this.wheelOptions.chassisConnectionPointLocal.set(
      this.car.prop.carWidth,
      0,
      -1.2
    ); // Bottom left wheel
    this.car.vehicle.addWheel(this.wheelOptions);
  }

  addWheelBodies(): void {
    this.wheelBodies = [];
    this.car.vehicle.wheelInfos.forEach((wheel) => {
      const cylinderShape = new CANNON.Cylinder(
        wheel.radius,
        wheel.radius,
        wheel.radius / 2,
        20
      );
      const wheelBody = new CANNON.Body({
        mass: 1,
        material: new CANNON.Material('wheelMaterial'),
        type: CANNON.Body.KINEMATIC,
        collisionFilterGroup: 0, // turn off collisions
      });
      wheelBody.addShape(
        cylinderShape,
        new CANNON.Vec3(),
        new CANNON.Quaternion().setFromEuler(0, 0, Math.PI / 2)
      );
      this.wheelBodies.push(wheelBody);
      this.engine.physics.world.addBody(wheelBody);
    });
  }

  onPostStep(): void {
    this.car.vehicle.wheelInfos.forEach((wheel, wheelIndex) => {
      this.car.vehicle.updateWheelTransform(wheelIndex);
      const transform = wheel.worldTransform;
      this.wheelBodies[wheelIndex].position.copy(transform.position);
      this.wheelBodies[wheelIndex].quaternion.copy(transform.quaternion);
      this.wheels[wheelIndex]?.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );
      this.wheels[wheelIndex]?.quaternion.set(
        transform.quaternion.x,
        transform.quaternion.y,
        transform.quaternion.z,
        transform.quaternion.w
      );
    });
  }

  addEventListeners(): void {
    this.engine.physics.world.addEventListener(
      'postStep',
      this.onPostStep.bind(this)
    );
  }
}
