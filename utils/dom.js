/**
 * Cross browser dom events.
 * @author jonobr1 / http://jonobr1.com
 */


(function() {

  var root = this;
  var previousDom = this['dom'] || {};
  var dom = {

  hasEventListeners: !!root.addEventListener,

  bind: function(elem, event, func, bool) {
    if (this.hasEventListeners) {
      elem.addEventListener(event, func, !!bool);
    } else {
      elem.attachEvent('on' + event, func);
    }
    return this;
  },

  unbind: function(elem, event, func, bool) {
    if (this.hasEventListeners) {
      elem.removeEventListeners(event, func, !!bool);
    } else {
      elem.detachEvent('on' + event, func);
    }
    return this;
  },

  noConflict: function() {
    root['dom'] = previousDom;
    return previousDom;
  }

};

  root['dom'] = dom;

})();