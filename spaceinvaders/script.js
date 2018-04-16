// frames

var animate = window.requestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

// variables
const canvas = document.getElementById('spaceInvaders');
const context = canvas.getContext('2d');
var keysDown = {};
var missleList = [];
var missleList2 = [];
var lives = 3;
var frames, spFrame, lvFrame;
var dir;
var tank;
// start game loop
window.onload = function() {
    var img = new Image();
    img.addEventListener('load', function() {
      alSprite = [
        [new Sprites(this, 0, 0, 22, 16), new Sprites(this, 0, 16, 22, 16)],
        [new Sprites(this, 22, 0, 16, 16), new Sprites(this, 22, 16, 16, 16)],
        [new Sprites(this, 38, 0, 24, 16), new Sprites(this, 38, 16, 24, 16)]
      ];
      taSprite = new Sprites(this, 62, 0, 22, 16);
      ciSprite = new Sprites(this, 84, 8, 36, 24);
      init();
      animate(refresh);
    });
    img.src = 'https://github.com/maxwihlborg/youtube-tutorials/blob/master/space-invaders/res/invaders.png?raw=true';
}

init = function() {
  frames = 0;
  spFrame = 0;
  lvFrame = 60;
  dir = 1;

  tank = {
    sprite: taSprite,
    x: (canvas.width - taSprite.w) / 2,
    y: canvas.height - (30 + taSprite.h)
  };

  aliens = [];
  var rows = [1, 0, 0, 2, 2];
  for(var i = 0; i < rows.length; i++) {
    for(var j = 0; j < 10; j++) {
      var a = rows[i];
      aliens.push({
        sprite: alSprite[a],
        x: 30 + j*30 + [0, 4, 0][a],
        y: 30 + i*30,
        w: alSprite[a][0].w,
        h: alSprite[a][0].h
      });
    }
  }
}
// game loop
refresh = function() {
  update();
  render();
  if(lives > 0) {
    animate(refresh);
  }
}

// animating loop
update = function() {
  ship.move();
  if(Math.random() < 0.03 && aliens.length > 0 && missleList2 < 3){
    var a = aliens[Math.round(Math.random() * (aliens.length - 1))];
    for(var i = 0; i < aliens.length; i++) {
      var b = aliens[i];

      if(a.x >= b.x && a.x <= b.x + b.w && a.y >= b.y && a.y <= b.y + b.h) {
        a = b;
      }
    }
    missleList2.push(new Missles(a.x + a.w*0.5, a.y + a.h, 8));
  }

  for(var i = 0; i < missleList2.length; i++) {
      if(missleList2[i].x >= ship.x && missleList2[i].x <= ship.x + ship.width && missleList2[i].y >= ship.y && missleList2[i].y <= ship.y + ship.height) {
        missleList2[i].evaporate();
        lives -= 1;
      }
  }

  frames++;
  if(frames % lvFrame === 0) {
    spFrame = (spFrame + 1) % 2;
    var _max = 0, _min = canvas.width;
    for(var i = 0; i < aliens.length; i++) {
      var a = aliens[i];
      a.x += 30 * dir;

      _max = Math.max(_max, a.x + a.w);
      _min = Math.min(_min, a.x);
    }
    if(_max > canvas.width || _min < 30) {
      dir *= -1;
      for(var i = 0; i < aliens.length; i++) {
        aliens[i].x += 30 * dir;
        aliens[i].y += 50;
      }
    }
  }

  for(var i = 0; i < missleList.length; i++) {
    for(var j = 0; j < aliens.length; j++) {
      if(missleList[i].x >= aliens[j].x - 5 && missleList[i].x <= aliens[j].x + aliens[j].w + 5 && missleList[i].y >= aliens[j].y && missleList[i].y <= aliens[j].y + aliens[j].h) {
        missleList[i].evaporate();
        aliens.splice(j, 1);
      }
    }
  }



  for(var i = 0; i < missleList.length; i++) {
    missleList[i].move();

    if(missleList[i].y < 0 || missleList[i].toDelete) {
      missleList[i].evaporate();
      missleList.splice(i, 1);
    }
  }
  for(var i = 0; i < missleList2.length; i++) {
    missleList2[i].move();
    if(missleList2[i].y > canvas.height || missleList2[i].toDelete) {
      missleList2[i].evaporate();
      missleList2.splice(i, 1);
    }
  }


}

// render
render = function() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fff';
  context.font = '25px sans-serif';
  context.fillText('Lives: ' + lives, 50, canvas.height - 20);
  for(var i = 0; i < aliens.length; i++) {
    var a = aliens[i];
    a.sprite[0].render(a.sprite[spFrame], a.x, a.y);
  }
  tank.sprite.render(tank.sprite, ship.x + 11, ship.y - 5);
  for(var i = 0; i < missleList.length; i++) {
    missleList[i].render();
  }

  for(var i = 0; i < missleList2.length; i++) {
    missleList2[i].render();
  }
}


// ship
Ship = function() {
  this.x = canvas.width / 2;
  this.y = canvas.height - 30;
  this.width = 45;
  this.height = 10;
  this.x_speed = 5;
}

Ship.prototype.move = function() {

  window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
  });

  window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
  });
  for(var key in keysDown) {
    var value = Number(key);
    if(value == 37) {
      this.x += -this.x_speed;
    }
    else if(value == 39) {
      this.x += this.x_speed;
    }
    else if(value == 32) {
      if(missleList.length < 1) {
        ship.limitMissles();
      }
    }
  }
  if(this.x < 15) {
    this.x = 15;
  }
  else if(this.x > canvas.width - 60) {
    this.x = canvas.width - 60;
  }
}

Ship.prototype.limitMissles = function() {
  missleList.push(new Missles(ship.x + ship.width / 2 - 2, ship.y, -8));
}


// missle
Missles = function(x, y, y_speed) {
  this.x = x;
  this.y = y;
  this.y_speed = y_speed;
  this.width = 6;
  this.height = 14;
  this.toDelete = false;
}

Missles.prototype.render = function() {
  context.fillStyle = '#fff';
  context.fillRect(this.x, this.y, this.width, this.height);
}

Missles.prototype.move = function() {
  this.y += this.y_speed;
}

Missles.prototype.evaporate = function() {
  this.toDelete = true;
}


Sprites = function(img, x, y, w ,h) {
  this.img = img;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

Sprites.prototype.render = function(sp, x ,y) {
  context.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
}



ship = new Ship();
