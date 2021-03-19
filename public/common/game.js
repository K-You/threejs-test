import GameAudio from './gameAudio.js';
import { graphics } from './graphics.js';
import { OrbitControls } from '/jsm/controls/OrbitControls.js';

class Game {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.graphics = new graphics.Graphics(this);
    if(!this.graphics.initialize()) {
      this.displayError('WebGL2 is not available');
      return;
    }

    this.gameAudio = new GameAudio(this);

    this.controls = this.createControls();
    this.previousRAF = null;

    this.onInitialize();
    this.raf();
  }

  displayError(errorMessage) {
    const error = document.getElementById('error');
    error.innerHTML = errorMessage;
  }

  createControls() {
    const controls = new OrbitControls(this.graphics.camera, this.graphics.threejs.domElement);
    controls.target.set(0,0,0);
    controls.update();
    return controls;
  }

  raf() {
    requestAnimationFrame((t) => {
      if(this.previousRAF === null) {
        this.previousRAF = t;
      }
      this.render(t - this.previousRAF);
      this.previousRAF = t;
    })
  }

  render(timeInMs) {
    const timeInSeconds = timeInMs * 0.001;
    this.onStep(timeInSeconds);
    this.graphics.render(timeInSeconds);

    this.raf();
  }

}


export const game = {
  Game
};
