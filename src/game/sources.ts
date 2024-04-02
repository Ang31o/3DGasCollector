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
    name: 'matcap8',
    type: 'texture',
    path: 'images/matcaps/5.png',
  },
  {
    name: 'fire',
    type: 'texture',
    path: 'images/fire.png',
  },
  {
    name: 'Airstrike',
    type: 'font3d',
    path: 'fonts/Airstrike_Regular.json',
  },
];
