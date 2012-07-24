define([
  'Traer',
  'requestAnimationFrame',
  'common'
], function(Traer, raf, _) {

  /**
   * Extended singleton instance of Traer Physics with convenience methods for
   * Request Animation Frame.
   * @class
   */
  var System = function() {

    var _this = this;

    Traer.ParticleSystem.apply(this, arguments);

    this.animations = [];

  };

  System.Traer = Traer;

  _.extend(System.prototype, Traer.ParticleSystem.prototype, {

    /**
     * Call update after values in the system have changed and this will fire
     * it's own Request Animation Frame to update until things have settled
     * to equilibrium — at which point the system will stop updating.
     */
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

  var system = new System();

  update.call(system);

  return system;

});
