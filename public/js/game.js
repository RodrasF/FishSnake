let rez = 45;
let w;
let h;

let canvas;
let menu;
let nameBox;
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
let name;
let newHighscore = false;

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

  name = getItem("fish-snake-name");
}

function setup() {
  createCanvas(windowWidth, windowHeight).parent('canvas');

  canvas = document.getElementById("canvas");
  menu = document.getElementById("main-menu");
  nameInput = document.getElementById("name");
  leaderboard = document.getElementById("leaderboard");
  scoreLabel = document.getElementById("score");
  highscoreLabel = document.getElementById("highscore");
  highscoreLabel.style.display = 'none';

  nameInput.value = name;
  document.getElementById("play-button").onclick = play;
  document.getElementById("back-leaderboard").onclick = showMenu;
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

function play() {
  if(nameInput.value.length < 3) {
    alert("Insert a valid Name with 3 or more characters!");
    showMenu();
    return;
  }

  storeItem("fish-snake-name", nameInput.value);
  snake = new Snake();
  score = 0;
  dir = STOPPED;
  foodLocation();

  highscoreLabel.style.display = 'none';
  menu.style.display = "none";
  leaderboard.style.display = "none";
  canvas.style.display = "";
  scoreLabel.innerText = 0;
  running = true;
  loop();
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
    gameOverSound.play();
    running = false;
    if( score > 0 ) {
      checkLeaderboard();
    }
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

function showLeaderboard() {
  menu.style.display = "none";
  leaderboard.style.display = "";
  let list = document.getElementById("leaderboard-list");

  getScores()
    .then( docs =>
      docs.map( doc =>
        `<li class='list-item'>${doc.get("name")} - ${doc.get("score")}</li>`
      )
    )
    .then( items => 
      list.innerHTML = items.join('')
    );
}

async function checkLeaderboard() {
  const scores = await getScores();
  if ( scores.length < 10) {
    addScore();
  } else {
    const lastScore = scores[scores.length-1];
    if(lastScore.get("score") < score) {
      updateScore(lastScore.id);
    }
  }
}

function getScores() {
  return firebase.firestore().collection('leaderboard')
    .orderBy('score', 'desc')
    .limit(10)
    .get()
    .then(querySnapshot =>querySnapshot.docs);
}

function addScore() {
  firebase.firestore().collection('leaderboard').add({
    name: nameInput.value,
    score: score
  })
  .then(function(docRef) {
      console.log("Score added with Success!");
      highscoreLabel.style.display = '';
  })
  .catch(function(error) {
      console.error("Error adding Score: ", error);
  })
}

function updateScore(scoreId) {
  firebase.firestore().collection('leaderboard').doc(scoreId).update({
    name: nameInput.value,
    score: score
  })
  .then(function() {
      console.log("Score successfully replaced!");
      highscoreLabel.style.display = '';
  })
  .catch(function(error) {
      // The document probably doesn't exist.
      console.error("Error replacing Score: ", error);
  });
}