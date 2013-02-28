$(function () {


  test("Player function", function () {
    var player = new mancala.Player();
    ok(player.finished() === false, "After player has been initialized, it is not finished");

    player.cups = [0, 0, 0, 0, 0, 0];
    ok(player.finished() === true, "When all cups are empty, player is finished");

    player.cups = [0, 0, 0, 0, 0, 1];
    ok(player.finished() === false, "When there is at least one cup, player is not finished");
  });


  asyncTest("Computer function", 4, function () {
    var gate = 0;
    function check() {
      gate += 1;
      if (gate === 4) { start(); }
    }

    mancala.computer(function (index) {
      ok(index === 3, "test randomly chose the only sane option");
      check();
    }, {
      cups: [0,0,0,5,0,0]
    });

    mancala.computer(function (index) {
      ok(index === 3 || index === 1, "test picking one of two options");
      check();
    }, {
      cups: [0,1,0,5,0,0]
    });

    mancala.computer(function (index) {
      ok(index === 5, "test randomly chose the only sane option at the end of the array");
      check();
    }, {
      cups: [0,0,0,0,0,1]
    });

    mancala.computer(function (index) {
      ok(index === 0, "test randomly chose the only sane option at the start of the array");
      check();
    }, {
      cups: [1,0,0,0,0,0]
    });
  });


  test("Board movements", function () {
    var board = new mancala.Board(function () {}, function () {}, {
      onstart: function () {}
    });

    ok(board.players.length === 2, "player array inits correctly");
  });


  asyncTest("Recursive sowing of seeds", 4, function () {
    var check, one, two, game;

    check = 0;
    one = function (next) { next(2); };
    two = function () {};

    game = new mancala.Mancala(one, two, {
      move: function (turn) {
        check += 1;
        ok(turn.seeds === (4 - check), "seed count is decremented");
        if (check === 4) {
          start();
        }
      }
    });

    game.start();
  });


  test("Rules:end", function () {
    var players = [new mancala.Player(), new mancala.Player()]
      , ended = [0, 0, 0, 0, 0, 0];

    ok(mancala.rules.end({}, {}, players) === false, "game not finished");

    players[0].cups = ended;
    ok(mancala.rules.end({}, {}, players) === true, "player 0 is finished");

    players[0].cups = players[1].cups;
    players[1].cups = ended;
    ok(mancala.rules.end({}, {}, players) === true, "player 1 is finished");
  });


  test("Rules:extra", function () {
    var extrago = mancala.rules.extra, Turn = mancala.Turn;

    ok(extrago(new Turn(0, 2), new Turn(1, 0)) === false, "not an extra go");
    ok(extrago(new Turn(0, 5), new Turn(0, -1)) === true, "player 0 gets an extra go");
    ok(extrago(new Turn(1, 2), new Turn(1, 6)) === true, "player 1 gets an extra go");
  });


  test("Rules:capture", function () {
    var Player = mancala.Player
      , Turn = mancala.Turn
      , capture = mancala.rules.capture
      , players = [new Player(), new Player()]
      , start = new Turn(1, 3)
      , end = new Turn(1, 4);

    players[1].cups = [4, 4, 4, 0, 1, 4];
    ok(capture(start, end, players) === true, "captured opponents seeds");

    players[1].cups = [4, 4, 4, 0, 2, 4];
    ok(capture(start, end, players) === false, "did not capture seeds");

    ok(capture(new Turn(1, 3), new Turn(0, 1), players) === false, "did not capture seeds");
  });


  asyncTest("Mancala interface", 1, function () {
    var m = new mancala.Mancala(function () {}, function () {}, {
      "start": function () {
        ok(1 === 1, "start event called on init");
      }
    });

    setTimeout(function () {
      m.restart();
      start();
    }, 30);
  });


});
