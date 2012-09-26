define([
  'Vector',
  'common'
], function(Vector, _) {

  var Attraction = function(a, b, k, d) {

    this.a = a;
    this.b = b;
    this.constant = k;
    this.on = true;
    this.distanceMin = d;
    this.distanceMinSquared = d * d;

  };

  _.extend(Attraction.prototype, {

    update: function() {

     var a = this.a, b = this.b;
     if (!this.on || (a.fixed && b.fixed)) {
       return;
     }

     var a2bx = a.position.x - b.position.x;
     var a2by = a.position.y - b.position.y;

     var a2b = new Vector().sub(a.position, b.position);

     var a2bdistanceSquared = Math.max(a2b.lengthSquared(), this.distanceMinSquared);

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

      return !this.on || (a.fixed && b.fixed)
        || (a.fixed && b.position.distanceTo(a.position) <= l && b.resting())
        || (b.fixed && a.position.distanceTo(b.position) <= l && a.resting());

    }

  });

  return Attraction;

});
