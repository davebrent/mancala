(function () {

  "use strict";

  var root = this
    , rules = {};


  rules.capture = function (started, ended, players) {

  };

  rules.extra = function (started, ended) {

  };

  rules.end = function (started, ended, players) {

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
    options = (options) ? options : {};
    var context = this;
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

(function () {

  "use strict";

  var root = this;

  function start() {}

  root.game = start;

}).call(this);
