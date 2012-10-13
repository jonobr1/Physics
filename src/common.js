define([
], function() {

  /**
   * Pulled only what's needed from:
   * 
   * Underscore.js 1.3.3
   * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
   * http://documentcloud.github.com/underscore
   */

  var ArrayProto = Array.prototype;
  var ObjProto = Object.prototype;
  var hasOwnProperty = ObjProto.hasOwnProperty;
  var slice = ArrayProto.slice;
  var nativeForEach = ArrayProto.forEach;
  var nativeIndexOf      = ArrayProto.indexOf;
  var toString = ObjProto.toString;

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

  var identity = function(value) {
    return value;
  };

  var sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  return {

    has: has,

    each: each,

    extend: function(obj) {
      each(slice.call(arguments, 1), function(source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    },

    indexOf: function(array, item, isSorted) {
      if (array == null) return -1;
      var i, l;
      if (isSorted) {
        i = sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
      if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
      for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
      return -1;
    },

    sortedIndex: sortedIndex,

    identity: identity,

    isNumber: function(obj) {
      return toString.call(obj) == '[object Number]';
    },

    isFunction: function(obj) {
      return toString.call(obj) == '[object Function]' || typeof obj == 'function';
    },

    isUndefined: function(obj) {
      return obj === void 0;
    },

    isNull: function(obj) {
      return obj === null;
    }

  }

});
