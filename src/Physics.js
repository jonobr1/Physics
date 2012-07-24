define([
  'ParticleSystem',
  'requestAnimationFrame',
  'common'
], function(ParticleSystem, raf, _) {

  var updates = [];

  /**
   * Extended singleton instance of ParticleSystem with convenience methods for
   * Request Animation Frame.
   * @class
   */
  var Physics = function() {

    var _this = this;

    ParticleSystem.apply(this, arguments);

    this.animations = [];

    update.call(this);

  };

  _.extend(Physics, ParticleSystem, {

    superclass: ParticleSystem

  });

  _.extend(Physics.prototype, ParticleSystem.prototype, {

    /**
     * Call update after values in the system have changed and this will fire
     * it's own Request Animation Frame to update until things have settled
     * to equilibrium — at which point the system will stop updating.
     */
    update: function() {

      if (this.__equilibrium) {
        this.__equilibrium = false;
        update.call(this);
      }

      return this;

    }

  });

  function update() {

    var _this = this;

    this.tick();

    _.each(this.animations, function(a) {
      if (_.isFunction(a.update)) {
        a.update();
      }
    });

    if (!this.__equilibrium) {

      raf(function() {
        update.call(_this);
      });

    }

  }

  return Physics;

});
