define([
  'Vector',
  'common'
], function(Vector, _) {

  var Particle = function(mass) {

    this.position = new Vector();
    this.velocity = new Vector();
    this.force = new Vector();
    this.mass = mass;
    this.fixed = false;
    this.age = 0;
    this.dead = false;

  };

  _.extend(Particle.prototype, {

    /**
     * Get the distance between two particles.
     */
    distanceTo: function(p) {
      return this.position.distanceTo(p.position);
    },

    /**
     * Make the particle fixed in 2D space.
     */
    makeFixed: function() {
      this.fixed = true;
      this.velocity.clear();
    },

    /**
     * Reset a particle.
     */
    reset: function() {

      this.age = 0;
      this.dead = false;
      this.position.clear();
      this.velocity.clear();
      this.force.clear();
      this.mass = 1.0;

    },

    /**
     * Returns a boolean describing whether the particle is in movement.
     */
    resting: function() {
      return this.fixed || this.velocity.isZero() && this.force.isZero();
    }

  });

  return Particle;

})