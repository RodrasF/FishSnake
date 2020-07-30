var game =  function (p) {
  p.rez = 45;
  p.running = false;
  p.score = 0;
  p.golden = false;
  p.fish = [];

  p.preload = function() {
    p.fish.push(new Fish("angry", p), new Fish("howdy", p));

    p.eatSound = p.loadSound('assets/audio/eat.wav');
    p.eatSound.setVolume(0.2);
    p.gameOverSound = p.loadSound('assets/audio/gameover.mp3');
    p.gameOverSound.setVolume(0.1);

    p.foodImg = p.loadImage('assets/heart.png');
    p.goldenFoodImg = p.loadImage('assets/golden_heart.png');

    p.name = p.getItem("fish-snake-name");
  }

  p.setup = function() {
    p.createCanvas(p.windowWidth, p.windowHeight).parent('canvas');

    p.canvas = document.getElementById("canvas");
    p.menu = document.getElementById("main-menu");
    p.nameInput = document.getElementById("name");
    p.leaderboard = document.getElementById("leaderboard");
    p.scoreLabel = document.getElementById("score");
    p.highscoreLabel = document.getElementById("highscore");
    p.highscoreLabel.style.display = 'none';

    p.nameInput.value = p.name;
    document.getElementById("play-button").onclick = play;
    document.getElementById("back-leaderboard").onclick = showMenu;
    document.getElementById("leaderboard-button").onclick = showLeaderboard;

    p.w = p.floor(p.windowWidth / p.rez);
    p.h = p.floor(p.windowHeight / p.rez);
    p.frameRate(13);

    p.LEFT = p.createVector(-1, 0);
    p.RIGHT = p.createVector(1, 0);
    p.DOWN = p.createVector(0, 1);
    p.UP = p.createVector(0, -1);
    p.STOPPED = p.createVector(0, 0);
    p.dir = p.STOPPED;
  }

  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.w = p.floor(p.windowWidth / p.rez);
    p.h = p.floor(p.windowHeight / p.rez);
  }

  p.keyPressed = function() {
    if (p.keyCode === p.LEFT_ARROW) {
      p.dir = p.LEFT;
    } else if (p.keyCode === p.RIGHT_ARROW) {
      p.dir = p.RIGHT;
    } else if (p.keyCode === p.DOWN_ARROW) {
      p.dir = p.DOWN;
    } else if (p.keyCode === p.UP_ARROW) {
      p.dir = p.UP;
    } else if (p.keyCode == 32) { //Space
      play();
    }
  }

  p.draw = function() {
    p.scale(p.rez);
    p.background(245);

    if(p.running) {
      showGame()
    } else {
      showMenu()
    }
  }

  function showMenu() {
    p.noLoop();
    p.leaderboard.style.display = "none";
    p.canvas.style.display = "none";
    p.menu.style.display = "";
  }

  function play() {
    if(p.nameInput.value.length < 3) {
      alert("Insert a valid Name with 3 or more characters!");
      showMenu();
      return;
    }

    p.storeItem("fish-snake-name", p.nameInput.value);
    p.snake = new Snake(p);
    p.score = 0;
    p.dir = p.STOPPED;
    foodLocation();

    p.highscoreLabel.style.display = 'none';
    p.menu.style.display = "none";
    p.leaderboard.style.display = "none";
    p.canvas.style.display = "";
    p.scoreLabel.innerText = 0;
    p.running = true;
    p.loop();
  }

  function showGame() {
    if (p.snake.eat(p.food, p.golden)) {
      p.golden = false;
      p.score++;
      p.scoreLabel.innerText = p.score;
      p.eatSound.play();
      if (lucky()) {
        p.golden = true;
      }
      foodLocation();
    }
    

    p.image(p.golden? p.goldenFoodImg : p.foodImg, p.food.x, p.food.y, 1, 1);
    p.snake.update(p.dir);
    p.snake.show();

    if (p.snake.endGame()) {
      p.gameOverSound.play();
      p.running = false;
      if( p.score > 0 ) {
        checkLeaderboard();
      }
    }
  }

  function foodLocation() {
    let x = p.floor(p.random(p.w));
    let y = p.floor(p.random(p.h));
    p.food = p.createVector(x, y);
  }

  function lucky() {
    let luckyNumber = p.random(100);
    return luckyNumber <= 1;
  }

  function showLeaderboard() {
    p.menu.style.display = "none";
    p.leaderboard.style.display = "";
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
      if(lastScore.get("score") < p.score) {
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
      name: p.nameInput.value,
      score: p.score
    })
    .then(function(docRef) {
        console.log("Score added with Success!");
        p.highscoreLabel.style.display = '';
    })
    .catch(function(error) {
        console.error("Error adding Score: ", error);
    })
  }

  function updateScore(scoreId) {
    firebase.firestore().collection('leaderboard').doc(scoreId).update({
      name: p.nameInput.value,
      score: p.score
    })
    .then(function() {
        console.log("Score successfully replaced!");
        p.highscoreLabel.style.display = '';
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error replacing Score: ", error);
    });
  }
};

var myp5 = new p5(game);