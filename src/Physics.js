define([
  'physics/Traer',
  'RAF',
  'underscore'
], function(Traer, raf) {

  /**
   * Extended instance of Traer Physics with convenience methods for
   * Request Animation Frame.
   */
  var Physics = function() {

    var _this = this;

    Traer.ParticleSystem.apply(this, arguments);

    this.animations = [];

  };

  Physics.Traer = Traer;

  _.extend(Physics.prototype, Traer.ParticleSystem.prototype, {

    update: function() {

      if (this.__equilibrium) {
        this.__equilibrium = false;
        update.call(this);;
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

  /**
   * Module to contain one instance {Sigleton} of the ParticlSystem and methods
   * of controlling it. Mainly used for optimization purposes.
   */

  var physics = new Physics();

  update.call(physics);

  return physics;

});
