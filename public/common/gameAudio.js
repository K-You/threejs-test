import { Audio, AudioListener, AudioLoader } from '/build/three.module.js';

class GameAudio {
  constructor(game) {
    this.musicListener = new AudioListener();
    this.explosionListener = new AudioListener();
    this.blasterListener = new AudioListener();
    
    game.graphics.camera.add(this.musicListener);
    game.graphics.camera.add(this.explosionListener);
    game.graphics.camera.add(this.blasterListener);

    this.audioLoader = new AudioLoader();
    this.initialize();
  }

  initialize() {
    const sound = new Audio(this.musicListener);
    this.audioLoader.load('../resources/music.mp3', (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.01);
      sound.play();
    })

    this.audioLoader.load('../resources/explosion.m4a', (buffer) => {
      this.explosionBuffer = buffer;
    });

    this.audioLoader.load('../resources/laser.m4a', (buffer) => {
      this.blasterBuffer = buffer;
    });
  }

}


export default GameAudio;