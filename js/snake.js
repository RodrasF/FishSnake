class Body {
  constructor(pos, direction) {
    this.pos = pos;
    this.direction = direction;
  }

  copy() {
    return new Body(this.pos.copy(), this.direction);
  }
}

class Snake {

  constructor(p) {
    this.parent = p;
    this.body = [];
    this.dir = this.parent.STOPPED
    this.body.push(
      new Body(this.parent.createVector(this.parent.floor(this.parent.w / 2), this.parent.floor(this.parent.h / 2)), this.dir)
    );
  }

  update(newDir) {
    if (this.dir.x + newDir.x != 0 || this.dir.y + newDir.y != 0) {
      this.dir = newDir;
    }

    let head = this.body[this.body.length - 1].copy();
    this.body.shift();
    head.pos.add(this.dir);
    head.direction = this.dir;
    this.body.push(head);
  }

  grow() {
    let head = new Body(
      this.body[this.body.length - 1].pos.copy(),
      this.body[this.body.length - 1].direction
    );
    this.body.push(head);
  }

  endGame() {
    let x = this.body[this.body.length - 1].pos.x;
    let y = this.body[this.body.length - 1].pos.y;
    if (x > this.parent.w || x < 0 || y > this.parent.h || y < 0) {
      return true;
    }
    for (let i = 0; i < this.body.length - 1; i++) {
      let part = this.body[i];
      if (part.pos.x == x && part.pos.y == y) {
        return true;
      }
    }
    return false;
  }

  eat(foodPos, golden) {
    let headPos = this.body[this.body.length - 1].pos;
    if (headPos.equals(foodPos)) {
      if (golden) {
        this.body.splice(0, this.body.length - 1);
      } else {
        this.grow();
      }
      return true;
    }
    return false;
  }

  show() {
    for (let i = 0; i < this.body.length - 1; i++) {
      this.parent.image(this.parent.fish[1].getImage(this.body[i].direction),
        this.body[i].pos.x, this.body[i].pos.y, 1, 1)
    }
    this.parent.image(this.parent.fish[0].getImage(this.body[this.body.length - 1].direction),
      this.body[this.body.length - 1].pos.x,
      this.body[this.body.length - 1].pos.y,
      1, 1);
  }

}