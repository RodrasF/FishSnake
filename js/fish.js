class Fish {
  constructor(name, p) {
    this.parent = p;
    this.LEFT = this.parent.loadImage('assets/fish/' + name + '_left.png');
    this.RIGHT = this.parent.loadImage('assets/fish/' + name + '_right.png');
    this.DOWN = this.parent.loadImage('assets/fish/' + name + '_down.png');
    this.UP = this.parent.loadImage('assets/fish/' + name + '_up.png');
  }

  getImage(dir) {
    switch (dir) {
      case this.parent.LEFT:
        return this.LEFT;
      case this.parent.RIGHT:
        return this.RIGHT;
      case this.parent.DOWN:
        return this.DOWN;
      case this.parent.UP:
        return this.UP;
      default:
        return this.LEFT;
    }
  }
}