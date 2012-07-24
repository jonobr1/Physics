define([], function() {

  /*
   * Requirified version of Paul Irish's request animation frame.
   * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
   */

  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
});