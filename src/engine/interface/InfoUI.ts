import './info.scss';
import githubLogo from '../../../assets/github.png';
import { GameState } from '../../game/state/GameState';
import { Events } from '../../events';
import eventService from '../utilities/eventService';
import { formatTime } from '../utilities/Number-Utils';

export type InfoConfig = {
  twitter?: string;
  github?: string;
  description?: string;
  title?: string;
  documentTitle?: string;
};

export class InfoUI {
  private raceCounterInterval: number;
  private timeContainer: HTMLDivElement;
  private scoreContainer: HTMLDivElement;
  constructor(config: InfoConfig = {}) {
    this.init(config);
    this.addGasProgress();
    this.addMusicController();
    this.addSoundController();
    this.onGas();
    this.addEventListeners();
  }

  init(config: InfoConfig = {}): void {
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
          Sound from&nbsp;<a href='https://www.zapsplat.com/'>Zapsplat.com</a>
        </div>
    `
    );

    this.scoreContainer = document.createElement('div');
    this.scoreContainer.classList.add('score-container');
    this.scoreContainer.insertAdjacentHTML(
      'beforeend',
      `Gas collected: ${GameState.score} / ${GameState.maxScore}`
    );

    this.timeContainer = document.createElement('div');
    this.timeContainer.classList.add('container');
    this.timeContainer.id = 'time-container';
    this.timeContainer.insertAdjacentHTML('beforeend', `Race time:\n00:00:00`);
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    controlsContainer.insertAdjacentHTML(
      'beforeend',
      `Controls: \n R - reload to last checkpoint`
    );

    document.body.append(
      container,
      this.timeContainer,
      controlsContainer,
      this.scoreContainer
    );
  }

  addGasProgress(): void {
    const gasContainer = document.createElement('div');
    gasContainer.classList.add('gas-container');
    gasContainer.insertAdjacentHTML(
      'beforeend',
      `<span>⛽</span>
    <div id="gas-bar">
      <div id="gas"></div>
    </div>`
    );

    document.body.append(gasContainer);
  }

  addMusicController(): void {
    const musicContainer = document.createElement('div');
    musicContainer.classList.add('music-container', 'container');
    const musicLabel = document.createElement('span');
    musicLabel.textContent = 'Music:';
    const musicButton = document.createElement('button');
    musicButton.classList.add('sound-button');
    musicButton.textContent = GameState.isMusicOn ? '🔉' : '🔇';
    musicContainer.appendChild(musicLabel);
    musicContainer.appendChild(musicButton);
    document.body.append(musicContainer);
    musicButton.addEventListener('click', () => {
      GameState.setMusicOn(!GameState.isMusicOn);
      musicButton.textContent = GameState.isMusicOn ? '🔉' : '🔇';
      eventService.emit(Events.UPDATE_MUSIC, GameState.isMusicOn);
    });
  }

  addSoundController(): void {
    const soundContainer = document.createElement('div');
    soundContainer.classList.add('sound-container', 'container');
    const soundLabel = document.createElement('span');
    soundLabel.textContent = 'Sound:';
    const soundButton = document.createElement('button');
    soundContainer.appendChild(soundLabel);
    soundContainer.appendChild(soundButton);
    soundButton.classList.add('sound-button');
    soundButton.textContent = GameState.isSoundOn ? '🔉' : '🔇';
    document.body.append(soundContainer);
    soundButton.addEventListener('click', () => {
      GameState.setSoundOn(!GameState.isSoundOn);
      soundButton.textContent = GameState.isSoundOn ? '🔉' : '🔇';
      eventService.emit(Events.UPDATE_SOUND, GameState.isSoundOn);
    });
  }

  onUpdateScore() {
    document.getElementsByClassName(
      'score-container'
    )[0].textContent = `Gas collected: ${GameState.score} / ${GameState.maxScore}`;
    this.onGas();
  }

  onGas(): void {
    const gasElement = document.getElementById('gas');
    if (gasElement) {
      gasElement.style.width = `${GameState.gas}%`;
      if (GameState.gas > 60) gasElement.className = 'full';
      else if (GameState.gas <= 30) gasElement.className = 'empty';
      else if (GameState.gas <= 60) gasElement.className = 'half-full';
    }
  }

  onCheckpointLoad(): void {
    this.onGas();
  }

  onStartRace(): void {
    let time = 0;
    this.raceCounterInterval = setInterval(() => {
      this.timeContainer.innerHTML = `Race time:\n${formatTime(time)}`;
      time++;
    }, 1000);
  }

  onFinishRace(): void {
    document.body.appendChild(this.scoreContainer);
    clearInterval(this.raceCounterInterval);
    this.scoreContainer.innerHTML += `</br> ${this.timeContainer.innerText}`;
    this.scoreContainer.classList.add('finished');
  }

  addEventListeners(): void {
    eventService.on(Events.UPDATE_SCORE, this.onUpdateScore, this);
    eventService.on(Events.GAS, this.onGas, this);
    eventService.on(Events.CHECKPOINT_LOAD, this.onCheckpointLoad, this);
    eventService.on(Events.RACE_START, this.onStartRace, this);
    eventService.on(Events.RACE_FINISH, this.onFinishRace, this);
  }
}
