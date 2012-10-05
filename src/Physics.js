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

    this.playing = false;

    ParticleSystem.apply(this, arguments);

    this.animations = [];

    update.call(this);

  };

  _.extend(Physics, ParticleSystem, {

    superclass: ParticleSystem

  });

  _.extend(Physics.prototype, ParticleSystem.prototype, {

    /**
     * Play the animation loop. Doesn't affect whether in equilibrium or not.
     */
    play: function() {

      if (this.playing) {
        return this;
      }

      this.playing = true;
      this.__equilibrium = false;
      update.call(this);

      return this;

    },

    /**
     * Pause the animation loop. Doesn't affect whether in equilibrium or not.
     */
    pause: function() {

      this.playing = false;
      return this;

    },

    /**
     * Toggle between playing and pausing the simulation.
     */
    toggle: function() {

      if (this.playing) {
        this.pause();
      } else {
        this.play();
      }

      return this;

    },

    onUpdate: function(func) {

      if (_.indexOf(this.animations, func) >= 0 || !_.isFunction(func)) {
        return this;
      }

      this.animations.push(func);

      return this;

    },

    /**
     * Call update after values in the system have changed and this will fire
     * it's own Request Animation Frame to update until things have settled
     * to equilibrium — at which point the system will stop updating.
     */
    update: function() {

      if (!this.__equilibrium) {
        return this;
      }

      this.__equilibrium = false;
      if (this.playing) {
        update.call(this);
      }

      return this;

    }

  });

  function update() {

    var _this = this;

    this.tick();

    _.each(this.animations, function(a) {
      a();
    });

    if ((this.optimized && !this.__equilibrium || !this.optimized) && this.playing) {

      raf(function() {
        update.call(_this);
      });

    }

  }

  return Physics;

});
