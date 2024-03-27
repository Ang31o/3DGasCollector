import { Resource } from '../engine/Resources';

export const resources: Resource[] = [
  {
    name: 'Car',
    type: 'gltf',
    path: 'models/Low-Poly-Racing-Car.glb',
  },
  {
    name: 'Map',
    type: 'gltf',
    path: 'models/map1.glb',
  },
  {
    name: 'SkyBox',
    type: 'cubeTexture',
    path: [
      'images/px.jpg',
      'images/nx.jpg',
      'images/py.jpg',
      'images/ny.jpg',
      'images/pz.jpg',
      'images/nz.jpg',
    ],
  },
  {
    name: 'bump',
    type: 'sfx',
    path: 'sfx/bump.mp3',
  },
  {
    name: 'fire',
    type: 'texture',
    path: 'images/fire.png',
  },
];
