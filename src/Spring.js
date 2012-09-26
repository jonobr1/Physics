define([
  'Vector',
  'common'
], function(Vector, _) {

  var Spring = function(a, b, k, d, l) {

    this.constant = k;
    this.damping = d;
    this.length = l;
    this.a = a;
    this.b = b;
    this.on = true;

  };

  _.extend(Spring.prototype, {

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
     */
    resting: function() {

      var a = this.a;
      var b = this.b;
      var l = this.length;

      return !this.on || (a.fixed && b.fixed)
        || (a.fixed && (l === 0 ? b.position.equals(a.position) : b.position.distanceTo(a.position) <= l) && b.resting())
        || (b.fixed && (l === 0 ? a.position.equals(b.position) : a.position.distanceTo(b.position) <= l) && a.resting());

    }

  });

  return Spring;

});
