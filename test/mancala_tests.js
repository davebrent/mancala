$(function () {


  test("Player function", function () {
    var player = new mancala.Player();
    ok(player.finished() === false, "After player has been initialized, it is not finished");

    player.cups = [0, 0, 0, 0, 0, 0];
    ok(player.finished() === true, "When all cups are empty, player is finished");

    player.cups = [0, 0, 0, 0, 0, 1];
    ok(player.finished() === false, "When there is at least one cup, player is not finished");
  });


  test("Board movements", function () {
    var board = new mancala.Board();

    ok(board.players.length === 2, "player array inits correctly");
  });


  test("Mancala interface", function () {
    var m = new mancala.Mancala({
      "capture": function () { ok(1 === 1, "mixing in custom events on init"); }
    });

    m.oncapture();
    ok(typeof m.onfinish() === "undefined", "undefined event defaults to empty function");

    m.onstart = function () { ok(1 === 1, "start event firing on start"); };
    m.start();
    m.onstart = function () { ok(1 === 1, "start event firing on restart"); };
    m.restart();
  });


});
