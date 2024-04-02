import './info.scss';
import githubLogo from '../../../assets/github.png';
import { GameState } from '../../game/state/GameState';

export type InfoConfig = {
  twitter?: string;
  github?: string;
  description?: string;
  title?: string;
  documentTitle?: string;
};

export class InfoUI {
  constructor(config: InfoConfig = {}) {
    if (config.documentTitle) {
      document.title = config.documentTitle;
    }

    const container = document.createElement('div');
    container.classList.add('info-container');
    container.insertAdjacentHTML(
      'beforeend',
      `
        ${config.title ? `<h1>${config.title}</h1>` : ''}
        <div class="description">
          <p>${config.description}</p>
        </div>
        <div class="social-container">
        <a href="${config.github}" class="social-button" target="_blank">
            <img src="${githubLogo}" alt="Github logo linking to repository" />
          </a>
        </div>
    `
    );

    const scoreContainer = document.createElement('div');
    scoreContainer.classList.add('score-container');
    scoreContainer.insertAdjacentHTML(
      'beforeend',
      `Score: ${GameState.score || 0}`
    );

    const timeContainer = document.createElement('div');
    timeContainer.id = 'time-container';
    timeContainer.insertAdjacentHTML('beforeend', `Race time:\n00:00:00`);

    document.body.prepend(container, scoreContainer, timeContainer);
  }
}
