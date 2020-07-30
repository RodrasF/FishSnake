let rez = 45;
let w;
let h;

let canvas;
let menu;
let leaderboard;
let scoreLabel;
let highscoreLabel;

let eatSound;
let gameOverSound;

let foodImg;
let goldenFoodImg;

let dir;
let LEFT;
let RIGHT;
let DOWN;
let UP;
let STOPPED;

let running = false;
let score = 0;
let highScore;

let snake;
let food;
let golden = false;
let fish = [];

function preload() {
  fish.push(new Fish("angry"), new Fish("howdy"));

  eatSound = loadSound('assets/audio/eat.wav');
  eatSound.setVolume(0.2);
  gameOverSound = loadSound('assets/audio/gameover.mp3');
  gameOverSound.setVolume(0.1);

  foodImg = loadImage('assets/heart.png');
  goldenFoodImg = loadImage('assets/golden_heart.png');
  
  highScore = getItem("fish_highscore");
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent('canvas');

  canvas = document.getElementById("canvas");
  menu = document.getElementById("main-menu");
  leaderboard = document.getElementById("leaderboard");
  scoreLabel = document.getElementById("score");
  highscoreLabel = document.getElementById("highscore");
  highscoreLabel.innerText = `Your Highscore: ${highScore}`;
  document.getElementById("play-button").onclick = play;
  document.getElementById("leaderboard-button").onclick = showLeaderboard;

  w = floor(width / rez);
  h = floor(height / rez);
  frameRate(13);

  LEFT = createVector(-1, 0);
  RIGHT = createVector(1, 0);
  DOWN = createVector(0, 1);
  UP = createVector(0, -1);
  STOPPED = createVector(0, 0);
  dir = STOPPED;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    dir = LEFT;
  } else if (keyCode === RIGHT_ARROW) {
    dir = RIGHT;
  } else if (keyCode === DOWN_ARROW) {
    dir = DOWN;
  } else if (keyCode === UP_ARROW) {
    dir = UP;
  } else if (keyCode == 32) { //Space
    play();
  }
}

function play() {
  snake = new Snake();
  score = 0;
  dir = STOPPED;
  foodLocation();

  menu.style.display = "none";
  canvas.style.display = "";
  scoreLabel.innerText = 0;
  running = true;
  loop();
}

function draw() {
  scale(rez);
  background(245);

  if(running) {
    showGame()
  } else {
    showMenu()
  }
}

function showMenu() {
  noLoop();
  leaderboard.style.display = "none";
  canvas.style.display = "none";
  menu.style.display = "";
}

function showLeaderboard() {
  menu.style.display = "none";
  leaderboard.style.display = "";

  const scores = [{name:"Ana",score:50}, {name:"Rodrigo",score:60}, {name:"Bambi",score:30}];
  scores.sort((s1, s2) => s2.score - s1.score);

  const listItems = scores.map( (element) => `<li class='list-item'>${element.name} - ${element.score}</li>`);
  document.getElementById("leaderboard-list").innerHTML = listItems.join('');
}

function showGame() {
  if (snake.eat(food, golden)) {
    golden = false;
    score++;
    scoreLabel.innerText = score;
    eatSound.play();
    if (lucky()) {
      golden = true;
    }
    foodLocation();
  }
  

  image(golden? goldenFoodImg : foodImg, food.x, food.y, 1, 1);
  snake.update(dir);
  snake.show();

  if (snake.endGame()) {
    if(score > highScore) {
      highScore = score;
      storeItem("fish_highscore", highScore);
    }
    gameOverSound.play();
    running = false;
  }
}

function foodLocation() {
  let x = floor(random(w));
  let y = floor(random(h));
  food = createVector(x, y);
}

function lucky() {
  let luckyNumber = random(100);
  return luckyNumber <= 1;
}