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
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 30 30">
    <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"></path>
</svg>
            
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
