import { Events } from '../../events';
import eventService from '../utilities/eventService';
import './loader.scss';

export class Loader {
  private readonly loaderElement: HTMLDivElement;
  public isComplete = false;
  private startButton: HTMLButtonElement;
  private loaderInner: HTMLDivElement;
  private controls: HTMLDivElement;

  constructor() {
    this.loaderElement = document.createElement('div');
    this.loaderElement.classList.add('loader');
    document.body.append(this.loaderElement);

    this.addLoaderInner();
    this.addStartButton();
    this.addControls();
  }

  addLoaderInner(): void {
    this.loaderInner = document.createElement('div');
    this.loaderInner.classList.add('loader-inner');
    this.loaderInner.insertAdjacentHTML(
      'beforeend',
      `
    <h1 class="progress-number">0%</h1>
          <div class="progress-bar"></div>
          `
    );
    this.loaderElement.append(this.loaderInner);
  }

  addControls(): void {
    this.controls = document.createElement('div');
    this.controls.classList.add('controls');
    this.controls.insertAdjacentHTML(
      'beforeend',
      `<p>Use [W], [A], [S], [D] to move</p>
       <p>Use [SPACE] to break</p>
       <p>Use [R] to reload to the last checkpoint</p>
       <p>Use [L] to toggle lights</p>
       `
    );
    this.loaderElement.append(this.controls);
  }

  addStartButton(): void {
    this.startButton = document.createElement('button');
    this.startButton.addEventListener('click', this.onStart.bind(this));
    this.startButton.classList.add('start-button');
    this.startButton.textContent = 'Start';
  }

  setProgress(progress: number) {
    const progressNumber = this.loaderElement.querySelector(
      '.progress-number'
    ) as HTMLHeadingElement;

    progressNumber!.innerText = `${Math.floor(progress * 100)}%`;

    const progressBar = this.loaderElement.querySelector(
      '.progress-bar'
    ) as HTMLDivElement;

    progressBar.style.width = `${progress * 100}%`;
  }

  complete() {
    this.loaderInner.remove();
    this.loaderElement.classList.add('transparent');
    this.loaderElement.prepend(this.startButton);
  }

  onStart(): void {
    this.isComplete = true;
    this.loaderElement.remove();
    this.controls.remove();
    eventService.emit(Events.START_GAME);
  }
}
