import './style.scss';
import { Engine } from './engine/Engine';
import { Game } from './game/Game';

new Engine({
  canvas: document.querySelector('#canvas') as HTMLCanvasElement,
  experience: Game,
  info: {
    github: 'https://github.com/Ang31o/3DGasCollector',
    description: 'A simple car racing game, made with Three.js and Cannon.js',
    documentTitle: 'Gas Collector',
    title: 'Gas Collector',
  },
});
