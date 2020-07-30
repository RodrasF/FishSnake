class Fish {
  constructor(name) {
    this.LEFT = loadImage('assets/fish/' + name + '_left.png');
    this.RIGHT = loadImage('assets/fish/' + name + '_right.png');
    this.DOWN = loadImage('assets/fish/' + name + '_down.png');
    this.UP = loadImage('assets/fish/' + name + '_up.png');
  }

  getImage(dir) {
    switch (dir) {
      case LEFT:
        return this.LEFT;
      case RIGHT:
        return this.RIGHT;
      case DOWN:
        return this.DOWN;
      case UP:
        return this.UP;
      default:
        return this.LEFT;
    }
  }
}