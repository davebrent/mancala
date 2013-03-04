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

    if (started.player === ended.player) {
      return false;
    }

    a = (ended.player === 1 && ended.cup < 0);
    b = (ended.player === 0 && ended.cup === 6);

    if (a || b) {
      return true;
    }

    return false;
  };

  rules.pit = function (turn) {
    if (turn.cup < 0 || turn.cup === 6) {
      return true;
    }
    return false;
  };

  rules.score = function (started, ended) {
    if (started.player === ended.player) {
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
    return new Turn(this.player, this.cup, this.seeds);
  };

  Turn.prototype.next = function () {
    return new Turn((this.player + 1) % 2, this.cup, this.seeds);
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
    }, 1000);
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
    var context = this, player;

    function startmove(cup_index) {
      turn.cup = cup_index;
      turn.seeds = context._get_seeds(turn);
      context.players[turn.player].cups[turn.cup] = 0;
      context.options.onpicked(turn, context.players);
      context.move(turn);
    }

    player = this.players[turn.player];
    player.move(startmove, player);
    return this;
  };

  Board.prototype.move = function (startturn) {
    var context = this, timeout, endturn;

    endturn = startturn.clone();

    function tick(recursive, timeout) {
      if (endturn.seeds === 0) {
        clearTimeout(timeout);
        context._close.call(context, endturn, startturn);
      } else {
        endturn = context._tick.call(context, endturn, startturn);
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

  Board.prototype._tick = function (endturn, startturn) {
    endturn.cup += (endturn.player * 2) - 1;

    if (rules.pit(endturn)) {
      if (startturn.player === endturn.player) {
        this.players[endturn.player].pit += 1;
        this.options.onpit(endturn.clone(), this.players);
      }

      endturn = endturn.next();
    } else {
      this.players[endturn.player].cups[endturn.cup] += 1;
      this.options.onmove(endturn, this.players);
    }

    endturn.seeds -= 1;
    return endturn;
  };

  Board.prototype._get_seeds = function (turn) {
    return this.players[turn.player].cups[turn.cup];
  };

  Board.prototype._get_winner = function () {
    var scores = this.players.map(function (player) {
      return player.pit;
    });

    if (scores[0] === scores[1]) {
      return 2;
    }

    return scores.indexOf(Math.max.apply(null, scores));
  };

  Board.prototype._make_capture = function (endturn, startturn) {
    var idx = endturn.cup
      , opp = this.players[(startturn.player + 1) % 2]
      , cur = this.players[startturn.player]
      , seeds = opp.cups[idx];

    cur.pit += (seeds + 1);

    opp.cups[idx] = 0;
    cur.cups[idx] = 0;

    return this.players;
  };

  Board.prototype._close = function (endturn, startturn) {
    if (rules.capture(startturn, endturn, this.players)) {
      this._make_capture(endturn, startturn);
      this.options.oncapture(endturn, this.players);
    }

    if (rules.end(startturn, endturn, this.players)) {
      this.options.onfinish(this._get_winner(), this.players);
    } else {

      if (rules.extra(startturn, endturn)) {
        this.options.onextra(startturn);
      } else {
        startturn = startturn.next();
        this.options.onturn(startturn);
      }

      this.next(startturn);
    }
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
      "move",
      "turn"
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

  var root = this
    , options
    , player
    , toggle_sow_class
    , toggle_score_class;

  toggle_sow_class = add_remove("active", 200);
  toggle_score_class = add_remove("score", 200);

  function add_remove(klass, speed) {
    return function ($el) {
      $el.addClass(klass);
      setTimeout(function () {
        $el.removeClass(klass);
      }, speed);
    };
  }

  player = function (next) {
    var board = $('.player-2');
    board.on('click', '.cup', function (event) {
      var cup = $(this).data('cup');
      event.preventDefault();
      board.off('click');
      next(cup);
    });
  };

  function update_cup(turn, players) {
    var sel = '.player-' + (turn.player + 1)
      , cup = '[data-cup="' + turn.cup + '"]'
      , ele = $(sel + ' ' + cup);

    ele.html(players[turn.player].cups[turn.cup]);
    toggle_sow_class(ele);
  }

  function update_opp(turn, players) {
    var plr = ((turn.player + 1) % 2)
      , sel = '.player-' + (plr + 1)
      , cup = '[data-cup="' + turn.cup + '"]'
      , ele = $(sel + ' ' + cup);

    ele.html(players[plr].cups[turn.cup]);
    toggle_sow_class(ele);
  }

  function update_pit(turn, players) {
    var ele = $('.player-' + (turn.player + 1) + '.pit');
    ele.html(players[turn.player].pit);
    toggle_score_class(ele);
  }

  function update_msg(msg) {
    $('.messages').html(msg);
  }

  options = {
    speed: 200,
    picked: update_cup,
    move: update_cup,
    pit: update_pit,
    start: function (players) {

    },
    finish: function (winner) {

    },
    capture: function (turn, players) {
      update_cup(turn, players);
      update_opp(turn, players);
      update_pit(turn, players);
    },
    extra: function (turn) {
      update_msg("player " + turn.player + " gets an extra go");
    },
    turn: function (turn) {
      update_msg("player " + turn.player + "'s' turn");
    }
  };

  function start() {
    var game = new mancala.Mancala(mancala.computer, player, options);
    game.start();
  }

  root.game = start;

}).call(this);
