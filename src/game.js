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
