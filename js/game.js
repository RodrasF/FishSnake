var game =  function (p) {

  let blockedWords = ["anal","anus","arse","ass","ballsack","bitch","biatch","bloody","blowjob","blow job","boner","boob","buttplug","clitoris","cock","cunt","dick","dildo","dyke","fag","fuck","f u c k","nigger","nigga","nagga","nagger","neeger","penis","piss","poop","pussy","scrotum","slut","smegma","spunk","vagina","whore","retarded","retard","kkk"];
  let cacheKey = "fish-snake-name";

  let rez = 45;
  let running = false;
  let score = 0;
  let golden = false;
  p.fish = [];

  p.preload = function() {
    p.fish.push(new Fish("angry", p), new Fish("howdy", p));

    p.eatSound = p.loadSound('assets/audio/eat.wav');
    p.eatSound.setVolume(0.2);
    p.gameOverSound = p.loadSound('assets/audio/gameover.mp3');
    p.gameOverSound.setVolume(0.1);

    p.foodImg = p.loadImage('assets/heart.png');
    goldenFoodImg = p.loadImage('assets/golden_heart.png');

    let cachedName = p.getItem(cacheKey);
    if(invalidName(cachedName)) {
      p.name = "";
      removeItem(cacheKey);
    } else {
      p.name = cachedName;
    }

  }

  p.setup = function() {
    p.createCanvas(window.innerWidth, window.innerHeight).parent('canvas');

    p.canvas = document.getElementById("canvas");
    p.menu = document.getElementById("main-menu");
    p.nameInput = document.getElementById("name");
    p.leaderboard = document.getElementById("leaderboard");
    scoreLabel = document.getElementById("score");
    p.highscoreLabel = document.getElementById("highscore");
    p.highscoreLabel.style.display = 'none';

    p.nameInput.value = p.name;
    document.getElementById("play-button").onclick = play;
    document.getElementById("save").onclick = saveName;
    document.getElementById("back-leaderboard").onclick = showMenu;
    document.getElementById("leaderboard-button").onclick = showLeaderboard;

    p.w = p.floor(window.innerWidth / rez);
    p.h = p.floor(window.innerHeight / rez);
    p.frameRate(13);

    p.LEFT = p.createVector(-1, 0);
    p.RIGHT = p.createVector(1, 0);
    p.DOWN = p.createVector(0, 1);
    p.UP = p.createVector(0, -1);
    p.STOPPED = p.createVector(0, 0);
    p.dir = p.STOPPED;
  }

  p.windowResized = function() {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    p.w = p.floor(window.innerWidth / rez);
    p.h = p.floor(window.innerHeight / rez);
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
    p.scale(rez);
    p.background(245);

    if(running) {
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

  function saveName() {
    if(invalidName(p.nameInput.value)) {
      alert("Insert a valid Name with 3 or more characters!");
      p.name = undefined;
      return;
    }

    p.name = p.nameInput.value;
    p.storeItem("fish-snake-name", p.name);
    alert("Name Saved!");
  }

  function invalidName(n) {
    return n == undefined || n.length < 3 || blockedWords.some(word => n.toLowerCase().includes(word));
  }

  function play() {
    if(!p.name) {
      alert("Insert a valid Name with 3 or more characters!");
      showMenu();
      return;
    }

    p.snake = new Snake(p);
    score = 0;
    p.dir = p.STOPPED;
    foodLocation();

    p.highscoreLabel.style.display = 'none';
    p.menu.style.display = "none";
    p.leaderboard.style.display = "none";
    p.canvas.style.display = "";
    scoreLabel.innerText = 0;
    running = true;
    p.loop();
  }

  function showGame() {
    if (p.snake.eat(p.food, golden)) {
      golden = false;
      score++;
      scoreLabel.innerText = score;
      p.eatSound.play();
      if (lucky()) {
        golden = true;
      }
      foodLocation();
    }
    

    p.image(golden? goldenFoodImg : p.foodImg, p.food.x, p.food.y, 1, 1);
    p.snake.update(p.dir);
    p.snake.show();

    if (p.snake.endGame()) {
      p.gameOverSound.play();
      running = false;
      if( score > 0 ) {
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
      name: p.name,
      score: score
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
      name: p.name,
      score: score
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