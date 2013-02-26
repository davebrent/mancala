(function () {

  "use strict";

  var root = this;

  function Mancala() {
    console.log("init Mancala");
  }

  root.Mancala = Mancala;

}).call(this);

(function () {

  "use strict";

  var root = this;

  function start() {
    console.log("start app");
  }

  root.game = start;

}).call(this);
