define([
  'Vector',
  'Particle',
  'Spring',
  'Attraction',
  'Integrator',
  'common'
], function(Vector, Particle, Spring, Attraction, Integrator, _) {

  /**
   * traer.js
   * A particle-based physics engine ported from Jeff Traer's Processing
   * library to JavaScript. This version is intended for use with the
   * HTML5 canvas element. It is dependent on Three.js' Vector2 class,
   * but can be overridden with any Vector2 class with the methods included.
   *
   * @author Jeffrey Traer Bernstein <jeff TA traer TOD cc> (original Java library)
   * @author Adam Saponara <saponara TA gmail TOD com> (JavaScript port)
   * @author Jono Brandel <http://jonobr1.com/> (requirified/optimization port)
   * 
   * @version 0.3
   * @date March 25, 2012
   */

  /**
   * The whole kit and kaboodle.
   *
   * @class
   */
  var ParticleSystem = function() {

    this.__equilibrium = false; // are we at equilibrium?

    this.particles = [];
    this.springs = [];
    this.attractions = [];
    this.forces = [];
    this.integrator = new Integrator(this);
    this.hasDeadParticles = false;

    var args = arguments.length;

    if (args === 2) {
      this.gravity = new Vector(0, arguments[0]);
      this.drag = arguments[1];
    } else if (args === 3) {
      this.gravity = new Vector(arguments[0], arguments[1]);
      this.drag = arguments[3];
    } else {
      this.gravity = new Vector(0, ParticleSystem.DEFAULT_GRAVITY);
      this.drag = ParticleSystem.DEFAULT_DRAG;
    }

  };

  _.extend(ParticleSystem, {

    DEFAULT_GRAVITY: 0,

    DEFAULT_DRAG: 0.001,

    Attraction: Attraction,

    Integrator: Integrator,

    Particle: Particle,

    Spring: Spring,

    Vector: Vector

  });

  _.extend(ParticleSystem.prototype, {

    /**
     * Set the gravity of the ParticleSystem.
     */
    setGravity: function(x, y) {
      this.gravity.set(x, y);
      return this;
    },

    /**
     * Update the integrator
     */
    tick: function() {
      this.integrator.step(arguments.length === 0 ? 1 : arguments[0]);
      this.__equilibrium = !this.needsUpdate();
      return this;
    },

    /**
     * Checks all springs and attractions to see if the contained particles are
     * inert / resting and returns a boolean.
     */
    needsUpdate: function() {

      for (var i = 0, l = this.particles.length; i < l; i++) {
        if (!this.particles[i].resting()) {
          return true;
        }
      }

      for (var i = 0, l = this.springs.length; i < l; i++) {
        if (!this.springs[i].resting()) {
          return true;
        }
      }


      for (var i = 0, l = this.attractions.length; i < l; i++) {
        if (!this.attractions[i].resting()) {
          return true;
        }
      }

      return false;

    },

    /**
     * Add a particle to the ParticleSystem.
     */
    addParticle: function(p) {

      this.particles.push(p);
      return this;

    },

    /**
     * Add a spring to the ParticleSystem.
     */
    addSpring: function(s) {

      this.springs.push(s);
      return this;

    },

    /**
     * Add an attraction to the ParticleSystem.
     */
    addAttraction: function(a) {

      this.attractions.push(a);
      return this;

    },

    /**
     * Makes and then adds Particle to ParticleSystem.
     */
    makeParticle: function(m, x, y) {

      var mass = _.isNumber(m) ? m : 1.0;
      var x = x || 0;
      var y = y || 0;

      var p = new Particle(mass);
      p.position.set(x, y);
      this.addParticle(p);
      return p;

    },

    /**
     * Makes and then adds Spring to ParticleSystem.
     */
    makeSpring: function(a, b, k, d, l) {

      var s = new Spring(a, b, k, d, l);
      this.addSpring(s);
      return s;

    },

    /**
     * Makes and then adds Attraction to ParticleSystem.
     */
    makeAttraction: function(a, b, k, d) {

      var a = new Attraction(a, b, k, d);
      this.addAttraction(a);
      return a;

    },

    /**
     * Wipe the ParticleSystem clean.
     */
    clear: function() {

      this.particles.length = 0;
      this.springs.length = 0;
      this.attractions.length = 0;

    },

    /**
     * Calculate and apply forces.
     */
    applyForces: function() {

      if (!this.gravity.isZero()) {
        _.each(this.particles, function(p) {
          p.force.addSelf(this.gravity);
        }, this);
      }

      var t = new Vector();

      _.each(this.particles, function(p) {
        t.set(p.velocity.x * -1 * this.drag, p.velocity.y * -1 * this.drag);
        p.force.addSelf(t);
      }, this);

      _.each(this.springs, function(s) {
        s.update();
      });

      _.each(this.attractions, function(a) {
        a.update();
      });

      _.each(this.forces, function(f) {
        f.update();
      });

      return this;

    },

    /**
     * Clear all particles in the system.
     */
    clearForces: function() {
      _.each(this.particles, function(p) {
        p.clear();
      });
      return this;
    }

  });

  return ParticleSystem;

});
