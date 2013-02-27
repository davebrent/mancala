(function () {

  "use strict";

  var root = this
    , rules = {};


  rules.capture = function (started, ended, players) {
    var opposing, endplayer;

    if (started.player !== ended.player) {
      return false;
    }

    opposing  = players[(started.player + 1) % players.length].cups[ended.cup];
    endplayer = players[ended.player].cups[ended.cup];

    if (opposing === 1 && endplayer > 0) {
      return true;
    }

    return false;
  };

  rules.extra = function (started, ended) {
    if (started.player !== ended.player) {
      return false;
    }

    if ((started.player === 0 && ended.cup < 0) ||
        (ended.player === 1 && ended.cup === 6)) {
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


  function Turn(player_index, cup_index) {
    this.player = player_index;
    this.cup = cup_index;
  }

  Turn.prototype.clone = function () {
    return new Turn(this.player, this.cup);
  };


  function Player() {
    this.pit = 0;
    this.cups = [4, 4, 4, 4, 4, 4];
  }

  Player.prototype.finished = function () {
    return (this.cups.reduce(function (memo, val) {
      return memo + val;
    }) === 0);
  };


  function Board() {
    this.players = [new Player(), new Player()];
  }


  function Mancala(options) {
    var context = this;
    options = (options) ? options : {};
    [ "start",
      "finish",
      "capture",
      "extra",
      "picked",
      "pit",
      "move"
    ].forEach(function (event) {
      context["on" + event] = (options[event]) ? options[event] : function () {};
    });
  }

  Mancala.prototype.start = Mancala.prototype.restart = function () {
    this.moves = 0;
    this.board = new Board();
    this.onstart(this.board);
  };


  root.mancala = {
    rules: rules,
    Turn: Turn,
    Board: Board,
    Player: Player,
    Mancala: Mancala
  };

}).call(this);
