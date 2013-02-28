(function () {

  "use strict";

  var root = this, rules = {};

  // Three rules which determine the state of the game after a move is complete.
  // Each rule takes the turn object used at the start of the sowing of the seeds,
  // the turn object created at the end of the sowing of seeds and the array of
  // players at the end of the sowing.

  rules.capture = function (started, ended, players) {
    var opposing, endplayer;

    if (started.player !== ended.player) {
      return false;
    }

    opposing  = players[(started.player + 1) % players.length].cups[ended.cup];
    endplayer = players[ended.player].cups[ended.cup];

    if (opposing > 0 && endplayer === 1) {
      return true;
    }

    return false;
  };

  rules.extra = function (started, ended) {
    var a, b;

    if (started.player !== ended.player) {
      return false;
    }

    a = (started.player === 0 && ended.cup < 0);
    b = (ended.player === 1 && ended.cup === 6);

    if (a || b) {
      return true;
    }

    return false;
  };

  rules.end = function (started, ended, players) {
    return players.map(function (player) {
      return player.finished();
    }).reduce(function (memo, state) {
      return (!memo && state) ? state : memo;
    });
  };

  // This object is gradually built up by the board object and the players move
  // function. It is used to keep track of the position whilst sowing the
  // seeds around the board and by the game rules.

  function Turn(player_index, cup_index, seeds) {
    this.player = player_index;
    this.cup = cup_index || null;
    this.seeds = seeds || 0;
  }

  Turn.prototype.clone = function () {
    return new Turn(this.player, this.cup);
  };

  Turn.prototype.next = function () {
    return new Turn((this.player + 1) % 2, null);
  };

  // Players are instantiated with a callback function which is used by the board
  // to get user input. When the move callback is invoked it is passed a function
  // as its first argument with an integer which indexes the cups array.

  function Player(callback) {
    this.pit = 0;
    this.cups = [4, 4, 4, 4, 4, 4];
    this.move = callback;
  }

  Player.prototype.finished = function () {
    return (this.cups.reduce(function (memo, val) {
      return memo + val;
    }) === 0);
  };

  // A naive example of a player function.

  function computer(move, player) {
    var cups = player.cups.map(function (cup, index) {
      return (cup !== 0) ? index + 1 : undefined;
    }).filter(Number);

    setTimeout(function () {
      move(cups[Math.floor(Math.random() * cups.length)] - 1);
    }, 500);
  }

  // The board is the crux of the game and handles sowing seeds around the board,
  // firing events and asynchronously calling players move functions.

  function Board(player1, player2, options) {
    this.options = options;
    this.players = [new Player(player1), new Player(player2)];
    return this;
  }

  Board.prototype.start = function () {
    this.options.onstart(this.players);
    this.next(new Turn(0, null));
    return this;
  };

  Board.prototype.next = function (turn) {
    var context = this;
    this.players[turn.player].move(function (cup_index) {
      turn.cup = cup_index;
      context.move(turn);
    }, this.players);
  };

  Board.prototype._get_seeds = function (turn) {
    return this.players[turn.player].cups[turn.cup];
  };

  Board.prototype.move = function (startturn) {
    var context = this, timeout, endturn;

    endturn = startturn.clone();

    endturn.seeds = this._get_seeds(endturn);

    function tick(recursive, timeout) {
      if (endturn.seeds === 0) {
        clearTimeout(timeout);
      } else {
        endturn.seeds -= 1;
        context.options.onmove(endturn, context.players);
        clearTimeout(timeout);
        recursive();
      }
    }

    (function next() {
      timeout = setTimeout(function () {
        tick(next, timeout);
      }, context.options.speed);
    }());

    return this;
  };

  // Acts as a public interface to the script, handles default options/events.

  function Mancala(player1, player2, options) {
    var context = this, events;

    events = [
      "start",
      "finish",
      "capture",
      "extra",
      "picked",
      "pit",
      "move"
    ];

    events.forEach(function (event) {
      options["on" + event] = options[event] || function () {};
    });

    options.speed = options.speed || 500;

    this.start = this.restart = function () {
      context.board = new Board(player1, player2, options).start();
      return context;
    };
  }

  root.mancala = {
    rules: rules,
    Turn: Turn,
    Board: Board,
    Player: Player,
    computer: computer,
    Mancala: Mancala
  };

}).call(this);

(function () {

  "use strict";

  var root = this;

  function start() {}

  root.game = start;

}).call(this);
