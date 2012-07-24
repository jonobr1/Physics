/**
 * Physics
 * A requirified port of Traer Physics from Processing to JavaScript.
 * Copyright (C) 2012 jonobr1
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/** @namespace */
var physics = physics || {};

common = (function () {

  /**
   * Pulled only what's needed from:
   * 
   * Underscore.js 1.3.3
   * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
   * http://documentcloud.github.com/underscore
   */

  var ArrayProto = Array.prototype;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var slice = ArrayProto.slice;
  var nativeForEach = ArrayProto.forEach;

  var has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  var each = function(obj, iterator, context) {

    if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
          obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
          for (var i = 0, l = obj.length; i < l; i++) {
            if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
          }
        } else {
          for (var key in obj) {
            if (_.has(obj, key)) {
              if (iterator.call(context, obj[key], key, obj) === breaker) return;
            }
          }
        }

  };

  return {

    has: has,

    each: each,

    extend: function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          obj[prop] = source;
        }
      });
      return obj;
    },

    isNumber: function(obj) {
      return toString.call(obj) == '[object Number]';
    },

    isFunction: function(obj) {
      return toString.call(obj) == '[object Function]';
    }

  }

})();


physics.System = System = (function (Traer, raf, _) {

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
        update.call(this);
      }

      return this;

    }

  });

  function update() {

    var _this = this;

    console.log(this);

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

})(Traer = (function (Vector, _) {

  var Physics = {};

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
   *
   * @class
   */
  Physics.Particle = function(mass) {

    this.position = new Vector();
    this.velocity = new Vector();
    this.force = new Vector();
    this.mass = mass;
    this.fixed = false;
    this.age = 0;
    this.dead = false;

  };

  _.extend(Physics.Particle.prototype, {

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

  /**
   * @class
   */
  Physics.Spring = function(a, b, k, d, l) {

    this.constant = k;
    this.damping = d;
    this.length = l;
    this.a = a;
    this.b = b;
    this.on = true;

  };

  _.extend(Physics.Spring.prototype, {

    /**
     * Returns the distance between particle a and particle b
     * in 2D space.
     */
    currentLength: function() {
      return this.a.position.distanceTo(this.b.position);
    },

    /**
     * Update spring logic.
     */
    update: function() {

      var a = this.a;
      var b = this.b;
      if (!(this.on && (!a.fixed || !b.fixed))) return this;

      var a2b = new Vector().sub(a.position, b.position);
      var d = a2b.length();

      if (d === 0) {
        a2b.clear();
      } else {
        a2b.divideScalar(d);  // Essentially normalize
      }

      var fspring = -1 * (d - this.length) * this.constant;

      var va2b = new Vector().sub(a.velocity, b.velocity);

      var fdamping = -1 * this.damping * va2b.dot(a2b);

      var fr = fspring + fdamping;

      a2b.multiplyScalar(fr);

      if (!a.fixed) {
        a.force.addSelf(a2b);
      }
      if (!b.fixed) {
        b.force.subSelf(a2b);
      }

      return this;

    },

    /**
     * Returns a boolean describing whether the spring is resting or not.
     * Convenient for knowing whether or not the spring needs another update
     * tick.
     *
     * TODO: Assumes a length of zero at the moment...
     */
    resting: function() {

      var a = this.a;
      var b = this.b;
      var l = this.length;

      return (a.fixed && b.fixed)
        || (a.fixed && (l === 0 ? b.position.equals(a.position) : b.position.distanceTo(a.position) <= l) && b.resting())
        || (b.fixed && (l === 0 ? a.position.equals(b.position) : a.position.distanceTo(b.position) <= l) && a.resting());

    }

  });

  /**
   * @class
   */
  Physics.Attraction = function(a, b, k, d) {

    this.a = a;
    this.b = b;
    this.constant = k;
    this.on = true;
    this.distanceMin = d;
    this.distanceMinSquared = d * d;

  };

  _.extend(Physics.Attraction.prototype, {

    update: function() {

     var a = this.a, b = this.b;
     if (!this.on || (a.fixed && b.fixed)) {
       return;
     }

     var a2bx = a.position.x - b.position.x;
     var a2by = a.position.y - b.position.y;

     var a2b = new Vector().sub(a.position, b.position);

     var a2bdistanceSquared = Math.max(a2b.lengthSq(), this.distanceMinSquared);

     var force = (this.constant * a.mass * b.mass) / a2bdistanceSquared;

     var length = Math.sqrt(a2bdistanceSquared);

     if (force === 0 || length === 0) {
       a2b.clear();
     } else {
       a2b.divideScalar(length).multiplyScalar(force);
     }

     if (!a.fixed) {
       a.force.subSelf(a2b);
     }
     if (!b.fixed) {
       b.force.addSelf(a2b);
     }

     return this;

    },

    /**
     * Returns a boolean describing whether the spring is resting or not.
     * Convenient for knowing whether or not the spring needs another update
     * tick.
     *
     * TODO: Test
     */
    resting: function() {

      var a = this.a;
      var b = this.b;
      var l = this.distanceMin;

      return (a.fixed && b.fixed)
        || (a.fixed && b.position.distanceTo(a.position) <= l && b.resting())
        || (b.fixed && a.position.distanceTo(b.position) <= l && a.resting());

    }

  });

  /**
   * The who kit and kaboodle.
   *
   * @class
   */
  Physics.ParticleSystem = function() {

    this.__equilibrium = false; // are we at equilibrium?

    this.particles = [];
    this.springs = [];
    this.attractions = [];
    this.forces = [];
    this.integrator = new RungeKuttaIntegrator(this);
    this.hasDeadParticles = false;

    var args = arguments.length;

    if (args === 2) {
      this.gravity = new Vector(0, arguments[0]);
      this.drag = arguments[1];
    } else if (args === 3) {
      this.gravity = new Vector(arguments[0], arguments[1]);
      this.drag = arguments[3];
    } else {
      this.gravity = new Vector(0, Physics.ParticleSystem.DEFAULT_GRAVITY);
      this.drag = Physics.ParticleSystem.DEFAULT_DRAG;
    }

  };

  _.extend(Physics.ParticleSystem, {

    DEFAULT_GRAVITY: 0,

    DEFAULT_DRAG: 0.001

  });

  _.extend(Physics.ParticleSystem.prototype, {

    /**
     * Set the gravity of the System.
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

      needsUpdate = false;

      for (var i = 0, l = this.springs.length; i < l; i++) {
        if (!this.springs[i].resting()) {
          needsUpdate = true;
          break;
        }
      }

      if (!needsUpdate) {
        for (var i = 0, l = this.attractions.length; i < l; i++) {
          if (!this.attractions[i].resting()) {
            needsUpdate = true;
            break;
          }
        }
      }

      return needsUpdate;

    },

    /**
     * Add a particle to the System.
     */
    addParticle: function(p) {

      this.particles.push(p);
      return this;

    },

    /**
     * Add a spring to the System.
     */
    addSpring: function(s) {

      this.springs.push(s);
      return this;

    },

    /**
     * Add an attraction to the System.
     */
    addAttraction: function(a) {

      this.attractions.push(a);
      return this;

    },

    /**
     * Makes and then adds Particle to System.
     */
    makeParticle: function(m, x, y) {

      var mass = _.isNumber(m) ? m : 1.0;
      var x = x || 0;
      var y = y || 0;

      var p = new Physics.Particle(mass);
      p.position.set(x, y);
      this.addParticle(p);
      return p;

    },

    /**
     * Makes and then adds Spring to System.
     */
    makeSpring: function(a, b, k, d, l) {

      var s = new Physics.Spring(a, b, k, d, l);
      this.addSpring(s);
      return s;

    },

    /**
     * Makes and then adds Attraction to System.
     */
    makeAttraction: function(a, b, k, d) {

      var a = new Physics.Attraction(a, b, k, d);
      this.addAttraction(a);
      return a;

    },

    /**
     * Wipe the System clean.
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

  /**
   * @class
   */
  function RungeKuttaIntegrator(s) {
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
  }

  _.extend(RungeKuttaIntegrator.prototype, {

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

  return Physics;

})(Vector = (function (_) {

  /**
   * A two dimensional vector.
   */
  var Vector = function(x, y) {

    this.x = x || 0;
    this.y = y || 0;

  };

  _.extend(Vector.prototype, {

    set: function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    },

    copy: function(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    },

    clear: function() {
      this.x = 0;
      this.y = 0;
      return this;
    },

    clone: function() {
      return new Vector(this.x, this.y);
    },

    add: function(v1, v2) {
      this.x = v1.x + v2.x;
      this.y = v1.y + v2.y;
      return this;
    },

    addSelf: function(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },

    sub: function(v1, v2) {
      this.x = v1.x - v2.x;
      this.y = v1.y - v2.y;
      return this;
    },

    subSelf: function(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },

    multiplySelf: function(v) {
      this.x *= v.x;
      this.y *= v.y;
      return this;
    },

    multiplyScalar: function(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },

    divideScalar: function(s) {
      if (s) {
        this.x /= s;
        this.y /= s;
      } else {
        this.set(0, 0);
      }
      return this;
    },

    negate: function() {
      return this.multiplyScalar(-1);
    },

    dot: function(v) {
      return this.x * v.x + this.y * v.y;
    },

    lengthSq: function() {
      return this.x * this.x + this.y * this.y;
    },

    length: function() {
      return Math.sqrt(this.lengthSq());
    },

    normalize: function() {
      return this.divideScalar(this.length());
    },

    distanceTo: function(v) {
      return Math.sqrt(this.distanceToSquared(v));
    },

    distanceToSquared: function(v) {
      var dx = this.x - v.x, dy = this.y - v.y;
      return dx * dx + dy * dy;
    },

    setLength: function(l) {
      return this.normalize().multiplyScalar(l);
    },

    equals: function(v) {
      return this.distanceTo(v) < 0.0001 /* almost same position */;
    },

    lerp: function(v, t) {
      var x = (v.x - this.x) * t + this.x;
      var y = (v.y - this.y) * t + this.y;
      return this.set(x, y);
    },

    isZero: function() {
      return ( this.lengthSq() < 0.0001 /* almost zero */ );
    }

  });

  return Vector;

})(common),
common),
requestAnimationFrame = (function () {

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
})(),
common);