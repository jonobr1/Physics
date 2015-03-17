define([], function() {

  var root = root || this;

  /*
   * Requirified version of Paul Irish's request animation frame.
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return  root.requestAnimationFrame       ||
          root.webkitRequestAnimationFrame ||
          root.mozRequestAnimationFrame    ||
          root.oRequestAnimationFrame      ||
          root.msRequestAnimationFrame     ||
          function (callback) {
            root.setTimeout(callback, 1000 / 60);
          };
});