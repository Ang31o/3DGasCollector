import * as lilGui from 'lil-gui';
import Stats from 'three/examples/jsm/libs/stats.module';

export class DebugUI {
  gui!: lilGui.GUI;
  stats!: Stats;

  constructor() {
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.gui = new lilGui.GUI();

    if (window.location.hash.includes('debug')) {
      this.gui.show();
      this.stats.dom.style.display = 'block';
    } else {
      this.gui.hide();
      this.stats.dom.style.display = 'none';
    }
  }

  update() {
    this.stats.update();
  }
}
