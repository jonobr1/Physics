define([
  'Vector',
  'common'
], function(Vector, _) {

  /**
   * Runge Kutta Integrator
   * http://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
   * 
   * @class
   */
  var Integrator = function(s) {
    this.s = s;
    this.originalPositions = [];
    this.originalVelocities = [];
    this.k1Forces = [];
    this.k1Velocities = [];
    this.k2Forces = [];
    this.k2Velocities = [];
    this.k3Forces = [];
    this.k3Velocities = [];
    this.k4Forces = [];
    this.k4Velocities = [];
  };

  _.extend(Integrator.prototype, {

    allocateParticles: function() {

      while (this.s.particles.length > this.originalPositions.length) {
        this.originalPositions.push(new Vector());
        this.originalVelocities.push(new Vector());
        this.k1Forces.push(new Vector());
        this.k1Velocities.push(new Vector());
        this.k2Forces.push(new Vector());
        this.k2Velocities.push(new Vector());
        this.k3Forces.push(new Vector());
        this.k3Velocities.push(new Vector());
        this.k4Forces.push(new Vector());
        this.k4Velocities.push(new Vector());
      }

      return this;

    },

    step: function(dt) {

      var s = this.s;
      var p, x, y;

      this.allocateParticles();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.originalPositions[i].copy(p.position);
          this.originalVelocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K1

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k1Forces[i].copy(p.force);
          this.k1Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K2

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k1v = this.k1Velocities[i];
          x = op.x + k1v.x * 0.5 * dt;
          y = op.y + k1v.y * 0.5 * dt;
          p.position.set(x, y);

          var ov = this.originalVelocities[i];
          var k1f = this.k1Forces[i];
          x = ov.x + k1f.x * 0.5 * dt / p.mass;
          y = ov.y + k1f.y * 0.5 * dt / p.mass;
          p.velocity.set(x, y);

        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k2Forces[i].copy(p.force);
          this.k2Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K3

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k2v = this.k2Velocities[i];
          p.position.set(op.x + k2v.x * 0.5 * dt, op.y + k2v.y * 0.5 * dt);

          var ov = this.originalVelocities[i];
          var k2f = this.k2Forces[i];
          p.velocity.set(ov.x + k2f.x * 0.5 * dt / p.mass, ov.y + k2f.y * 0.5 * dt / p.mass);
        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k3Forces[i].copy(p.force);
          this.k3Velocities[i].copy(p.velocity);
        }
        p.force.clear();
      }, this);

      // K4

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k3v = this.k3Velocities[i];
          p.position.set(op.x + k3v.x * dt, op.y + k3v.y * dt)

          var ov = this.originalVelocities[i];
          var k3f = this.k3Forces[i];
          p.velocity.set(ov.x + k3f.x * dt / p.mass, ov.y + k3f.y * dt / p.mass);
        }
      }, this);

      s.applyForces();

      _.each(s.particles, function(p, i) {
        if (!p.fixed) {
          this.k4Forces[i].copy(p.force);
          this.k4Velocities[i].copy(p.velocity);
        }
      }, this);

      // TOTAL

      _.each(s.particles, function(p, i) {

        p.age += dt;

        if (!p.fixed) {

          var op = this.originalPositions[i];
          var k1v = this.k1Velocities[i];
          var k2v = this.k2Velocities[i];
          var k3v = this.k3Velocities[i];
          var k4v = this.k4Velocities[i];

          var x = op.x + dt / 6.0 * (k1v.x + 2.0 * k2v.x + 2.0 * k3v.x + k4v.x);
          var y = op.y + dt / 6.0 * (k1v.y + 2.0 * k2v.y + 2.0 * k3v.y + k4v.y);

          p.position.set(x, y);

          var ov = this.originalVelocities[i];
          var k1f = this.k1Forces[i];
          var k2f = this.k2Forces[i];
          var k3f = this.k3Forces[i];
          var k4f = this.k4Forces[i];

          x = ov.x + dt / (6.0 * p.mass) * (k1f.x + 2.0 * k2f.x + 2.0 * k3f.x + k4f.x);
          y = ov.y + dt / (6.0 * p.mass) * (k1f.y + 2.0 * k2f.y + 2.0 * k3f.y + k4f.y);

          p.velocity.set(x, y);

        }

      }, this);

      return this;

    }

  });

  return Integrator;

});
