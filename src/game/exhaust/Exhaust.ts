import * as THREE from 'three';
import { GameEntity } from '../../engine/GameEntity';
import { Engine } from '../../engine/Engine';
import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
import { Car } from '../Car';
import LinearSpline from '../../engine/utilities/LinearSpline';
import { Events } from '../../events';
import eventService from '../../engine/utilities/eventService';

export class Exhaust extends GameEntity {
  private count: number = 2;
  private geometry!: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
  private material!: THREE.ShaderMaterial;
  private points!: THREE.Points<
    THREE.BufferGeometry<THREE.NormalBufferAttributes>,
    THREE.ShaderMaterial
  >;
  private particles!: any[];
  private alphaSpline!: LinearSpline;
  private sizeSpline!: LinearSpline;
  private emitterInterval!: number;
  private exhaustEmitPoint: THREE.Object3D<THREE.Object3DEventMap> | undefined;

  constructor(private engine: Engine, private car: Car) {
    super();
    this.getExhaustEmitPointModel();
    this.setGeometryAndMaterial();
    this.emitParticles();
    this.addExhaustIdle();
    this.addEventListeners();
  }

  getExhaustEmitPointModel(): void {
    this.exhaustEmitPoint =
      this.car.instance.getObjectByName('exhaustEmitPoint');
    // Hide the model
    if (this.exhaustEmitPoint) {
      this.exhaustEmitPoint.visible = false;
    }
  }

  setGeometryAndMaterial(): void {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        diffuseTexture: { value: this.engine.resources.getItem('fire') },
        pointMultiplier: {
          value:
            window.innerHeight /
            (2.0 * Math.tan((0.5 * 60.0 * Math.PI) / 180.0)),
        },
      },
      vertexShader,
      fragmentShader,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });
    this.geometry = new THREE.BufferGeometry();

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.engine.scene.add(this.points);
    this.particles = [];
  }

  emitParticles(): void {
    for (let i = 0; i < this.count; i++) {
      // Get current exhaustEmitPoint in world space from car model
      const emitPointPosition = this.exhaustEmitPoint
        ?.getWorldPosition(new THREE.Vector3())
        .clone();
      // Here we define all the attributes that goes into the shader
      this.particles.push({
        position: emitPointPosition,
        size: Math.random() * 2, // size is the default attribute which exists in the vertexShader
        currentSize: 0,
        alpha: 1.0,
        life: 3,
        rotation: Math.random() * Math.PI * 2.0,
        velocity: new THREE.Vector3(0, 0.2, 0),
      });
    }
    this.alphaSpline = new LinearSpline(
      (t: number, a: number, b: number) => a + t * (b - a)
    );
    this.alphaSpline.addPoint(0, 0);
    this.alphaSpline.addPoint(0.1, 1);
    this.alphaSpline.addPoint(0.6, 1);
    this.alphaSpline.addPoint(1, 0);

    this.sizeSpline = new LinearSpline(
      (t: number, a: number, b: number) => a + t * (b - a)
    );
    this.sizeSpline.addPoint(0, 0.1);
    this.sizeSpline.addPoint(0.5, 1);
    this.sizeSpline.addPoint(1, 0.1);
  }

  // Update all geometry attributes so they can be read by the shader (Convert them to Float32BufferAttribute)
  updateGeometry(): void {
    if (this.particles.length === 0) return;
    const positions = [];
    const sizes = [];
    const colors = [];
    const angles = [];

    for (const particle of this.particles) {
      positions.push(
        particle.position.x,
        particle.position.y,
        particle.position.z
      );
      sizes.push(particle.currentSize);
      colors.push(0.1, 0.1, 0.1, particle.alpha);
      angles.push(particle.rotation);
    }

    // Pass the attributes to the vertexShader
    this.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute(
      'size',
      new THREE.Float32BufferAttribute(sizes, 1)
    );
    this.geometry.setAttribute(
      'colour',
      new THREE.Float32BufferAttribute(colors, 4)
    );
    this.geometry.setAttribute(
      'angle',
      new THREE.Float32BufferAttribute(angles, 1)
    );

    // Let the shader know which attributes needs update
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.colour.needsUpdate = true;
    this.geometry.attributes.angle.needsUpdate = true;
  }

  updateParticles(deltaTime: number) {
    if (this.particles.length === 0) return;
    for (const particle of this.particles) {
      particle.life -= deltaTime;
    }
    // Remove dead particles
    this.particles = this.particles.filter((particle) => particle.life > 0);

    for (const particle of this.particles) {
      const time = 1 - particle.life / 5;
      particle.alpha = this.alphaSpline.get(time);
      particle.rotation += deltaTime;
      particle.currentSize = particle.size * this.sizeSpline.get(time);

      // Modify velocity
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );
      const drag = particle.velocity.clone();
      drag.multiplyScalar(deltaTime * 0.25);
      drag.x =
        Math.sign(particle.velocity.x) *
        Math.min(Math.abs(drag.x), Math.abs(particle.velocity.x));
      drag.y =
        Math.sign(particle.velocity.y) *
        Math.min(Math.abs(drag.y), Math.abs(particle.velocity.y));
      drag.z =
        Math.sign(particle.velocity.z) *
        Math.min(Math.abs(drag.z), Math.abs(particle.velocity.z));
      particle.velocity.sub(drag);
    }
  }

  addExhaustIdle(): void {
    clearInterval(this.emitterInterval);
    this.emitterInterval = setInterval(() => this.emitParticles(), 250);
  }

  addEventListeners(): void {
    eventService.on(Events.GAS, this.emitParticles, this);
  }

  update(delta: number): void {
    this.updateParticles(delta);
    this.updateGeometry();
  }
}
