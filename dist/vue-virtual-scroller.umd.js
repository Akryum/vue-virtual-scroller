(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = global || self, factory(global['vue-virtual-scroller'] = {}, global.vue));
}(this, (function (exports, vue) { 'use strict';

  var config = {
    itemsLimit: 1000
  };

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var _ErrorTypeStrings;

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   * IMPORTANT: all calls of this function must be prefixed with
   * \/\*#\_\_PURE\_\_\*\/
   * So that rollup can tree-shake them if necessary.
   */
  function makeMap(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');

    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }

    return expectsLowerCase ? function (val) {
      return !!map[val.toLowerCase()];
    } : function (val) {
      return !!map[val];
    };
  }

  var GLOBALS_WHITE_LISTED = 'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' + 'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' + 'Object,Boolean,String,RegExp,Map,Set,JSON,Intl';
  var isGloballyWhitelisted = /*#__PURE__*/makeMap(GLOBALS_WHITE_LISTED);

  function normalizeStyle(value) {
    if (isArray(value)) {
      var res = {};

      for (var i = 0; i < value.length; i++) {
        var item = value[i];
        var normalized = normalizeStyle(isString(item) ? parseStringStyle(item) : item);

        if (normalized) {
          for (var key in normalized) {
            res[key] = normalized[key];
          }
        }
      }

      return res;
    } else if (isObject(value)) {
      return value;
    }
  }

  var listDelimiterRE = /;(?![^(]*\))/g;
  var propertyDelimiterRE = /:(.+)/;

  function parseStringStyle(cssText) {
    var ret = {};
    cssText.split(listDelimiterRE).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiterRE);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }

  function normalizeClass(value) {
    var res = '';

    if (isString(value)) {
      res = value;
    } else if (isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        res += normalizeClass(value[i]) + ' ';
      }
    } else if (isObject(value)) {
      for (var name in value) {
        if (value[name]) {
          res += name + ' ';
        }
      }
    }

    return res.trim();
  }

  var EMPTY_OBJ = process.env.NODE_ENV !== 'production' ? Object.freeze({}) : {};
  var EMPTY_ARR = process.env.NODE_ENV !== 'production' ? Object.freeze([]) : [];

  var NOOP = function NOOP() {};

  var onRE = /^on[^a-z]/;

  var isOn = function isOn(key) {
    return onRE.test(key);
  };

  var extend = Object.assign;

  var remove = function remove(arr, el) {
    var i = arr.indexOf(el);

    if (i > -1) {
      arr.splice(i, 1);
    }
  };

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  var hasOwn = function hasOwn(val, key) {
    return hasOwnProperty.call(val, key);
  };

  var isArray = Array.isArray;

  var isMap = function isMap(val) {
    return toTypeString(val) === '[object Map]';
  };

  var isSet = function isSet(val) {
    return toTypeString(val) === '[object Set]';
  };

  var isFunction = function isFunction(val) {
    return typeof val === 'function';
  };

  var isString = function isString(val) {
    return typeof val === 'string';
  };

  var isSymbol = function isSymbol(val) {
    return _typeof(val) === 'symbol';
  };

  var isObject = function isObject(val) {
    return val !== null && _typeof(val) === 'object';
  };

  var isPromise = function isPromise(val) {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
  };

  var objectToString = Object.prototype.toString;

  var toTypeString = function toTypeString(value) {
    return objectToString.call(value);
  };

  var toRawType = function toRawType(value) {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
  };

  var isIntegerKey = function isIntegerKey(key) {
    return isString(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
  };

  var cacheStringFunction = function cacheStringFunction(fn) {
    var cache = Object.create(null);
    return function (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };
  /**
   * @private
   */


  var capitalize = cacheStringFunction(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }); // compare whether a value has changed, accounting for NaN.

  var hasChanged = function hasChanged(value, oldValue) {
    return value !== oldValue && (value === value || oldValue === oldValue);
  };

  var _globalThis;

  var getGlobalThis = function getGlobalThis() {
    return _globalThis || (_globalThis = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {});
  };

  var targetMap = new WeakMap();
  var effectStack = [];
  var activeEffect;
  var ITERATE_KEY = Symbol(process.env.NODE_ENV !== 'production' ? 'iterate' : '');
  var MAP_KEY_ITERATE_KEY = Symbol(process.env.NODE_ENV !== 'production' ? 'Map key iterate' : '');

  function isEffect(fn) {
    return fn && fn._isEffect === true;
  }

  function effect(fn) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_OBJ;

    if (isEffect(fn)) {
      fn = fn.raw;
    }

    var effect = createReactiveEffect(fn, options);

    if (!options.lazy) {
      effect();
    }

    return effect;
  }

  function stop(effect) {
    if (effect.active) {
      cleanup(effect);

      if (effect.options.onStop) {
        effect.options.onStop();
      }

      effect.active = false;
    }
  }

  var uid = 0;

  function createReactiveEffect(fn, options) {
    var effect = function reactiveEffect() {
      if (!effect.active) {
        return options.scheduler ? undefined : fn();
      }

      if (!effectStack.includes(effect)) {
        cleanup(effect);

        try {
          enableTracking();
          effectStack.push(effect);
          activeEffect = effect;
          return fn();
        } finally {
          effectStack.pop();
          resetTracking();
          activeEffect = effectStack[effectStack.length - 1];
        }
      }
    };

    effect.id = uid++;
    effect.allowRecurse = !!options.allowRecurse;
    effect._isEffect = true;
    effect.active = true;
    effect.raw = fn;
    effect.deps = [];
    effect.options = options;
    return effect;
  }

  function cleanup(effect) {
    var deps = effect.deps;

    if (deps.length) {
      for (var i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
      }

      deps.length = 0;
    }
  }

  var shouldTrack = true;
  var trackStack = [];

  function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
  }

  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }

  function resetTracking() {
    var last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
  }

  function track(target, type, key) {
    if (!shouldTrack || activeEffect === undefined) {
      return;
    }

    var depsMap = targetMap.get(target);

    if (!depsMap) {
      targetMap.set(target, depsMap = new Map());
    }

    var dep = depsMap.get(key);

    if (!dep) {
      depsMap.set(key, dep = new Set());
    }

    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);

      if (process.env.NODE_ENV !== 'production' && activeEffect.options.onTrack) {
        activeEffect.options.onTrack({
          effect: activeEffect,
          target: target,
          type: type,
          key: key
        });
      }
    }
  }

  function trigger(target, type, key, newValue, oldValue, oldTarget) {
    var depsMap = targetMap.get(target);

    if (!depsMap) {
      // never been tracked
      return;
    }

    var effects = new Set();

    var add = function add(effectsToAdd) {
      if (effectsToAdd) {
        effectsToAdd.forEach(function (effect) {
          if (effect !== activeEffect || effect.allowRecurse) {
            effects.add(effect);
          }
        });
      }
    };

    if (type === "clear"
    /* CLEAR */
    ) {
        // collection being cleared
        // trigger all effects for target
        depsMap.forEach(add);
      } else if (key === 'length' && isArray(target)) {
      depsMap.forEach(function (dep, key) {
        if (key === 'length' || key >= newValue) {
          add(dep);
        }
      });
    } else {
      // schedule runs for SET | ADD | DELETE
      if (key !== void 0) {
        add(depsMap.get(key));
      } // also run for iteration key on ADD | DELETE | Map.SET


      switch (type) {
        case "add"
        /* ADD */
        :
          if (!isArray(target)) {
            add(depsMap.get(ITERATE_KEY));

            if (isMap(target)) {
              add(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isIntegerKey(key)) {
            // new index added to array -> length changes
            add(depsMap.get('length'));
          }

          break;

        case "delete"
        /* DELETE */
        :
          if (!isArray(target)) {
            add(depsMap.get(ITERATE_KEY));

            if (isMap(target)) {
              add(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }

          break;

        case "set"
        /* SET */
        :
          if (isMap(target)) {
            add(depsMap.get(ITERATE_KEY));
          }

          break;
      }
    }

    var run = function run(effect) {
      if (process.env.NODE_ENV !== 'production' && effect.options.onTrigger) {
        effect.options.onTrigger({
          effect: effect,
          target: target,
          key: key,
          type: type,
          newValue: newValue,
          oldValue: oldValue,
          oldTarget: oldTarget
        });
      }

      if (effect.options.scheduler) {
        effect.options.scheduler(effect);
      } else {
        effect();
      }
    };

    effects.forEach(run);
  }

  var builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol).map(function (key) {
    return Symbol[key];
  }).filter(isSymbol));
  var get = /*#__PURE__*/createGetter();
  var shallowGet = /*#__PURE__*/createGetter(false, true);
  var readonlyGet = /*#__PURE__*/createGetter(true);
  var shallowReadonlyGet = /*#__PURE__*/createGetter(true, true);
  var arrayInstrumentations = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(function (key) {
    var method = Array.prototype[key];

    arrayInstrumentations[key] = function () {
      var arr = toRaw(this);

      for (var i = 0, l = this.length; i < l; i++) {
        track(arr, "get"
        /* GET */
        , i + '');
      } // we run the method using the original args first (which may be reactive)


      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var res = method.apply(arr, args);

      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        return method.apply(arr, args.map(toRaw));
      } else {
        return res;
      }
    };
  });
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function (key) {
    var method = Array.prototype[key];

    arrayInstrumentations[key] = function () {
      pauseTracking();

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var res = method.apply(this, args);
      resetTracking();
      return res;
    };
  });

  function createGetter() {
    var isReadonly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var shallow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return function get(target, key, receiver) {
      if (key === "__v_isReactive"
      /* IS_REACTIVE */
      ) {
          return !isReadonly;
        } else if (key === "__v_isReadonly"
      /* IS_READONLY */
      ) {
          return isReadonly;
        } else if (key === "__v_raw"
      /* RAW */
      && receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)) {
        return target;
      }

      var targetIsArray = isArray(target);

      if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
        return Reflect.get(arrayInstrumentations, key, receiver);
      }

      var res = Reflect.get(target, key, receiver);

      if (isSymbol(key) ? builtInSymbols.has(key) : key === "__proto__" || key === "__v_isRef") {
        return res;
      }

      if (!isReadonly) {
        track(target, "get"
        /* GET */
        , key);
      }

      if (shallow) {
        return res;
      }

      if (isRef(res)) {
        // ref unwrapping - does not apply for Array + integer key.
        var shouldUnwrap = !targetIsArray || !isIntegerKey(key);
        return shouldUnwrap ? res.value : res;
      }

      if (isObject(res)) {
        // Convert returned value into a proxy as well. we do the isObject check
        // here to avoid invalid value warning. Also need to lazy access readonly
        // and reactive here to avoid circular dependency.
        return isReadonly ? readonly(res) : reactive(res);
      }

      return res;
    };
  }

  var set = /*#__PURE__*/createSetter();
  var shallowSet = /*#__PURE__*/createSetter(true);

  function createSetter() {
    var shallow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    return function set(target, key, value, receiver) {
      var oldValue = target[key];

      if (!shallow) {
        value = toRaw(value);

        if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
        }
      }

      var hadKey = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key);
      var result = Reflect.set(target, key, value, receiver); // don't trigger if target is something up in the prototype chain of original

      if (target === toRaw(receiver)) {
        if (!hadKey) {
          trigger(target, "add"
          /* ADD */
          , key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set"
          /* SET */
          , key, value, oldValue);
        }
      }

      return result;
    };
  }

  function deleteProperty(target, key) {
    var hadKey = hasOwn(target, key);
    var oldValue = target[key];
    var result = Reflect.deleteProperty(target, key);

    if (result && hadKey) {
      trigger(target, "delete"
      /* DELETE */
      , key, undefined, oldValue);
    }

    return result;
  }

  function has(target, key) {
    var result = Reflect.has(target, key);

    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has"
      /* HAS */
      , key);
    }

    return result;
  }

  function ownKeys$1(target) {
    track(target, "iterate"
    /* ITERATE */
    , isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
  }

  var mutableHandlers = {
    get: get,
    set: set,
    deleteProperty: deleteProperty,
    has: has,
    ownKeys: ownKeys$1
  };
  var readonlyHandlers = {
    get: readonlyGet,
    set: function set(target, key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Set operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
      }

      return true;
    },
    deleteProperty: function deleteProperty(target, key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Delete operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
      }

      return true;
    }
  };
  var shallowReactiveHandlers = extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
  }); // Props handlers are special in the sense that it should not unwrap top-level
  // refs (in order to allow refs to be explicitly passed down), but should
  // retain the reactivity of the normal readonly object.

  var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
  });

  var toReactive = function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
  };

  var toReadonly = function toReadonly(value) {
    return isObject(value) ? readonly(value) : value;
  };

  var toShallow = function toShallow(value) {
    return value;
  };

  var getProto = function getProto(v) {
    return Reflect.getPrototypeOf(v);
  };

  function get$1(target, key) {
    var isReadonly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var isShallow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw"
    /* RAW */
    ];
    var rawTarget = toRaw(target);
    var rawKey = toRaw(key);

    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "get"
      /* GET */
      , key);
    }

    !isReadonly && track(rawTarget, "get"
    /* GET */
    , rawKey);

    var _getProto = getProto(rawTarget),
        has = _getProto.has;

    var wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;

    if (has.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    }
  }

  function has$1(key) {
    var isReadonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var target = this["__v_raw"
    /* RAW */
    ];
    var rawTarget = toRaw(target);
    var rawKey = toRaw(key);

    if (key !== rawKey) {
      !isReadonly && track(rawTarget, "has"
      /* HAS */
      , key);
    }

    !isReadonly && track(rawTarget, "has"
    /* HAS */
    , rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }

  function size(target) {
    var isReadonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    target = target["__v_raw"
    /* RAW */
    ];
    !isReadonly && track(toRaw(target), "iterate"
    /* ITERATE */
    , ITERATE_KEY);
    return Reflect.get(target, 'size', target);
  }

  function add(value) {
    value = toRaw(value);
    var target = toRaw(this);
    var proto = getProto(target);
    var hadKey = proto.has.call(target, value);
    target.add(value);

    if (!hadKey) {
      trigger(target, "add"
      /* ADD */
      , value, value);
    }

    return this;
  }

  function set$1(key, value) {
    value = toRaw(value);
    var target = toRaw(this);

    var _getProto2 = getProto(target),
        has = _getProto2.has,
        get = _getProto2.get;

    var hadKey = has.call(target, key);

    if (!hadKey) {
      key = toRaw(key);
      hadKey = has.call(target, key);
    } else if (process.env.NODE_ENV !== 'production') {
      checkIdentityKeys(target, has, key);
    }

    var oldValue = get.call(target, key);
    target.set(key, value);

    if (!hadKey) {
      trigger(target, "add"
      /* ADD */
      , key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set"
      /* SET */
      , key, value, oldValue);
    }

    return this;
  }

  function deleteEntry(key) {
    var target = toRaw(this);

    var _getProto3 = getProto(target),
        has = _getProto3.has,
        get = _getProto3.get;

    var hadKey = has.call(target, key);

    if (!hadKey) {
      key = toRaw(key);
      hadKey = has.call(target, key);
    } else if (process.env.NODE_ENV !== 'production') {
      checkIdentityKeys(target, has, key);
    }

    var oldValue = get ? get.call(target, key) : undefined; // forward the operation before queueing reactions

    var result = target.delete(key);

    if (hadKey) {
      trigger(target, "delete"
      /* DELETE */
      , key, undefined, oldValue);
    }

    return result;
  }

  function clear() {
    var target = toRaw(this);
    var hadItems = target.size !== 0;
    var oldTarget = process.env.NODE_ENV !== 'production' ? isMap(target) ? new Map(target) : new Set(target) : undefined; // forward the operation before queueing reactions

    var result = target.clear();

    if (hadItems) {
      trigger(target, "clear"
      /* CLEAR */
      , undefined, undefined, oldTarget);
    }

    return result;
  }

  function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      var observed = this;
      var target = observed["__v_raw"
      /* RAW */
      ];
      var rawTarget = toRaw(target);
      var wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
      !isReadonly && track(rawTarget, "iterate"
      /* ITERATE */
      , ITERATE_KEY);
      return target.forEach(function (value, key) {
        // important: make sure the callback is
        // 1. invoked with the reactive map as `this` and 3rd arg
        // 2. the value received should be a corresponding reactive/readonly.
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }

  function createIterableMethod(method, isReadonly, isShallow) {
    return function () {
      var target = this["__v_raw"
      /* RAW */
      ];
      var rawTarget = toRaw(target);
      var targetIsMap = isMap(rawTarget);
      var isPair = method === 'entries' || method === Symbol.iterator && targetIsMap;
      var isKeyOnly = method === 'keys' && targetIsMap;
      var innerIterator = target[method].apply(target, arguments);
      var wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
      !isReadonly && track(rawTarget, "iterate"
      /* ITERATE */
      , isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY); // return a wrapped iterator which returns observed versions of the
      // values emitted from the real iterator

      return _defineProperty({
        // iterator protocol
        next: function next() {
          var _innerIterator$next = innerIterator.next(),
              value = _innerIterator$next.value,
              done = _innerIterator$next.done;

          return done ? {
            value: value,
            done: done
          } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done: done
          };
        }
      }, Symbol.iterator, function () {
        return this;
      });
    };
  }

  function createReadonlyMethod(type) {
    return function () {
      if (process.env.NODE_ENV !== 'production') {
        var key = (arguments.length <= 0 ? undefined : arguments[0]) ? "on key \"".concat(arguments.length <= 0 ? undefined : arguments[0], "\" ") : "";
        console.warn("".concat(capitalize(type), " operation ").concat(key, "failed: target is readonly."), toRaw(this));
      }

      return type === "delete"
      /* DELETE */
      ? false : this;
    };
  }

  var mutableInstrumentations = {
    get: function get(key) {
      return get$1(this, key);
    },

    get size() {
      return size(this);
    },

    has: has$1,
    add: add,
    set: set$1,
    delete: deleteEntry,
    clear: clear,
    forEach: createForEach(false, false)
  };
  var shallowInstrumentations = {
    get: function get(key) {
      return get$1(this, key, false, true);
    },

    get size() {
      return size(this);
    },

    has: has$1,
    add: add,
    set: set$1,
    delete: deleteEntry,
    clear: clear,
    forEach: createForEach(false, true)
  };
  var readonlyInstrumentations = {
    get: function get(key) {
      return get$1(this, key, true);
    },

    get size() {
      return size(this, true);
    },

    has: function has(key) {
      return has$1.call(this, key, true);
    },
    add: createReadonlyMethod("add"
    /* ADD */
    ),
    set: createReadonlyMethod("set"
    /* SET */
    ),
    delete: createReadonlyMethod("delete"
    /* DELETE */
    ),
    clear: createReadonlyMethod("clear"
    /* CLEAR */
    ),
    forEach: createForEach(true, false)
  };
  var iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
  iteratorMethods.forEach(function (method) {
    mutableInstrumentations[method] = createIterableMethod(method, false, false);
    readonlyInstrumentations[method] = createIterableMethod(method, true, false);
    shallowInstrumentations[method] = createIterableMethod(method, false, true);
  });

  function createInstrumentationGetter(isReadonly, shallow) {
    var instrumentations = shallow ? shallowInstrumentations : isReadonly ? readonlyInstrumentations : mutableInstrumentations;
    return function (target, key, receiver) {
      if (key === "__v_isReactive"
      /* IS_REACTIVE */
      ) {
          return !isReadonly;
        } else if (key === "__v_isReadonly"
      /* IS_READONLY */
      ) {
          return isReadonly;
        } else if (key === "__v_raw"
      /* RAW */
      ) {
          return target;
        }

      return Reflect.get(hasOwn(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }

  var mutableCollectionHandlers = {
    get: createInstrumentationGetter(false, false)
  };
  var readonlyCollectionHandlers = {
    get: createInstrumentationGetter(true, false)
  };

  function checkIdentityKeys(target, has, key) {
    var rawKey = toRaw(key);

    if (rawKey !== key && has.call(target, rawKey)) {
      var type = toRawType(target);
      console.warn("Reactive ".concat(type, " contains both the raw and reactive ") + "versions of the same object".concat(type === "Map" ? " as keys" : "", ", ") + "which can lead to inconsistencies. " + "Avoid differentiating between the raw and reactive versions " + "of an object and only use the reactive version if possible.");
    }
  }

  var reactiveMap = new WeakMap();
  var readonlyMap = new WeakMap();

  function targetTypeMap(rawType) {
    switch (rawType) {
      case 'Object':
      case 'Array':
        return 1
        /* COMMON */
        ;

      case 'Map':
      case 'Set':
      case 'WeakMap':
      case 'WeakSet':
        return 2
        /* COLLECTION */
        ;

      default:
        return 0
        /* INVALID */
        ;
    }
  }

  function getTargetType(value) {
    return value["__v_skip"
    /* SKIP */
    ] || !Object.isExtensible(value) ? 0
    /* INVALID */
    : targetTypeMap(toRawType(value));
  }

  function reactive(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (target && target["__v_isReadonly"
    /* IS_READONLY */
    ]) {
      return target;
    }

    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers);
  }
  /**
   * Creates a readonly copy of the original object. Note the returned copy is not
   * made reactive, but `readonly` can be called on an already reactive object.
   */


  function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers);
  }
  /**
   * Returns a reactive-copy of the original object, where only the root level
   * properties are readonly, and does NOT unwrap refs nor recursively convert
   * returned properties.
   * This is used for creating the props proxy object for stateful components.
   */


  function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, readonlyCollectionHandlers);
  }

  function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers) {
    if (!isObject(target)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("value cannot be made reactive: ".concat(String(target)));
      }

      return target;
    } // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object


    if (target["__v_raw"
    /* RAW */
    ] && !(isReadonly && target["__v_isReactive"
    /* IS_REACTIVE */
    ])) {
      return target;
    } // target already has corresponding Proxy


    var proxyMap = isReadonly ? readonlyMap : reactiveMap;
    var existingProxy = proxyMap.get(target);

    if (existingProxy) {
      return existingProxy;
    } // only a whitelist of value types can be observed.


    var targetType = getTargetType(target);

    if (targetType === 0
    /* INVALID */
    ) {
        return target;
      }

    var proxy = new Proxy(target, targetType === 2
    /* COLLECTION */
    ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }

  function isReactive(value) {
    if (isReadonly(value)) {
      return isReactive(value["__v_raw"
      /* RAW */
      ]);
    }

    return !!(value && value["__v_isReactive"
    /* IS_REACTIVE */
    ]);
  }

  function isReadonly(value) {
    return !!(value && value["__v_isReadonly"
    /* IS_READONLY */
    ]);
  }

  function isProxy(value) {
    return isReactive(value) || isReadonly(value);
  }

  function toRaw(observed) {
    return observed && toRaw(observed["__v_raw"
    /* RAW */
    ]) || observed;
  }

  function isRef(r) {
    return Boolean(r && r.__v_isRef === true);
  }

  var stack = [];

  function pushWarningContext(vnode) {
    stack.push(vnode);
  }

  function popWarningContext() {
    stack.pop();
  }

  function warn(msg) {
    // avoid props formatting or warn handler tracking deps that might be mutated
    // during patch, leading to infinite recursion.
    pauseTracking();
    var instance = stack.length ? stack[stack.length - 1].component : null;
    var appWarnHandler = instance && instance.appContext.config.warnHandler;
    var trace = getComponentTrace();

    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    if (appWarnHandler) {
      callWithErrorHandling(appWarnHandler, instance, 11
      /* APP_WARN_HANDLER */
      , [msg + args.join(''), instance && instance.proxy, trace.map(function (_ref2) {
        var vnode = _ref2.vnode;
        return "at <".concat(formatComponentName(instance, vnode.type), ">");
      }).join('\n'), trace]);
    } else {
      var _console;

      var warnArgs = ["[Vue warn]: ".concat(msg)].concat(args);
      /* istanbul ignore if */

      if (trace.length && // avoid spamming console during tests
      !false) {
        warnArgs.push.apply(warnArgs, ["\n"].concat(_toConsumableArray(formatTrace(trace))));
      }

      (_console = console).warn.apply(_console, _toConsumableArray(warnArgs));
    }

    resetTracking();
  }

  function getComponentTrace() {
    var currentVNode = stack[stack.length - 1];

    if (!currentVNode) {
      return [];
    } // we can't just use the stack because it will be incomplete during updates
    // that did not start from the root. Re-construct the parent chain using
    // instance parent pointers.


    var normalizedStack = [];

    while (currentVNode) {
      var last = normalizedStack[0];

      if (last && last.vnode === currentVNode) {
        last.recurseCount++;
      } else {
        normalizedStack.push({
          vnode: currentVNode,
          recurseCount: 0
        });
      }

      var parentInstance = currentVNode.component && currentVNode.component.parent;
      currentVNode = parentInstance && parentInstance.vnode;
    }

    return normalizedStack;
  }
  /* istanbul ignore next */


  function formatTrace(trace) {
    var logs = [];
    trace.forEach(function (entry, i) {
      logs.push.apply(logs, _toConsumableArray(i === 0 ? [] : ["\n"]).concat(_toConsumableArray(formatTraceEntry(entry))));
    });
    return logs;
  }

  function formatTraceEntry(_ref3) {
    var vnode = _ref3.vnode,
        recurseCount = _ref3.recurseCount;
    var postfix = recurseCount > 0 ? "... (".concat(recurseCount, " recursive calls)") : "";
    var isRoot = vnode.component ? vnode.component.parent == null : false;
    var open = " at <".concat(formatComponentName(vnode.component, vnode.type, isRoot));
    var close = ">" + postfix;
    return vnode.props ? [open].concat(_toConsumableArray(formatProps(vnode.props)), [close]) : [open + close];
  }
  /* istanbul ignore next */


  function formatProps(props) {
    var res = [];
    var keys = Object.keys(props);
    keys.slice(0, 3).forEach(function (key) {
      res.push.apply(res, _toConsumableArray(formatProp(key, props[key])));
    });

    if (keys.length > 3) {
      res.push(" ...");
    }

    return res;
  }
  /* istanbul ignore next */


  function formatProp(key, value, raw) {
    if (isString(value)) {
      value = JSON.stringify(value);
      return raw ? value : ["".concat(key, "=").concat(value)];
    } else if (typeof value === 'number' || typeof value === 'boolean' || value == null) {
      return raw ? value : ["".concat(key, "=").concat(value)];
    } else if (isRef(value)) {
      value = formatProp(key, toRaw(value.value), true);
      return raw ? value : ["".concat(key, "=Ref<"), value, ">"];
    } else if (isFunction(value)) {
      return ["".concat(key, "=fn").concat(value.name ? "<".concat(value.name, ">") : "")];
    } else {
      value = toRaw(value);
      return raw ? value : ["".concat(key, "="), value];
    }
  }

  var ErrorTypeStrings = (_ErrorTypeStrings = {}, _defineProperty(_ErrorTypeStrings, "bc"
  /* BEFORE_CREATE */
  , 'beforeCreate hook'), _defineProperty(_ErrorTypeStrings, "c"
  /* CREATED */
  , 'created hook'), _defineProperty(_ErrorTypeStrings, "bm"
  /* BEFORE_MOUNT */
  , 'beforeMount hook'), _defineProperty(_ErrorTypeStrings, "m"
  /* MOUNTED */
  , 'mounted hook'), _defineProperty(_ErrorTypeStrings, "bu"
  /* BEFORE_UPDATE */
  , 'beforeUpdate hook'), _defineProperty(_ErrorTypeStrings, "u"
  /* UPDATED */
  , 'updated'), _defineProperty(_ErrorTypeStrings, "bum"
  /* BEFORE_UNMOUNT */
  , 'beforeUnmount hook'), _defineProperty(_ErrorTypeStrings, "um"
  /* UNMOUNTED */
  , 'unmounted hook'), _defineProperty(_ErrorTypeStrings, "a"
  /* ACTIVATED */
  , 'activated hook'), _defineProperty(_ErrorTypeStrings, "da"
  /* DEACTIVATED */
  , 'deactivated hook'), _defineProperty(_ErrorTypeStrings, "ec"
  /* ERROR_CAPTURED */
  , 'errorCaptured hook'), _defineProperty(_ErrorTypeStrings, "rtc"
  /* RENDER_TRACKED */
  , 'renderTracked hook'), _defineProperty(_ErrorTypeStrings, "rtg"
  /* RENDER_TRIGGERED */
  , 'renderTriggered hook'), _defineProperty(_ErrorTypeStrings, 0
  /* SETUP_FUNCTION */
  , 'setup function'), _defineProperty(_ErrorTypeStrings, 1
  /* RENDER_FUNCTION */
  , 'render function'), _defineProperty(_ErrorTypeStrings, 2
  /* WATCH_GETTER */
  , 'watcher getter'), _defineProperty(_ErrorTypeStrings, 3
  /* WATCH_CALLBACK */
  , 'watcher callback'), _defineProperty(_ErrorTypeStrings, 4
  /* WATCH_CLEANUP */
  , 'watcher cleanup function'), _defineProperty(_ErrorTypeStrings, 5
  /* NATIVE_EVENT_HANDLER */
  , 'native event handler'), _defineProperty(_ErrorTypeStrings, 6
  /* COMPONENT_EVENT_HANDLER */
  , 'component event handler'), _defineProperty(_ErrorTypeStrings, 7
  /* VNODE_HOOK */
  , 'vnode hook'), _defineProperty(_ErrorTypeStrings, 8
  /* DIRECTIVE_HOOK */
  , 'directive hook'), _defineProperty(_ErrorTypeStrings, 9
  /* TRANSITION_HOOK */
  , 'transition hook'), _defineProperty(_ErrorTypeStrings, 10
  /* APP_ERROR_HANDLER */
  , 'app errorHandler'), _defineProperty(_ErrorTypeStrings, 11
  /* APP_WARN_HANDLER */
  , 'app warnHandler'), _defineProperty(_ErrorTypeStrings, 12
  /* FUNCTION_REF */
  , 'ref function'), _defineProperty(_ErrorTypeStrings, 13
  /* ASYNC_COMPONENT_LOADER */
  , 'async component loader'), _defineProperty(_ErrorTypeStrings, 14
  /* SCHEDULER */
  , 'scheduler flush. This is likely a Vue internals bug. ' + 'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-next'), _ErrorTypeStrings);

  function callWithErrorHandling(fn, instance, type, args) {
    var res;

    try {
      res = args ? fn.apply(void 0, _toConsumableArray(args)) : fn();
    } catch (err) {
      handleError(err, instance, type);
    }

    return res;
  }

  function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
      var res = callWithErrorHandling(fn, instance, type, args);

      if (res && isPromise(res)) {
        res.catch(function (err) {
          handleError(err, instance, type);
        });
      }

      return res;
    }

    var values = [];

    for (var i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }

    return values;
  }

  function handleError(err, instance, type) {
    var throwInDev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var contextVNode = instance ? instance.vnode : null;

    if (instance) {
      var cur = instance.parent; // the exposed instance is the render proxy to keep it consistent with 2.x

      var exposedInstance = instance.proxy; // in production the hook receives only the error code

      var errorInfo = process.env.NODE_ENV !== 'production' ? ErrorTypeStrings[type] : type;

      while (cur) {
        var errorCapturedHooks = cur.ec;

        if (errorCapturedHooks) {
          for (var i = 0; i < errorCapturedHooks.length; i++) {
            if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
              return;
            }
          }
        }

        cur = cur.parent;
      } // app-level handling


      var appErrorHandler = instance.appContext.config.errorHandler;

      if (appErrorHandler) {
        callWithErrorHandling(appErrorHandler, null, 10
        /* APP_ERROR_HANDLER */
        , [err, exposedInstance, errorInfo]);
        return;
      }
    }

    logError(err, type, contextVNode, throwInDev);
  }

  function logError(err, type, contextVNode) {
    var throwInDev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (process.env.NODE_ENV !== 'production') {
      var info = ErrorTypeStrings[type];

      if (contextVNode) {
        pushWarningContext(contextVNode);
      }

      warn("Unhandled error".concat(info ? " during execution of ".concat(info) : ""));

      if (contextVNode) {
        popWarningContext();
      } // crash in dev by default so it's more noticeable


      if (throwInDev) {
        throw err;
      } else {
        console.error(err);
      }
    } else {
      // recover in prod to reduce the impact on end-user
      console.error(err);
    }
  }

  var isFlushing = false;
  var isFlushPending = false;
  var queue = [];
  var flushIndex = 0;
  var pendingPreFlushCbs = [];
  var activePreFlushCbs = null;
  var preFlushIndex = 0;
  var pendingPostFlushCbs = [];
  var activePostFlushCbs = null;
  var postFlushIndex = 0;
  var resolvedPromise = Promise.resolve();
  var currentFlushPromise = null;
  var currentPreFlushParentJob = null;
  var RECURSION_LIMIT = 100;

  function nextTick(fn) {
    var p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
  }

  function queueJob(job) {
    // the dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if ((!queue.length || !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) && job !== currentPreFlushParentJob) {
      queue.push(job);
      queueFlush();
    }
  }

  function queueFlush() {
    if (!isFlushing && !isFlushPending) {
      isFlushPending = true;
      currentFlushPromise = resolvedPromise.then(flushJobs);
    }
  }

  function queueCb(cb, activeQueue, pendingQueue, index) {
    if (!isArray(cb)) {
      if (!activeQueue || !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
        pendingQueue.push(cb);
      }
    } else {
      // if cb is an array, it is a component lifecycle hook which can only be
      // triggered by a job, which is already deduped in the main queue, so
      // we can skip duplicate check here to improve perf
      pendingQueue.push.apply(pendingQueue, _toConsumableArray(cb));
    }

    queueFlush();
  }

  function queuePreFlushCb(cb) {
    queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
  }

  function queuePostFlushCb(cb) {
    queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
  }

  function flushPreFlushCbs(seen) {
    var parentJob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (pendingPreFlushCbs.length) {
      currentPreFlushParentJob = parentJob;
      activePreFlushCbs = _toConsumableArray(new Set(pendingPreFlushCbs));
      pendingPreFlushCbs.length = 0;

      if (process.env.NODE_ENV !== 'production') {
        seen = seen || new Map();
      }

      for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
        if (process.env.NODE_ENV !== 'production') {
          checkRecursiveUpdates(seen, activePreFlushCbs[preFlushIndex]);
        }

        activePreFlushCbs[preFlushIndex]();
      }

      activePreFlushCbs = null;
      preFlushIndex = 0;
      currentPreFlushParentJob = null; // recursively flush until it drains

      flushPreFlushCbs(seen, parentJob);
    }
  }

  function flushPostFlushCbs(seen) {
    if (pendingPostFlushCbs.length) {
      var deduped = _toConsumableArray(new Set(pendingPostFlushCbs));

      pendingPostFlushCbs.length = 0; // #1947 already has active queue, nested flushPostFlushCbs call

      if (activePostFlushCbs) {
        var _activePostFlushCbs;

        (_activePostFlushCbs = activePostFlushCbs).push.apply(_activePostFlushCbs, _toConsumableArray(deduped));

        return;
      }

      activePostFlushCbs = deduped;

      if (process.env.NODE_ENV !== 'production') {
        seen = seen || new Map();
      }

      activePostFlushCbs.sort(function (a, b) {
        return getId(a) - getId(b);
      });

      for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
        if (process.env.NODE_ENV !== 'production') {
          checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex]);
        }

        activePostFlushCbs[postFlushIndex]();
      }

      activePostFlushCbs = null;
      postFlushIndex = 0;
    }
  }

  var getId = function getId(job) {
    return job.id == null ? Infinity : job.id;
  };

  function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;

    if (process.env.NODE_ENV !== 'production') {
      seen = seen || new Map();
    }

    flushPreFlushCbs(seen); // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child so its render effect will have smaller
    //    priority number)
    // 2. If a component is unmounted during a parent component's update,
    //    its update can be skipped.

    queue.sort(function (a, b) {
      return getId(a) - getId(b);
    });

    try {
      for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
        var job = queue[flushIndex];

        if (job) {
          if (process.env.NODE_ENV !== 'production') {
            checkRecursiveUpdates(seen, job);
          }

          callWithErrorHandling(job, null, 14
          /* SCHEDULER */
          );
        }
      }
    } finally {
      flushIndex = 0;
      queue.length = 0;
      flushPostFlushCbs(seen);
      isFlushing = false;
      currentFlushPromise = null; // some postFlushCb queued jobs!
      // keep flushing until it drains.

      if (queue.length || pendingPostFlushCbs.length) {
        flushJobs(seen);
      }
    }
  }

  function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
      seen.set(fn, 1);
    } else {
      var count = seen.get(fn);

      if (count > RECURSION_LIMIT) {
        throw new Error("Maximum recursive updates exceeded. " + "This means you have a reactive effect that is mutating its own " + "dependencies and thus recursively triggering itself. Possible sources " + "include component template, render function, updated hook or " + "watcher source function.");
      } else {
        seen.set(fn, count + 1);
      }
    }
  }

  var hmrDirtyComponents = new Set(); // Expose the HMR runtime on the global object
  // This makes it entirely tree-shakable without polluting the exports and makes
  // it easier to be used in toolings like vue-loader
  // Note: for a component to be eligible for HMR it also needs the __hmrId option
  // to be set so that its instances can be registered / removed.

  if (process.env.NODE_ENV !== 'production') {
    var globalObject = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {};
    globalObject.__VUE_HMR_RUNTIME__ = {
      createRecord: tryWrap(createRecord),
      rerender: tryWrap(rerender),
      reload: tryWrap(reload)
    };
  }

  var map = new Map();

  function createRecord(id, component) {
    if (!component) {
      warn("HMR API usage is out of date.\n" + "Please upgrade vue-loader/vite/rollup-plugin-vue or other relevant " + "depdendency that handles Vue SFC compilation.");
      component = {};
    }

    if (map.has(id)) {
      return false;
    }

    map.set(id, {
      component: isClassComponent(component) ? component.__vccOpts : component,
      instances: new Set()
    });
    return true;
  }

  function rerender(id, newRender) {
    var record = map.get(id);
    if (!record) return;
    if (newRender) record.component.render = newRender; // Array.from creates a snapshot which avoids the set being mutated during
    // updates

    Array.from(record.instances).forEach(function (instance) {
      if (newRender) {
        instance.render = newRender;
      }

      instance.renderCache = [];
      instance.update();
    });
  }

  function reload(id, newComp) {
    var record = map.get(id);
    if (!record) return; // Array.from creates a snapshot which avoids the set being mutated during
    // updates

    var component = record.component,
        instances = record.instances;

    if (!hmrDirtyComponents.has(component)) {
      // 1. Update existing comp definition to match new one
      newComp = isClassComponent(newComp) ? newComp.__vccOpts : newComp;
      extend(component, newComp);

      for (var key in component) {
        if (!(key in newComp)) {
          delete component[key];
        }
      } // 2. Mark component dirty. This forces the renderer to replace the component
      // on patch.


      hmrDirtyComponents.add(component); // 3. Make sure to unmark the component after the reload.

      queuePostFlushCb(function () {
        hmrDirtyComponents.delete(component);
      });
    }

    Array.from(instances).forEach(function (instance) {
      if (instance.parent) {
        // 4. Force the parent instance to re-render. This will cause all updated
        // components to be unmounted and re-mounted. Queue the update so that we
        // don't end up forcing the same parent to re-render multiple times.
        queueJob(instance.parent.update);
      } else if (instance.appContext.reload) {
        // root instance mounted via createApp() has a reload method
        instance.appContext.reload();
      } else if (typeof window !== 'undefined') {
        // root instance inside tree created via raw render(). Force reload.
        window.location.reload();
      } else {
        console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
      }
    });
  }

  function tryWrap(fn) {
    return function (id, arg) {
      try {
        return fn(id, arg);
      } catch (e) {
        console.error(e);
        console.warn("[HMR] Something went wrong during Vue component hot-reload. " + "Full reload required.");
      }
    };
  }

  function setDevtoolsHook(hook) {}
  /**
   * mark the current rendering instance for asset resolution (e.g.
   * resolveComponent, resolveDirective) during render
   */


  var currentRenderingInstance = null;

  function setCurrentRenderingInstance(instance) {
    currentRenderingInstance = instance;
  }

  function markAttrsAccessed() {}

  function filterSingleRoot(children) {
    var singleRoot;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (isVNode(child)) {
        // ignore user comment
        if (child.type !== Comment || child.children === 'v-if') {
          if (singleRoot) {
            // has more than 1 non-comment child, return now
            return;
          } else {
            singleRoot = child;
          }
        }
      } else {
        return;
      }
    }

    return singleRoot;
  }

  var isSuspense = function isSuspense(type) {
    return type.__isSuspense;
  };

  function normalizeSuspenseChildren(vnode) {
    var shapeFlag = vnode.shapeFlag,
        children = vnode.children;
    var content;
    var fallback;

    if (shapeFlag & 32
    /* SLOTS_CHILDREN */
    ) {
        content = normalizeSuspenseSlot(children.default);
        fallback = normalizeSuspenseSlot(children.fallback);
      } else {
      content = normalizeSuspenseSlot(children);
      fallback = normalizeVNode(null);
    }

    return {
      content: content,
      fallback: fallback
    };
  }

  function normalizeSuspenseSlot(s) {
    if (isFunction(s)) {
      s = s();
    }

    if (isArray(s)) {
      var singleChild = filterSingleRoot(s);

      if (process.env.NODE_ENV !== 'production' && !singleChild) {
        warn("<Suspense> slots expect a single root node.");
      }

      s = singleChild;
    }

    return normalizeVNode(s);
  }

  function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
      if (isArray(fn)) {
        var _suspense$effects;

        (_suspense$effects = suspense.effects).push.apply(_suspense$effects, _toConsumableArray(fn));
      } else {
        suspense.effects.push(fn);
      }
    } else {
      queuePostFlushCb(fn);
    }
  }

  var isRenderingCompiledSlot = 0;

  var setCompiledSlotRendering = function setCompiledSlotRendering(n) {
    return isRenderingCompiledSlot += n;
  };
  /**
   * Wrap a slot function to memoize current rendering instance
   * @private
   */


  function withCtx(fn) {
    var ctx = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : currentRenderingInstance;
    if (!ctx) return fn;

    var renderFnWithContext = function renderFnWithContext() {
      // If a user calls a compiled slot inside a template expression (#1745), it
      // can mess up block tracking, so by default we need to push a null block to
      // avoid that. This isn't necessary if rendering a compiled `<slot>`.
      if (!isRenderingCompiledSlot) {
        openBlock(true
        /* null block that disables tracking */
        );
      }

      var owner = currentRenderingInstance;
      setCurrentRenderingInstance(ctx);
      var res = fn.apply(void 0, arguments);
      setCurrentRenderingInstance(owner);

      if (!isRenderingCompiledSlot) {
        closeBlock();
      }

      return res;
    };

    renderFnWithContext._c = true;
    return renderFnWithContext;
  } // SFC scoped style ID management.


  var currentScopeId = null;
  var scopeIdStack = [];
  /**
   * @private
   */

  function pushScopeId(id) {
    scopeIdStack.push(currentScopeId = id);
  }
  /**
   * @private
   */


  function popScopeId() {
    scopeIdStack.pop();
    currentScopeId = scopeIdStack[scopeIdStack.length - 1] || null;
  }
  /**
   * @private
   */


  function withScopeId(id) {
    return function (fn) {
      return withCtx(function () {
        pushScopeId(id);
        var res = fn.apply(this, arguments);
        popScopeId();
        return res;
      });
    };
  } // initial value for watchers to trigger on undefined initial values


  var INITIAL_WATCHER_VALUE = {};

  function doWatch(source, cb) {
    var _ref4 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EMPTY_OBJ,
        immediate = _ref4.immediate,
        deep = _ref4.deep,
        flush = _ref4.flush,
        onTrack = _ref4.onTrack,
        onTrigger = _ref4.onTrigger;

    var instance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : currentInstance;

    if (process.env.NODE_ENV !== 'production' && !cb) {
      if (immediate !== undefined) {
        warn("watch() \"immediate\" option is only respected when using the " + "watch(source, callback, options?) signature.");
      }

      if (deep !== undefined) {
        warn("watch() \"deep\" option is only respected when using the " + "watch(source, callback, options?) signature.");
      }
    }

    var warnInvalidSource = function warnInvalidSource(s) {
      warn("Invalid watch source: ", s, "A watch source can only be a getter/effect function, a ref, " + "a reactive object, or an array of these types.");
    };

    var getter;
    var forceTrigger = false;

    if (isRef(source)) {
      getter = function getter() {
        return source.value;
      };

      forceTrigger = !!source._shallow;
    } else if (isReactive(source)) {
      getter = function getter() {
        return source;
      };

      deep = true;
    } else if (isArray(source)) {
      getter = function getter() {
        return source.map(function (s) {
          if (isRef(s)) {
            return s.value;
          } else if (isReactive(s)) {
            return traverse(s);
          } else if (isFunction(s)) {
            return callWithErrorHandling(s, instance, 2
            /* WATCH_GETTER */
            );
          } else {
            process.env.NODE_ENV !== 'production' && warnInvalidSource(s);
          }
        });
      };
    } else if (isFunction(source)) {
      if (cb) {
        // getter with cb
        getter = function getter() {
          return callWithErrorHandling(source, instance, 2
          /* WATCH_GETTER */
          );
        };
      } else {
        // no cb -> simple effect
        getter = function getter() {
          if (instance && instance.isUnmounted) {
            return;
          }

          if (cleanup) {
            cleanup();
          }

          return callWithErrorHandling(source, instance, 3
          /* WATCH_CALLBACK */
          , [onInvalidate]);
        };
      }
    } else {
      getter = NOOP;
      process.env.NODE_ENV !== 'production' && warnInvalidSource(source);
    }

    if (cb && deep) {
      var baseGetter = getter;

      getter = function getter() {
        return traverse(baseGetter());
      };
    }

    var cleanup;

    var onInvalidate = function onInvalidate(fn) {
      cleanup = runner.options.onStop = function () {
        callWithErrorHandling(fn, instance, 4
        /* WATCH_CLEANUP */
        );
      };
    };

    var oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE;

    var job = function job() {
      if (!runner.active) {
        return;
      }

      if (cb) {
        // watch(source, cb)
        var newValue = runner();

        if (deep || forceTrigger || hasChanged(newValue, oldValue)) {
          // cleanup before running cb again
          if (cleanup) {
            cleanup();
          }

          callWithAsyncErrorHandling(cb, instance, 3
          /* WATCH_CALLBACK */
          , [newValue, // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue, onInvalidate]);
          oldValue = newValue;
        }
      } else {
        // watchEffect
        runner();
      }
    }; // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)


    job.allowRecurse = !!cb;
    var scheduler;

    if (flush === 'sync') {
      scheduler = job;
    } else if (flush === 'post') {
      scheduler = function scheduler() {
        return queuePostRenderEffect(job, instance && instance.suspense);
      };
    } else {
      // default: 'pre'
      scheduler = function scheduler() {
        if (!instance || instance.isMounted) {
          queuePreFlushCb(job);
        } else {
          // with 'pre' option, the first call must happen before
          // the component is mounted so it is called synchronously.
          job();
        }
      };
    }

    var runner = effect(getter, {
      lazy: true,
      onTrack: onTrack,
      onTrigger: onTrigger,
      scheduler: scheduler
    });
    recordInstanceBoundEffect(runner, instance); // initial run

    if (cb) {
      if (immediate) {
        job();
      } else {
        oldValue = runner();
      }
    } else if (flush === 'post') {
      queuePostRenderEffect(runner, instance && instance.suspense);
    } else {
      runner();
    }

    return function () {
      stop(runner);

      if (instance) {
        remove(instance.effects, runner);
      }
    };
  } // this.$watch


  function instanceWatch(source, cb, options) {
    var publicThis = this.proxy;
    var getter = isString(source) ? function () {
      return publicThis[source];
    } : source.bind(publicThis);
    return doWatch(getter, cb.bind(publicThis), options, this);
  }

  function traverse(value) {
    var seen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

    if (!isObject(value) || seen.has(value)) {
      return value;
    }

    seen.add(value);

    if (isRef(value)) {
      traverse(value.value, seen);
    } else if (isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        traverse(value[i], seen);
      }
    } else if (isSet(value) || isMap(value)) {
      value.forEach(function (v) {
        traverse(v, seen);
      });
    } else {
      for (var key in value) {
        traverse(value[key], seen);
      }
    }

    return value;
  }

  var queuePostRenderEffect = queueEffectWithSuspense;

  var isTeleport = function isTeleport(type) {
    return type.__isTeleport;
  };

  var NULL_DYNAMIC_COMPONENT = Symbol();
  var Fragment = Symbol(process.env.NODE_ENV !== 'production' ? 'Fragment' : undefined);
  var Text = Symbol(process.env.NODE_ENV !== 'production' ? 'Text' : undefined);
  var Comment = Symbol(process.env.NODE_ENV !== 'production' ? 'Comment' : undefined);
  var Static = Symbol(process.env.NODE_ENV !== 'production' ? 'Static' : undefined); // Since v-if and v-for are the two possible ways node structure can dynamically
  // change, once we consider v-if branches and each v-for fragment a block, we
  // can divide a template into nested blocks, and within each block the node
  // structure would be stable. This allows us to skip most children diffing
  // and only worry about the dynamic nodes (indicated by patch flags).

  var blockStack = [];
  var currentBlock = null;
  /**
   * Open a block.
   * This must be called before `createBlock`. It cannot be part of `createBlock`
   * because the children of the block are evaluated before `createBlock` itself
   * is called. The generated code typically looks like this:
   *
   * ```js
   * function render() {
   *   return (openBlock(),createBlock('div', null, [...]))
   * }
   * ```
   * disableTracking is true when creating a v-for fragment block, since a v-for
   * fragment always diffs its children.
   *
   * @private
   */

  function openBlock() {
    var disableTracking = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    blockStack.push(currentBlock = disableTracking ? null : []);
  }

  function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
  }
  /**
   * Create a block root vnode. Takes the same exact arguments as `createVNode`.
   * A block root keeps track of dynamic nodes within the block in the
   * `dynamicChildren` array.
   *
   * @private
   */


  function createBlock(type, props, children, patchFlag, dynamicProps) {
    var vnode = createVNode(type, props, children, patchFlag, dynamicProps, true
    /* isBlock: prevent a block from tracking itself */
    ); // save current block children on the block vnode

    vnode.dynamicChildren = currentBlock || EMPTY_ARR; // close block

    closeBlock(); // a block is always going to be patched, so track it as a child of its
    // parent block

    if (currentBlock) {
      currentBlock.push(vnode);
    }

    return vnode;
  }

  function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
  }

  var createVNodeWithArgsTransform = function createVNodeWithArgsTransform() {
    return _createVNode.apply(void 0, arguments);
  };

  var InternalObjectKey = "__vInternal";

  var normalizeKey = function normalizeKey(_ref5) {
    var key = _ref5.key;
    return key != null ? key : null;
  };

  var normalizeRef = function normalizeRef(_ref6) {
    var ref = _ref6.ref;
    return ref != null ? isString(ref) || isRef(ref) || isFunction(ref) ? {
      i: currentRenderingInstance,
      r: ref
    } : ref : null;
  };

  var createVNode = process.env.NODE_ENV !== 'production' ? createVNodeWithArgsTransform : _createVNode;

  function _createVNode(type) {
    var _vnode;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var patchFlag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var dynamicProps = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var isBlockNode = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    if (!type || type === NULL_DYNAMIC_COMPONENT) {
      if (process.env.NODE_ENV !== 'production' && !type) {
        warn("Invalid vnode type when creating vnode: ".concat(type, "."));
      }

      type = Comment;
    }

    if (isVNode(type)) {
      // createVNode receiving an existing vnode. This happens in cases like
      // <component :is="vnode"/>
      // #2078 make sure to merge refs during the clone instead of overwriting it
      var cloned = cloneVNode(type, props, true
      /* mergeRef: true */
      );

      if (children) {
        normalizeChildren(cloned, children);
      }

      return cloned;
    } // class component normalization.


    if (isClassComponent(type)) {
      type = type.__vccOpts;
    } // class & style normalization.


    if (props) {
      // for reactive or proxy objects, we need to clone it to enable mutation.
      if (isProxy(props) || InternalObjectKey in props) {
        props = extend({}, props);
      }

      var _props = props,
          klass = _props.class,
          style = _props.style;

      if (klass && !isString(klass)) {
        props.class = normalizeClass(klass);
      }

      if (isObject(style)) {
        // reactive state objects need to be cloned since they are likely to be
        // mutated
        if (isProxy(style) && !isArray(style)) {
          style = extend({}, style);
        }

        props.style = normalizeStyle(style);
      }
    } // encode the vnode type information into a bitmap


    var shapeFlag = isString(type) ? 1
    /* ELEMENT */
    : isSuspense(type) ? 128
    /* SUSPENSE */
    : isTeleport(type) ? 64
    /* TELEPORT */
    : isObject(type) ? 4
    /* STATEFUL_COMPONENT */
    : isFunction(type) ? 2
    /* FUNCTIONAL_COMPONENT */
    : 0;

    if (process.env.NODE_ENV !== 'production' && shapeFlag & 4
    /* STATEFUL_COMPONENT */
    && isProxy(type)) {
      type = toRaw(type);
      warn("Vue received a Component which was made a reactive object. This can " + "lead to unnecessary performance overhead, and should be avoided by " + "marking the component with `markRaw` or using `shallowRef` " + "instead of `ref`.", "\nComponent that was made reactive: ", type);
    }

    var vnode = (_vnode = {
      __v_isVNode: true
    }, _defineProperty(_vnode, "__v_skip"
    /* SKIP */
    , true), _defineProperty(_vnode, "type", type), _defineProperty(_vnode, "props", props), _defineProperty(_vnode, "key", props && normalizeKey(props)), _defineProperty(_vnode, "ref", props && normalizeRef(props)), _defineProperty(_vnode, "scopeId", currentScopeId), _defineProperty(_vnode, "children", null), _defineProperty(_vnode, "component", null), _defineProperty(_vnode, "suspense", null), _defineProperty(_vnode, "ssContent", null), _defineProperty(_vnode, "ssFallback", null), _defineProperty(_vnode, "dirs", null), _defineProperty(_vnode, "transition", null), _defineProperty(_vnode, "el", null), _defineProperty(_vnode, "anchor", null), _defineProperty(_vnode, "target", null), _defineProperty(_vnode, "targetAnchor", null), _defineProperty(_vnode, "staticCount", 0), _defineProperty(_vnode, "shapeFlag", shapeFlag), _defineProperty(_vnode, "patchFlag", patchFlag), _defineProperty(_vnode, "dynamicProps", dynamicProps), _defineProperty(_vnode, "dynamicChildren", null), _defineProperty(_vnode, "appContext", null), _vnode); // validate key

    if (process.env.NODE_ENV !== 'production' && vnode.key !== vnode.key) {
      warn("VNode created with invalid key (NaN). VNode type:", vnode.type);
    }

    normalizeChildren(vnode, children); // normalize suspense children

    if (shapeFlag & 128
    /* SUSPENSE */
    ) {
        var _normalizeSuspenseChi = normalizeSuspenseChildren(vnode),
            content = _normalizeSuspenseChi.content,
            fallback = _normalizeSuspenseChi.fallback;

        vnode.ssContent = content;
        vnode.ssFallback = fallback;
      }

    if ( // avoid a block node from tracking itself
    !isBlockNode && // has current parent block
    currentBlock && ( // presence of a patch flag indicates this node needs patching on updates.
    // component nodes also should always be patched, because even if the
    // component doesn't need to update, it needs to persist the instance on to
    // the next vnode so that it can be properly unmounted later.
    patchFlag > 0 || shapeFlag & 6
    /* COMPONENT */
    ) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    patchFlag !== 32
    /* HYDRATE_EVENTS */
    ) {
        currentBlock.push(vnode);
      }

    return vnode;
  }

  function cloneVNode(vnode, extraProps) {
    var _ref7;

    var mergeRef = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    // This is intentionally NOT using spread or extend to avoid the runtime
    // key enumeration cost.
    var props = vnode.props,
        ref = vnode.ref,
        patchFlag = vnode.patchFlag;
    var mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    return _ref7 = {
      __v_isVNode: true
    }, _defineProperty(_ref7, "__v_skip"
    /* SKIP */
    , true), _defineProperty(_ref7, "type", vnode.type), _defineProperty(_ref7, "props", mergedProps), _defineProperty(_ref7, "key", mergedProps && normalizeKey(mergedProps)), _defineProperty(_ref7, "ref", extraProps && extraProps.ref ? // #2078 in the case of <component :is="vnode" ref="extra"/>
    // if the vnode itself already has a ref, cloneVNode will need to merge
    // the refs so the single vnode can be set on multiple refs
    mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps) : ref), _defineProperty(_ref7, "scopeId", vnode.scopeId), _defineProperty(_ref7, "children", vnode.children), _defineProperty(_ref7, "target", vnode.target), _defineProperty(_ref7, "targetAnchor", vnode.targetAnchor), _defineProperty(_ref7, "staticCount", vnode.staticCount), _defineProperty(_ref7, "shapeFlag", vnode.shapeFlag), _defineProperty(_ref7, "patchFlag", extraProps && vnode.type !== Fragment ? patchFlag === -1 // hoisted node
    ? 16
    /* FULL_PROPS */
    : patchFlag | 16
    /* FULL_PROPS */
    : patchFlag), _defineProperty(_ref7, "dynamicProps", vnode.dynamicProps), _defineProperty(_ref7, "dynamicChildren", vnode.dynamicChildren), _defineProperty(_ref7, "appContext", vnode.appContext), _defineProperty(_ref7, "dirs", vnode.dirs), _defineProperty(_ref7, "transition", vnode.transition), _defineProperty(_ref7, "component", vnode.component), _defineProperty(_ref7, "suspense", vnode.suspense), _defineProperty(_ref7, "ssContent", vnode.ssContent && cloneVNode(vnode.ssContent)), _defineProperty(_ref7, "ssFallback", vnode.ssFallback && cloneVNode(vnode.ssFallback)), _defineProperty(_ref7, "el", vnode.el), _defineProperty(_ref7, "anchor", vnode.anchor), _ref7;
  }
  /**
   * @private
   */


  function createTextVNode() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ' ';
    var flag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return createVNode(Text, null, text, flag);
  }

  function normalizeVNode(child) {
    if (child == null || typeof child === 'boolean') {
      // empty placeholder
      return createVNode(Comment);
    } else if (isArray(child)) {
      // fragment
      return createVNode(Fragment, null, child);
    } else if (_typeof(child) === 'object') {
      // already vnode, this should be the most common since compiled templates
      // always produce all-vnode children arrays
      return child.el === null ? child : cloneVNode(child);
    } else {
      // strings and numbers
      return createVNode(Text, null, String(child));
    }
  }

  function normalizeChildren(vnode, children) {
    var type = 0;
    var shapeFlag = vnode.shapeFlag;

    if (children == null) {
      children = null;
    } else if (isArray(children)) {
      type = 16
      /* ARRAY_CHILDREN */
      ;
    } else if (_typeof(children) === 'object') {
      if (shapeFlag & 1
      /* ELEMENT */
      || shapeFlag & 64
      /* TELEPORT */
      ) {
          // Normalize slot to plain children for plain element and Teleport
          var slot = children.default;

          if (slot) {
            // _c marker is added by withCtx() indicating this is a compiled slot
            slot._c && setCompiledSlotRendering(1);
            normalizeChildren(vnode, slot());
            slot._c && setCompiledSlotRendering(-1);
          }

          return;
        } else {
        type = 32
        /* SLOTS_CHILDREN */
        ;
        var slotFlag = children._;

        if (!slotFlag && !(InternalObjectKey in children)) {
          children._ctx = currentRenderingInstance;
        } else if (slotFlag === 3
        /* FORWARDED */
        && currentRenderingInstance) {
          // a child component receives forwarded slots from the parent.
          // its slot type is determined by its parent's slot type.
          if (currentRenderingInstance.vnode.patchFlag & 1024
          /* DYNAMIC_SLOTS */
          ) {
              children._ = 2
              /* DYNAMIC */
              ;
              vnode.patchFlag |= 1024
              /* DYNAMIC_SLOTS */
              ;
            } else {
            children._ = 1
            /* STABLE */
            ;
          }
        }
      }
    } else if (isFunction(children)) {
      children = {
        default: children,
        _ctx: currentRenderingInstance
      };
      type = 32
      /* SLOTS_CHILDREN */
      ;
    } else {
      children = String(children); // force teleport children to array so it can be moved around

      if (shapeFlag & 64
      /* TELEPORT */
      ) {
          type = 16
          /* ARRAY_CHILDREN */
          ;
          children = [createTextVNode(children)];
        } else {
        type = 8
        /* TEXT_CHILDREN */
        ;
      }
    }

    vnode.children = children;
    vnode.shapeFlag |= type;
  }

  function mergeProps() {
    var ret = extend({}, arguments.length <= 0 ? undefined : arguments[0]);

    for (var i = 1; i < arguments.length; i++) {
      var toMerge = i < 0 || arguments.length <= i ? undefined : arguments[i];

      for (var key in toMerge) {
        if (key === 'class') {
          if (ret.class !== toMerge.class) {
            ret.class = normalizeClass([ret.class, toMerge.class]);
          }
        } else if (key === 'style') {
          ret.style = normalizeStyle([ret.style, toMerge.style]);
        } else if (isOn(key)) {
          var existing = ret[key];
          var incoming = toMerge[key];

          if (existing !== incoming) {
            ret[key] = existing ? [].concat(existing, toMerge[key]) : incoming;
          }
        } else if (key !== '') {
          ret[key] = toMerge[key];
        }
      }
    }

    return ret;
  }

  var isInBeforeCreate = false;

  function resolveMergedOptions(instance) {
    var raw = instance.type;
    var __merged = raw.__merged,
        mixins = raw.mixins,
        extendsOptions = raw.extends;
    if (__merged) return __merged;
    var globalMixins = instance.appContext.mixins;
    if (!globalMixins.length && !mixins && !extendsOptions) return raw;
    var options = {};
    globalMixins.forEach(function (m) {
      return mergeOptions(options, m, instance);
    });
    mergeOptions(options, raw, instance);
    return raw.__merged = options;
  }

  function mergeOptions(to, from, instance) {
    var strats = instance.appContext.config.optionMergeStrategies;
    var mixins = from.mixins,
        extendsOptions = from.extends;
    extendsOptions && mergeOptions(to, extendsOptions, instance);
    mixins && mixins.forEach(function (m) {
      return mergeOptions(to, m, instance);
    });

    for (var key in from) {
      if (strats && hasOwn(strats, key)) {
        to[key] = strats[key](to[key], from[key], instance.proxy, key);
      } else {
        to[key] = from[key];
      }
    }
  }
  /**
   * #2437 In Vue 3, functional components do not have a public instance proxy but
   * they exist in the internal parent chain. For code that relies on traversing
   * public $parent chains, skip functional ones and go to the parent instead.
   */


  var getPublicInstance = function getPublicInstance(i) {
    return i && (i.proxy ? i.proxy : getPublicInstance(i.parent));
  };

  var publicPropertiesMap = extend(Object.create(null), {
    $: function $(i) {
      return i;
    },
    $el: function $el(i) {
      return i.vnode.el;
    },
    $data: function $data(i) {
      return i.data;
    },
    $props: function $props(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly(i.props) : i.props;
    },
    $attrs: function $attrs(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly(i.attrs) : i.attrs;
    },
    $slots: function $slots(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly(i.slots) : i.slots;
    },
    $refs: function $refs(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly(i.refs) : i.refs;
    },
    $parent: function $parent(i) {
      return getPublicInstance(i.parent);
    },
    $root: function $root(i) {
      return i.root && i.root.proxy;
    },
    $emit: function $emit(i) {
      return i.emit;
    },
    $options: function $options(i) {
      return __VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type;
    },
    $forceUpdate: function $forceUpdate(i) {
      return function () {
        return queueJob(i.update);
      };
    },
    $nextTick: function $nextTick(i) {
      return nextTick.bind(i.proxy);
    },
    $watch: function $watch(i) {
      return __VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP;
    }
  });
  var PublicInstanceProxyHandlers = {
    get: function get(_ref8, key) {
      var instance = _ref8._;
      var ctx = instance.ctx,
          setupState = instance.setupState,
          data = instance.data,
          props = instance.props,
          accessCache = instance.accessCache,
          type = instance.type,
          appContext = instance.appContext; // let @vue/reactivity know it should never observe Vue public instances.

      if (key === "__v_skip"
      /* SKIP */
      ) {
          return true;
        } // for internal formatters to know that this is a Vue instance


      if (process.env.NODE_ENV !== 'production' && key === '__isVue') {
        return true;
      } // data / props / ctx
      // This getter gets called for every property access on the render context
      // during render and is a major hotspot. The most expensive part of this
      // is the multiple hasOwn() calls. It's much faster to do a simple property
      // access on a plain object, so we use an accessCache object (with null
      // prototype) to memoize what access type a key corresponds to.


      var normalizedProps;

      if (key[0] !== '$') {
        var n = accessCache[key];

        if (n !== undefined) {
          switch (n) {
            case 0
            /* SETUP */
            :
              return setupState[key];

            case 1
            /* DATA */
            :
              return data[key];

            case 3
            /* CONTEXT */
            :
              return ctx[key];

            case 2
            /* PROPS */
            :
              return props[key];
            // default: just fallthrough
          }
        } else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
          accessCache[key] = 0
          /* SETUP */
          ;
          return setupState[key];
        } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
          accessCache[key] = 1
          /* DATA */
          ;
          return data[key];
        } else if ( // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn(normalizedProps, key)) {
          accessCache[key] = 2
          /* PROPS */
          ;
          return props[key];
        } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
          accessCache[key] = 3
          /* CONTEXT */
          ;
          return ctx[key];
        } else if (!__VUE_OPTIONS_API__ || !isInBeforeCreate) {
          accessCache[key] = 4
          /* OTHER */
          ;
        }
      }

      var publicGetter = publicPropertiesMap[key];
      var cssModule, globalProperties; // public $xxx properties

      if (publicGetter) {
        if (key === '$attrs') {
          track(instance, "get"
          /* GET */
          , key);
          process.env.NODE_ENV !== 'production' && markAttrsAccessed();
        }

        return publicGetter(instance);
      } else if ( // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
        return cssModule;
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        // user may set custom properties to `this` that start with `$`
        accessCache[key] = 3
        /* CONTEXT */
        ;
        return ctx[key];
      } else if ( // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)) {
        return globalProperties[key];
      } else if (process.env.NODE_ENV !== 'production' && currentRenderingInstance && (!isString(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
      // to infinite warning loop
      key.indexOf('__v') !== 0)) {
        if (data !== EMPTY_OBJ && (key[0] === '$' || key[0] === '_') && hasOwn(data, key)) {
          warn("Property ".concat(JSON.stringify(key), " must be accessed via $data because it starts with a reserved ") + "character (\"$\" or \"_\") and is not proxied on the render context.");
        } else {
          warn("Property ".concat(JSON.stringify(key), " was accessed during render ") + "but is not defined on instance.");
        }
      }
    },
    set: function set(_ref9, key, value) {
      var instance = _ref9._;
      var data = instance.data,
          setupState = instance.setupState,
          ctx = instance.ctx;

      if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
        setupState[key] = value;
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        data[key] = value;
      } else if (key in instance.props) {
        process.env.NODE_ENV !== 'production' && warn("Attempting to mutate prop \"".concat(key, "\". Props are readonly."), instance);
        return false;
      }

      if (key[0] === '$' && key.slice(1) in instance) {
        process.env.NODE_ENV !== 'production' && warn("Attempting to mutate public property \"".concat(key, "\". ") + "Properties starting with $ are reserved and readonly.", instance);
        return false;
      } else {
        if (process.env.NODE_ENV !== 'production' && key in instance.appContext.config.globalProperties) {
          Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            value: value
          });
        } else {
          ctx[key] = value;
        }
      }

      return true;
    },
    has: function has(_ref10, key) {
      var _ref10$_ = _ref10._,
          data = _ref10$_.data,
          setupState = _ref10$_.setupState,
          accessCache = _ref10$_.accessCache,
          ctx = _ref10$_.ctx,
          appContext = _ref10$_.appContext,
          propsOptions = _ref10$_.propsOptions;
      var normalizedProps;
      return accessCache[key] !== undefined || data !== EMPTY_OBJ && hasOwn(data, key) || setupState !== EMPTY_OBJ && hasOwn(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key);
    }
  };

  if (process.env.NODE_ENV !== 'production' && !false) {
    PublicInstanceProxyHandlers.ownKeys = function (target) {
      warn("Avoid app logic that relies on enumerating keys on a component instance. " + "The keys will be empty in production mode to avoid performance overhead.");
      return Reflect.ownKeys(target);
    };
  }

  var RuntimeCompiledPublicInstanceProxyHandlers = extend({}, PublicInstanceProxyHandlers, {
    get: function get(target, key) {
      // fast path for unscopables when using `with` block
      if (key === Symbol.unscopables) {
        return;
      }

      return PublicInstanceProxyHandlers.get(target, key, target);
    },
    has: function has(_, key) {
      var has = key[0] !== '_' && !isGloballyWhitelisted(key);

      if (process.env.NODE_ENV !== 'production' && !has && PublicInstanceProxyHandlers.has(_, key)) {
        warn("Property ".concat(JSON.stringify(key), " should not start with _ which is a reserved prefix for Vue internals."));
      }

      return has;
    }
  });
  var currentInstance = null; // record effects created during a component's setup() so that they can be
  // stopped when the component unmounts

  function recordInstanceBoundEffect(effect) {
    var instance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : currentInstance;

    if (instance) {
      (instance.effects || (instance.effects = [])).push(effect);
    }
  }

  var classifyRE = /(?:^|[-_])(\w)/g;

  var classify = function classify(str) {
    return str.replace(classifyRE, function (c) {
      return c.toUpperCase();
    }).replace(/[-_]/g, '');
  };
  /* istanbul ignore next */


  function formatComponentName(instance, Component) {
    var isRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var name = isFunction(Component) ? Component.displayName || Component.name : Component.name;

    if (!name && Component.__file) {
      var match = Component.__file.match(/([^/\\]+)\.\w+$/);

      if (match) {
        name = match[1];
      }
    }

    if (!name && instance && instance.parent) {
      // try to infer the name based on reverse resolution
      var inferFromRegistry = function inferFromRegistry(registry) {
        for (var key in registry) {
          if (registry[key] === Component) {
            return key;
          }
        }
      };

      name = inferFromRegistry(instance.components || instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }

    return name ? classify(name) : isRoot ? "App" : "Anonymous";
  }

  function isClassComponent(value) {
    return isFunction(value) && '__vccOpts' in value;
  }

  var ssrContextKey = Symbol(process.env.NODE_ENV !== 'production' ? "ssrContext" : "");

  function initCustomFormatter() {
    /* eslint-disable no-restricted-globals */
    if (!(process.env.NODE_ENV !== 'production') || typeof window === 'undefined') {
      return;
    }

    var vueStyle = {
      style: 'color:#3ba776'
    };
    var numberStyle = {
      style: 'color:#0b1bc9'
    };
    var stringStyle = {
      style: 'color:#b62e24'
    };
    var keywordStyle = {
      style: 'color:#9d288c'
    }; // custom formatter for Chrome
    // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html

    var formatter = {
      header: function header(obj) {
        // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
        if (!isObject(obj)) {
          return null;
        }

        if (obj.__isVue) {
          return ['div', vueStyle, "VueInstance"];
        } else if (isRef(obj)) {
          return ['div', {}, ['span', vueStyle, genRefFlag(obj)], '<', formatValue(obj.value), ">"];
        } else if (isReactive(obj)) {
          return ['div', {}, ['span', vueStyle, 'Reactive'], '<', formatValue(obj), ">".concat(isReadonly(obj) ? " (readonly)" : "")];
        } else if (isReadonly(obj)) {
          return ['div', {}, ['span', vueStyle, 'Readonly'], '<', formatValue(obj), '>'];
        }

        return null;
      },
      hasBody: function hasBody(obj) {
        return obj && obj.__isVue;
      },
      body: function body(obj) {
        if (obj && obj.__isVue) {
          return ['div', {}].concat(_toConsumableArray(formatInstance(obj.$)));
        }
      }
    };

    function formatInstance(instance) {
      var blocks = [];

      if (instance.type.props && instance.props) {
        blocks.push(createInstanceBlock('props', toRaw(instance.props)));
      }

      if (instance.setupState !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock('setup', instance.setupState));
      }

      if (instance.data !== EMPTY_OBJ) {
        blocks.push(createInstanceBlock('data', toRaw(instance.data)));
      }

      var computed = extractKeys(instance, 'computed');

      if (computed) {
        blocks.push(createInstanceBlock('computed', computed));
      }

      var injected = extractKeys(instance, 'inject');

      if (injected) {
        blocks.push(createInstanceBlock('injected', injected));
      }

      blocks.push(['div', {}, ['span', {
        style: keywordStyle.style + ';opacity:0.66'
      }, '$ (internal): '], ['object', {
        object: instance
      }]]);
      return blocks;
    }

    function createInstanceBlock(type, target) {
      target = extend({}, target);

      if (!Object.keys(target).length) {
        return ['span', {}];
      }

      return ['div', {
        style: 'line-height:1.25em;margin-bottom:0.6em'
      }, ['div', {
        style: 'color:#476582'
      }, type], ['div', {
        style: 'padding-left:1.25em'
      }].concat(_toConsumableArray(Object.keys(target).map(function (key) {
        return ['div', {}, ['span', keywordStyle, key + ': '], formatValue(target[key], false)];
      })))];
    }

    function formatValue(v) {
      var asRaw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (typeof v === 'number') {
        return ['span', numberStyle, v];
      } else if (typeof v === 'string') {
        return ['span', stringStyle, JSON.stringify(v)];
      } else if (typeof v === 'boolean') {
        return ['span', keywordStyle, v];
      } else if (isObject(v)) {
        return ['object', {
          object: asRaw ? toRaw(v) : v
        }];
      } else {
        return ['span', stringStyle, String(v)];
      }
    }

    function extractKeys(instance, type) {
      var Comp = instance.type;

      if (isFunction(Comp)) {
        return;
      }

      var extracted = {};

      for (var key in instance.ctx) {
        if (isKeyOfType(Comp, key, type)) {
          extracted[key] = instance.ctx[key];
        }
      }

      return extracted;
    }

    function isKeyOfType(Comp, key, type) {
      var opts = Comp[type];

      if (isArray(opts) && opts.includes(key) || isObject(opts) && key in opts) {
        return true;
      }

      if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
        return true;
      }

      if (Comp.mixins && Comp.mixins.some(function (m) {
        return isKeyOfType(m, key, type);
      })) {
        return true;
      }
    }

    function genRefFlag(v) {
      if (v._shallow) {
        return "ShallowRef";
      }

      if (v.effect) {
        return "ComputedRef";
      }

      return "Ref";
    }

    if (window.devtoolsFormatters) {
      window.devtoolsFormatters.push(formatter);
    } else {
      window.devtoolsFormatters = [formatter];
    }
  }

  function initDev() {
    var target = getGlobalThis();
    target.__VUE__ = true;
    setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__);
    {
      initCustomFormatter();
    }
  } // This entry exports the runtime only, and is built as


  process.env.NODE_ENV !== 'production' && initDev();

  function getInternetExplorerVersion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');

    if (trident > 0) {
      // IE 11 => return version number
      var rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');

    if (edge > 0) {
      // Edge (IE 12+) => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    } // other browser


    return -1;
  }

  var isIE;

  function initCompat() {
    if (!initCompat.init) {
      initCompat.init = true;
      isIE = getInternetExplorerVersion() !== -1;
    }
  }

  var script = {
    name: 'ResizeObserver',
    mounted: function mounted() {
      var _this = this;

      initCompat();
      nextTick(function () {
        _this._w = _this.$el.offsetWidth;
        _this._h = _this.$el.offsetHeight;
      });
      var object = document.createElement('object');
      this._resizeObject = object;
      object.setAttribute('aria-hidden', 'true');
      object.setAttribute('tabindex', -1);
      object.onload = this.addResizeHandlers;
      object.type = 'text/html';

      if (isIE) {
        this.$el.appendChild(object);
      }

      object.data = 'about:blank';

      if (!isIE) {
        this.$el.appendChild(object);
      }
    },
    beforeUnmount: function beforeUnmount() {
      this.removeResizeHandlers();
    },
    methods: {
      compareAndNotify: function compareAndNotify() {
        if (this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight) {
          this._w = this.$el.offsetWidth;
          this._h = this.$el.offsetHeight;
          this.$emit('notify', {
            width: this._w,
            height: this._h
          });
        }
      },
      addResizeHandlers: function addResizeHandlers() {
        this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.compareAndNotify);

        this.compareAndNotify();
      },
      removeResizeHandlers: function removeResizeHandlers() {
        if (this._resizeObject && this._resizeObject.onload) {
          if (!isIE && this._resizeObject.contentDocument) {
            this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.compareAndNotify);
          }

          this.$el.removeChild(this._resizeObject);
          this._resizeObject.onload = null;
          this._resizeObject = null;
        }
      }
    }
  };

  var _withId = /*#__PURE__*/withScopeId("data-v-b329ee4c");

  pushScopeId("data-v-b329ee4c");
  var _hoisted_1 = {
    class: "resize-observer",
    tabindex: "-1"
  };
  popScopeId();

  var render = /*#__PURE__*/_withId(function (_ctx, _cache, $props, $setup, $data, $options) {
    return openBlock(), createBlock("div", _hoisted_1);
  });

  script.render = render;
  script.__scopeId = "data-v-b329ee4c";
  script.__file = "src/components/ResizeObserver.vue";

  function install(Vue) {
    Vue.component('resize-observer', script);
    Vue.component('ResizeObserver', script);
  }

  var plugin = {
    // eslint-disable-next-line no-undef
    version: "0.5.0",
    install: install
  };
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  var _ErrorTypeStrings$1;

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol") {
      _typeof$1 = function _typeof$1(obj) {
        return _typeof(obj);
      };
    } else {
      _typeof$1 = function _typeof$1(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof(obj);
      };
    }

    return _typeof$1(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _toConsumableArray$1(arr) {
    return _arrayWithoutHoles$1(arr) || _iterableToArray$1(arr) || _nonIterableSpread$1();
  }

  function _arrayWithoutHoles$1(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _iterableToArray$1(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread$1() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }
  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   * IMPORTANT: all calls of this function must be prefixed with
   * \/\*#\_\_PURE\_\_\*\/
   * So that rollup can tree-shake them if necessary.
   */


  function makeMap$1(str, expectsLowerCase) {
    var map = Object.create(null);
    var list = str.split(',');

    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }

    return expectsLowerCase ? function (val) {
      return !!map[val.toLowerCase()];
    } : function (val) {
      return !!map[val];
    };
  }

  var GLOBALS_WHITE_LISTED$1 = 'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' + 'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' + 'Object,Boolean,String,RegExp,Map,Set,JSON,Intl';
  var isGloballyWhitelisted$1 = /*#__PURE__*/makeMap$1(GLOBALS_WHITE_LISTED$1);
  /**
   * On the client we only need to offer special cases for boolean attributes that
   * have different names from their corresponding dom properties:
   * - itemscope -> N/A
   * - allowfullscreen -> allowFullscreen
   * - formnovalidate -> formNoValidate
   * - ismap -> isMap
   * - nomodule -> noModule
   * - novalidate -> noValidate
   * - readonly -> readOnly
   */

  var specialBooleanAttrs = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly";
  var isSpecialBooleanAttr = /*#__PURE__*/makeMap$1(specialBooleanAttrs);

  function normalizeStyle$1(value) {
    if (isArray$1(value)) {
      var res = {};

      for (var i = 0; i < value.length; i++) {
        var item = value[i];
        var normalized = normalizeStyle$1(isString$1(item) ? parseStringStyle$1(item) : item);

        if (normalized) {
          for (var key in normalized) {
            res[key] = normalized[key];
          }
        }
      }

      return res;
    } else if (isObject$1(value)) {
      return value;
    }
  }

  var listDelimiterRE$1 = /;(?![^(]*\))/g;
  var propertyDelimiterRE$1 = /:(.+)/;

  function parseStringStyle$1(cssText) {
    var ret = {};
    cssText.split(listDelimiterRE$1).forEach(function (item) {
      if (item) {
        var tmp = item.split(propertyDelimiterRE$1);
        tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return ret;
  }

  function normalizeClass$1(value) {
    var res = '';

    if (isString$1(value)) {
      res = value;
    } else if (isArray$1(value)) {
      for (var i = 0; i < value.length; i++) {
        res += normalizeClass$1(value[i]) + ' ';
      }
    } else if (isObject$1(value)) {
      for (var name in value) {
        if (value[name]) {
          res += name + ' ';
        }
      }
    }

    return res.trim();
  }

  var EMPTY_OBJ$1 = process.env.NODE_ENV !== 'production' ? Object.freeze({}) : {};
  var EMPTY_ARR$1 = process.env.NODE_ENV !== 'production' ? Object.freeze([]) : [];

  var NOOP$1 = function NOOP() {};

  var onRE$1 = /^on[^a-z]/;

  var isOn$1 = function isOn(key) {
    return onRE$1.test(key);
  };

  var isModelListener = function isModelListener(key) {
    return key.startsWith('onUpdate:');
  };

  var extend$1 = Object.assign;

  var remove$1 = function remove(arr, el) {
    var i = arr.indexOf(el);

    if (i > -1) {
      arr.splice(i, 1);
    }
  };

  var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

  var hasOwn$1 = function hasOwn(val, key) {
    return hasOwnProperty$1.call(val, key);
  };

  var isArray$1 = Array.isArray;

  var isMap$1 = function isMap(val) {
    return toTypeString$1(val) === '[object Map]';
  };

  var isSet$1 = function isSet(val) {
    return toTypeString$1(val) === '[object Set]';
  };

  var isFunction$1 = function isFunction(val) {
    return typeof val === 'function';
  };

  var isString$1 = function isString(val) {
    return typeof val === 'string';
  };

  var isSymbol$1 = function isSymbol(val) {
    return _typeof(val) === 'symbol';
  };

  var isObject$1 = function isObject(val) {
    return val !== null && _typeof(val) === 'object';
  };

  var isPromise$1 = function isPromise(val) {
    return isObject$1(val) && isFunction$1(val.then) && isFunction$1(val.catch);
  };

  var objectToString$1 = Object.prototype.toString;

  var toTypeString$1 = function toTypeString(value) {
    return objectToString$1.call(value);
  };

  var toRawType$1 = function toRawType(value) {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString$1(value).slice(8, -1);
  };

  var isIntegerKey$1 = function isIntegerKey(key) {
    return isString$1(key) && key !== 'NaN' && key[0] !== '-' && '' + parseInt(key, 10) === key;
  };

  var cacheStringFunction$1 = function cacheStringFunction(fn) {
    var cache = Object.create(null);
    return function (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str));
    };
  };

  var camelizeRE = /-(\w)/g;
  /**
   * @private
   */

  var camelize = cacheStringFunction$1(function (str) {
    return str.replace(camelizeRE, function (_, c) {
      return c ? c.toUpperCase() : '';
    });
  });
  var hyphenateRE = /\B([A-Z])/g;
  /**
   * @private
   */

  var hyphenate = cacheStringFunction$1(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase();
  });
  /**
   * @private
   */

  var capitalize$1 = cacheStringFunction$1(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }); // compare whether a value has changed, accounting for NaN.

  var hasChanged$1 = function hasChanged(value, oldValue) {
    return value !== oldValue && (value === value || oldValue === oldValue);
  };

  var _globalThis$1;

  var getGlobalThis$1 = function getGlobalThis() {
    return _globalThis$1 || (_globalThis$1 = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {});
  };

  var targetMap$1 = new WeakMap();
  var effectStack$1 = [];
  var activeEffect$1;
  var ITERATE_KEY$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'iterate' : '');
  var MAP_KEY_ITERATE_KEY$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'Map key iterate' : '');

  function isEffect$1(fn) {
    return fn && fn._isEffect === true;
  }

  function effect$1(fn) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : EMPTY_OBJ$1;

    if (isEffect$1(fn)) {
      fn = fn.raw;
    }

    var effect = createReactiveEffect$1(fn, options);

    if (!options.lazy) {
      effect();
    }

    return effect;
  }

  function stop$1(effect) {
    if (effect.active) {
      cleanup$1(effect);

      if (effect.options.onStop) {
        effect.options.onStop();
      }

      effect.active = false;
    }
  }

  var uid$1 = 0;

  function createReactiveEffect$1(fn, options) {
    var effect = function reactiveEffect() {
      if (!effect.active) {
        return options.scheduler ? undefined : fn();
      }

      if (!effectStack$1.includes(effect)) {
        cleanup$1(effect);

        try {
          enableTracking$1();
          effectStack$1.push(effect);
          activeEffect$1 = effect;
          return fn();
        } finally {
          effectStack$1.pop();
          resetTracking$1();
          activeEffect$1 = effectStack$1[effectStack$1.length - 1];
        }
      }
    };

    effect.id = uid$1++;
    effect.allowRecurse = !!options.allowRecurse;
    effect._isEffect = true;
    effect.active = true;
    effect.raw = fn;
    effect.deps = [];
    effect.options = options;
    return effect;
  }

  function cleanup$1(effect) {
    var deps = effect.deps;

    if (deps.length) {
      for (var i = 0; i < deps.length; i++) {
        deps[i].delete(effect);
      }

      deps.length = 0;
    }
  }

  var shouldTrack$1 = true;
  var trackStack$1 = [];

  function pauseTracking$1() {
    trackStack$1.push(shouldTrack$1);
    shouldTrack$1 = false;
  }

  function enableTracking$1() {
    trackStack$1.push(shouldTrack$1);
    shouldTrack$1 = true;
  }

  function resetTracking$1() {
    var last = trackStack$1.pop();
    shouldTrack$1 = last === undefined ? true : last;
  }

  function track$1(target, type, key) {
    if (!shouldTrack$1 || activeEffect$1 === undefined) {
      return;
    }

    var depsMap = targetMap$1.get(target);

    if (!depsMap) {
      targetMap$1.set(target, depsMap = new Map());
    }

    var dep = depsMap.get(key);

    if (!dep) {
      depsMap.set(key, dep = new Set());
    }

    if (!dep.has(activeEffect$1)) {
      dep.add(activeEffect$1);
      activeEffect$1.deps.push(dep);

      if (process.env.NODE_ENV !== 'production' && activeEffect$1.options.onTrack) {
        activeEffect$1.options.onTrack({
          effect: activeEffect$1,
          target: target,
          type: type,
          key: key
        });
      }
    }
  }

  function trigger$1(target, type, key, newValue, oldValue, oldTarget) {
    var depsMap = targetMap$1.get(target);

    if (!depsMap) {
      // never been tracked
      return;
    }

    var effects = new Set();

    var add = function add(effectsToAdd) {
      if (effectsToAdd) {
        effectsToAdd.forEach(function (effect) {
          if (effect !== activeEffect$1 || effect.allowRecurse) {
            effects.add(effect);
          }
        });
      }
    };

    if (type === "clear"
    /* CLEAR */
    ) {
        // collection being cleared
        // trigger all effects for target
        depsMap.forEach(add);
      } else if (key === 'length' && isArray$1(target)) {
      depsMap.forEach(function (dep, key) {
        if (key === 'length' || key >= newValue) {
          add(dep);
        }
      });
    } else {
      // schedule runs for SET | ADD | DELETE
      if (key !== void 0) {
        add(depsMap.get(key));
      } // also run for iteration key on ADD | DELETE | Map.SET


      switch (type) {
        case "add"
        /* ADD */
        :
          if (!isArray$1(target)) {
            add(depsMap.get(ITERATE_KEY$1));

            if (isMap$1(target)) {
              add(depsMap.get(MAP_KEY_ITERATE_KEY$1));
            }
          } else if (isIntegerKey$1(key)) {
            // new index added to array -> length changes
            add(depsMap.get('length'));
          }

          break;

        case "delete"
        /* DELETE */
        :
          if (!isArray$1(target)) {
            add(depsMap.get(ITERATE_KEY$1));

            if (isMap$1(target)) {
              add(depsMap.get(MAP_KEY_ITERATE_KEY$1));
            }
          }

          break;

        case "set"
        /* SET */
        :
          if (isMap$1(target)) {
            add(depsMap.get(ITERATE_KEY$1));
          }

          break;
      }
    }

    var run = function run(effect) {
      if (process.env.NODE_ENV !== 'production' && effect.options.onTrigger) {
        effect.options.onTrigger({
          effect: effect,
          target: target,
          key: key,
          type: type,
          newValue: newValue,
          oldValue: oldValue,
          oldTarget: oldTarget
        });
      }

      if (effect.options.scheduler) {
        effect.options.scheduler(effect);
      } else {
        effect();
      }
    };

    effects.forEach(run);
  }

  var builtInSymbols$1 = new Set(Object.getOwnPropertyNames(Symbol).map(function (key) {
    return Symbol[key];
  }).filter(isSymbol$1));
  var get$2 = /*#__PURE__*/createGetter$1();
  var shallowGet$1 = /*#__PURE__*/createGetter$1(false, true);
  var readonlyGet$1 = /*#__PURE__*/createGetter$1(true);
  var shallowReadonlyGet$1 = /*#__PURE__*/createGetter$1(true, true);
  var arrayInstrumentations$1 = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(function (key) {
    var method = Array.prototype[key];

    arrayInstrumentations$1[key] = function () {
      var arr = toRaw$1(this);

      for (var i = 0, l = this.length; i < l; i++) {
        track$1(arr, "get"
        /* GET */
        , i + '');
      } // we run the method using the original args first (which may be reactive)


      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var res = method.apply(arr, args);

      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        return method.apply(arr, args.map(toRaw$1));
      } else {
        return res;
      }
    };
  });
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function (key) {
    var method = Array.prototype[key];

    arrayInstrumentations$1[key] = function () {
      pauseTracking$1();

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var res = method.apply(this, args);
      resetTracking$1();
      return res;
    };
  });

  function createGetter$1() {
    var isReadonly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var shallow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return function get(target, key, receiver) {
      if (key === "__v_isReactive"
      /* IS_REACTIVE */
      ) {
          return !isReadonly;
        } else if (key === "__v_isReadonly"
      /* IS_READONLY */
      ) {
          return isReadonly;
        } else if (key === "__v_raw"
      /* RAW */
      && receiver === (isReadonly ? readonlyMap$1 : reactiveMap$1).get(target)) {
        return target;
      }

      var targetIsArray = isArray$1(target);

      if (!isReadonly && targetIsArray && hasOwn$1(arrayInstrumentations$1, key)) {
        return Reflect.get(arrayInstrumentations$1, key, receiver);
      }

      var res = Reflect.get(target, key, receiver);

      if (isSymbol$1(key) ? builtInSymbols$1.has(key) : key === "__proto__" || key === "__v_isRef") {
        return res;
      }

      if (!isReadonly) {
        track$1(target, "get"
        /* GET */
        , key);
      }

      if (shallow) {
        return res;
      }

      if (isRef$1(res)) {
        // ref unwrapping - does not apply for Array + integer key.
        var shouldUnwrap = !targetIsArray || !isIntegerKey$1(key);
        return shouldUnwrap ? res.value : res;
      }

      if (isObject$1(res)) {
        // Convert returned value into a proxy as well. we do the isObject check
        // here to avoid invalid value warning. Also need to lazy access readonly
        // and reactive here to avoid circular dependency.
        return isReadonly ? readonly$1(res) : reactive$1(res);
      }

      return res;
    };
  }

  var set$2 = /*#__PURE__*/createSetter$1();
  var shallowSet$1 = /*#__PURE__*/createSetter$1(true);

  function createSetter$1() {
    var shallow = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    return function set(target, key, value, receiver) {
      var oldValue = target[key];

      if (!shallow) {
        value = toRaw$1(value);

        if (!isArray$1(target) && isRef$1(oldValue) && !isRef$1(value)) {
          oldValue.value = value;
          return true;
        }
      }

      var hadKey = isArray$1(target) && isIntegerKey$1(key) ? Number(key) < target.length : hasOwn$1(target, key);
      var result = Reflect.set(target, key, value, receiver); // don't trigger if target is something up in the prototype chain of original

      if (target === toRaw$1(receiver)) {
        if (!hadKey) {
          trigger$1(target, "add"
          /* ADD */
          , key, value);
        } else if (hasChanged$1(value, oldValue)) {
          trigger$1(target, "set"
          /* SET */
          , key, value, oldValue);
        }
      }

      return result;
    };
  }

  function deleteProperty$1(target, key) {
    var hadKey = hasOwn$1(target, key);
    var oldValue = target[key];
    var result = Reflect.deleteProperty(target, key);

    if (result && hadKey) {
      trigger$1(target, "delete"
      /* DELETE */
      , key, undefined, oldValue);
    }

    return result;
  }

  function has$2(target, key) {
    var result = Reflect.has(target, key);

    if (!isSymbol$1(key) || !builtInSymbols$1.has(key)) {
      track$1(target, "has"
      /* HAS */
      , key);
    }

    return result;
  }

  function ownKeys$2(target) {
    track$1(target, "iterate"
    /* ITERATE */
    , isArray$1(target) ? 'length' : ITERATE_KEY$1);
    return Reflect.ownKeys(target);
  }

  var mutableHandlers$1 = {
    get: get$2,
    set: set$2,
    deleteProperty: deleteProperty$1,
    has: has$2,
    ownKeys: ownKeys$2
  };
  var readonlyHandlers$1 = {
    get: readonlyGet$1,
    set: function set(target, key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Set operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
      }

      return true;
    },
    deleteProperty: function deleteProperty(target, key) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("Delete operation on key \"".concat(String(key), "\" failed: target is readonly."), target);
      }

      return true;
    }
  };
  var shallowReactiveHandlers$1 = extend$1({}, mutableHandlers$1, {
    get: shallowGet$1,
    set: shallowSet$1
  }); // Props handlers are special in the sense that it should not unwrap top-level
  // refs (in order to allow refs to be explicitly passed down), but should
  // retain the reactivity of the normal readonly object.

  var shallowReadonlyHandlers$1 = extend$1({}, readonlyHandlers$1, {
    get: shallowReadonlyGet$1
  });

  var toReactive$1 = function toReactive(value) {
    return isObject$1(value) ? reactive$1(value) : value;
  };

  var toReadonly$1 = function toReadonly(value) {
    return isObject$1(value) ? readonly$1(value) : value;
  };

  var toShallow$1 = function toShallow(value) {
    return value;
  };

  var getProto$1 = function getProto(v) {
    return Reflect.getPrototypeOf(v);
  };

  function get$1$1(target, key) {
    var isReadonly = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var isShallow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw"
    /* RAW */
    ];
    var rawTarget = toRaw$1(target);
    var rawKey = toRaw$1(key);

    if (key !== rawKey) {
      !isReadonly && track$1(rawTarget, "get"
      /* GET */
      , key);
    }

    !isReadonly && track$1(rawTarget, "get"
    /* GET */
    , rawKey);

    var _getProto = getProto$1(rawTarget),
        has = _getProto.has;

    var wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;

    if (has.call(rawTarget, key)) {
      return wrap(target.get(key));
    } else if (has.call(rawTarget, rawKey)) {
      return wrap(target.get(rawKey));
    }
  }

  function has$1$1(key) {
    var isReadonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var target = this["__v_raw"
    /* RAW */
    ];
    var rawTarget = toRaw$1(target);
    var rawKey = toRaw$1(key);

    if (key !== rawKey) {
      !isReadonly && track$1(rawTarget, "has"
      /* HAS */
      , key);
    }

    !isReadonly && track$1(rawTarget, "has"
    /* HAS */
    , rawKey);
    return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
  }

  function size$1(target) {
    var isReadonly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    target = target["__v_raw"
    /* RAW */
    ];
    !isReadonly && track$1(toRaw$1(target), "iterate"
    /* ITERATE */
    , ITERATE_KEY$1);
    return Reflect.get(target, 'size', target);
  }

  function add$1(value) {
    value = toRaw$1(value);
    var target = toRaw$1(this);
    var proto = getProto$1(target);
    var hadKey = proto.has.call(target, value);
    target.add(value);

    if (!hadKey) {
      trigger$1(target, "add"
      /* ADD */
      , value, value);
    }

    return this;
  }

  function set$1$1(key, value) {
    value = toRaw$1(value);
    var target = toRaw$1(this);

    var _getProto2 = getProto$1(target),
        has = _getProto2.has,
        get = _getProto2.get;

    var hadKey = has.call(target, key);

    if (!hadKey) {
      key = toRaw$1(key);
      hadKey = has.call(target, key);
    } else if (process.env.NODE_ENV !== 'production') {
      checkIdentityKeys$1(target, has, key);
    }

    var oldValue = get.call(target, key);
    target.set(key, value);

    if (!hadKey) {
      trigger$1(target, "add"
      /* ADD */
      , key, value);
    } else if (hasChanged$1(value, oldValue)) {
      trigger$1(target, "set"
      /* SET */
      , key, value, oldValue);
    }

    return this;
  }

  function deleteEntry$1(key) {
    var target = toRaw$1(this);

    var _getProto3 = getProto$1(target),
        has = _getProto3.has,
        get = _getProto3.get;

    var hadKey = has.call(target, key);

    if (!hadKey) {
      key = toRaw$1(key);
      hadKey = has.call(target, key);
    } else if (process.env.NODE_ENV !== 'production') {
      checkIdentityKeys$1(target, has, key);
    }

    var oldValue = get ? get.call(target, key) : undefined; // forward the operation before queueing reactions

    var result = target.delete(key);

    if (hadKey) {
      trigger$1(target, "delete"
      /* DELETE */
      , key, undefined, oldValue);
    }

    return result;
  }

  function clear$1() {
    var target = toRaw$1(this);
    var hadItems = target.size !== 0;
    var oldTarget = process.env.NODE_ENV !== 'production' ? isMap$1(target) ? new Map(target) : new Set(target) : undefined; // forward the operation before queueing reactions

    var result = target.clear();

    if (hadItems) {
      trigger$1(target, "clear"
      /* CLEAR */
      , undefined, undefined, oldTarget);
    }

    return result;
  }

  function createForEach$1(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
      var observed = this;
      var target = observed["__v_raw"
      /* RAW */
      ];
      var rawTarget = toRaw$1(target);
      var wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;
      !isReadonly && track$1(rawTarget, "iterate"
      /* ITERATE */
      , ITERATE_KEY$1);
      return target.forEach(function (value, key) {
        // important: make sure the callback is
        // 1. invoked with the reactive map as `this` and 3rd arg
        // 2. the value received should be a corresponding reactive/readonly.
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    };
  }

  function createIterableMethod$1(method, isReadonly, isShallow) {
    return function () {
      var target = this["__v_raw"
      /* RAW */
      ];
      var rawTarget = toRaw$1(target);
      var targetIsMap = isMap$1(rawTarget);
      var isPair = method === 'entries' || method === Symbol.iterator && targetIsMap;
      var isKeyOnly = method === 'keys' && targetIsMap;
      var innerIterator = target[method].apply(target, arguments);
      var wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;
      !isReadonly && track$1(rawTarget, "iterate"
      /* ITERATE */
      , isKeyOnly ? MAP_KEY_ITERATE_KEY$1 : ITERATE_KEY$1); // return a wrapped iterator which returns observed versions of the
      // values emitted from the real iterator

      return _defineProperty({
        // iterator protocol
        next: function next() {
          var _innerIterator$next = innerIterator.next(),
              value = _innerIterator$next.value,
              done = _innerIterator$next.done;

          return done ? {
            value: value,
            done: done
          } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done: done
          };
        }
      }, Symbol.iterator, function () {
        return this;
      });
    };
  }

  function createReadonlyMethod$1(type) {
    return function () {
      if (process.env.NODE_ENV !== 'production') {
        var key = (arguments.length <= 0 ? undefined : arguments[0]) ? "on key \"".concat(arguments.length <= 0 ? undefined : arguments[0], "\" ") : "";
        console.warn("".concat(capitalize$1(type), " operation ").concat(key, "failed: target is readonly."), toRaw$1(this));
      }

      return type === "delete"
      /* DELETE */
      ? false : this;
    };
  }

  var mutableInstrumentations$1 = {
    get: function get(key) {
      return get$1$1(this, key);
    },

    get size() {
      return size$1(this);
    },

    has: has$1$1,
    add: add$1,
    set: set$1$1,
    delete: deleteEntry$1,
    clear: clear$1,
    forEach: createForEach$1(false, false)
  };
  var shallowInstrumentations$1 = {
    get: function get(key) {
      return get$1$1(this, key, false, true);
    },

    get size() {
      return size$1(this);
    },

    has: has$1$1,
    add: add$1,
    set: set$1$1,
    delete: deleteEntry$1,
    clear: clear$1,
    forEach: createForEach$1(false, true)
  };
  var readonlyInstrumentations$1 = {
    get: function get(key) {
      return get$1$1(this, key, true);
    },

    get size() {
      return size$1(this, true);
    },

    has: function has(key) {
      return has$1$1.call(this, key, true);
    },
    add: createReadonlyMethod$1("add"
    /* ADD */
    ),
    set: createReadonlyMethod$1("set"
    /* SET */
    ),
    delete: createReadonlyMethod$1("delete"
    /* DELETE */
    ),
    clear: createReadonlyMethod$1("clear"
    /* CLEAR */
    ),
    forEach: createForEach$1(true, false)
  };
  var iteratorMethods$1 = ['keys', 'values', 'entries', Symbol.iterator];
  iteratorMethods$1.forEach(function (method) {
    mutableInstrumentations$1[method] = createIterableMethod$1(method, false, false);
    readonlyInstrumentations$1[method] = createIterableMethod$1(method, true, false);
    shallowInstrumentations$1[method] = createIterableMethod$1(method, false, true);
  });

  function createInstrumentationGetter$1(isReadonly, shallow) {
    var instrumentations = shallow ? shallowInstrumentations$1 : isReadonly ? readonlyInstrumentations$1 : mutableInstrumentations$1;
    return function (target, key, receiver) {
      if (key === "__v_isReactive"
      /* IS_REACTIVE */
      ) {
          return !isReadonly;
        } else if (key === "__v_isReadonly"
      /* IS_READONLY */
      ) {
          return isReadonly;
        } else if (key === "__v_raw"
      /* RAW */
      ) {
          return target;
        }

      return Reflect.get(hasOwn$1(instrumentations, key) && key in target ? instrumentations : target, key, receiver);
    };
  }

  var mutableCollectionHandlers$1 = {
    get: createInstrumentationGetter$1(false, false)
  };
  var readonlyCollectionHandlers$1 = {
    get: createInstrumentationGetter$1(true, false)
  };

  function checkIdentityKeys$1(target, has, key) {
    var rawKey = toRaw$1(key);

    if (rawKey !== key && has.call(target, rawKey)) {
      var type = toRawType$1(target);
      console.warn("Reactive ".concat(type, " contains both the raw and reactive ") + "versions of the same object".concat(type === "Map" ? " as keys" : "", ", ") + "which can lead to inconsistencies. " + "Avoid differentiating between the raw and reactive versions " + "of an object and only use the reactive version if possible.");
    }
  }

  var reactiveMap$1 = new WeakMap();
  var readonlyMap$1 = new WeakMap();

  function targetTypeMap$1(rawType) {
    switch (rawType) {
      case 'Object':
      case 'Array':
        return 1
        /* COMMON */
        ;

      case 'Map':
      case 'Set':
      case 'WeakMap':
      case 'WeakSet':
        return 2
        /* COLLECTION */
        ;

      default:
        return 0
        /* INVALID */
        ;
    }
  }

  function getTargetType$1(value) {
    return value["__v_skip"
    /* SKIP */
    ] || !Object.isExtensible(value) ? 0
    /* INVALID */
    : targetTypeMap$1(toRawType$1(value));
  }

  function reactive$1(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (target && target["__v_isReadonly"
    /* IS_READONLY */
    ]) {
      return target;
    }

    return createReactiveObject$1(target, false, mutableHandlers$1, mutableCollectionHandlers$1);
  }
  /**
   * Creates a readonly copy of the original object. Note the returned copy is not
   * made reactive, but `readonly` can be called on an already reactive object.
   */


  function readonly$1(target) {
    return createReactiveObject$1(target, true, readonlyHandlers$1, readonlyCollectionHandlers$1);
  }
  /**
   * Returns a reactive-copy of the original object, where only the root level
   * properties are readonly, and does NOT unwrap refs nor recursively convert
   * returned properties.
   * This is used for creating the props proxy object for stateful components.
   */


  function shallowReadonly$1(target) {
    return createReactiveObject$1(target, true, shallowReadonlyHandlers$1, readonlyCollectionHandlers$1);
  }

  function createReactiveObject$1(target, isReadonly, baseHandlers, collectionHandlers) {
    if (!isObject$1(target)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("value cannot be made reactive: ".concat(String(target)));
      }

      return target;
    } // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object


    if (target["__v_raw"
    /* RAW */
    ] && !(isReadonly && target["__v_isReactive"
    /* IS_REACTIVE */
    ])) {
      return target;
    } // target already has corresponding Proxy


    var proxyMap = isReadonly ? readonlyMap$1 : reactiveMap$1;
    var existingProxy = proxyMap.get(target);

    if (existingProxy) {
      return existingProxy;
    } // only a whitelist of value types can be observed.


    var targetType = getTargetType$1(target);

    if (targetType === 0
    /* INVALID */
    ) {
        return target;
      }

    var proxy = new Proxy(target, targetType === 2
    /* COLLECTION */
    ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
  }

  function isReactive$1(value) {
    if (isReadonly$1(value)) {
      return isReactive$1(value["__v_raw"
      /* RAW */
      ]);
    }

    return !!(value && value["__v_isReactive"
    /* IS_REACTIVE */
    ]);
  }

  function isReadonly$1(value) {
    return !!(value && value["__v_isReadonly"
    /* IS_READONLY */
    ]);
  }

  function isProxy$1(value) {
    return isReactive$1(value) || isReadonly$1(value);
  }

  function toRaw$1(observed) {
    return observed && toRaw$1(observed["__v_raw"
    /* RAW */
    ]) || observed;
  }

  function isRef$1(r) {
    return Boolean(r && r.__v_isRef === true);
  }

  var stack$1 = [];

  function pushWarningContext$1(vnode) {
    stack$1.push(vnode);
  }

  function popWarningContext$1() {
    stack$1.pop();
  }

  function warn$1(msg) {
    // avoid props formatting or warn handler tracking deps that might be mutated
    // during patch, leading to infinite recursion.
    pauseTracking$1();
    var instance = stack$1.length ? stack$1[stack$1.length - 1].component : null;
    var appWarnHandler = instance && instance.appContext.config.warnHandler;
    var trace = getComponentTrace$1();

    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }

    if (appWarnHandler) {
      callWithErrorHandling$1(appWarnHandler, instance, 11
      /* APP_WARN_HANDLER */
      , [msg + args.join(''), instance && instance.proxy, trace.map(function (_ref5) {
        var vnode = _ref5.vnode;
        return "at <".concat(formatComponentName$1(instance, vnode.type), ">");
      }).join('\n'), trace]);
    } else {
      var _console;

      var warnArgs = ["[Vue warn]: ".concat(msg)].concat(args);
      /* istanbul ignore if */

      if (trace.length && // avoid spamming console during tests
      !false) {
        warnArgs.push.apply(warnArgs, ["\n"].concat(_toConsumableArray(formatTrace$1(trace))));
      }

      (_console = console).warn.apply(_console, _toConsumableArray(warnArgs));
    }

    resetTracking$1();
  }

  function getComponentTrace$1() {
    var currentVNode = stack$1[stack$1.length - 1];

    if (!currentVNode) {
      return [];
    } // we can't just use the stack because it will be incomplete during updates
    // that did not start from the root. Re-construct the parent chain using
    // instance parent pointers.


    var normalizedStack = [];

    while (currentVNode) {
      var last = normalizedStack[0];

      if (last && last.vnode === currentVNode) {
        last.recurseCount++;
      } else {
        normalizedStack.push({
          vnode: currentVNode,
          recurseCount: 0
        });
      }

      var parentInstance = currentVNode.component && currentVNode.component.parent;
      currentVNode = parentInstance && parentInstance.vnode;
    }

    return normalizedStack;
  }
  /* istanbul ignore next */


  function formatTrace$1(trace) {
    var logs = [];
    trace.forEach(function (entry, i) {
      logs.push.apply(logs, _toConsumableArray(i === 0 ? [] : ["\n"]).concat(_toConsumableArray(formatTraceEntry$1(entry))));
    });
    return logs;
  }

  function formatTraceEntry$1(_ref6) {
    var vnode = _ref6.vnode,
        recurseCount = _ref6.recurseCount;
    var postfix = recurseCount > 0 ? "... (".concat(recurseCount, " recursive calls)") : "";
    var isRoot = vnode.component ? vnode.component.parent == null : false;
    var open = " at <".concat(formatComponentName$1(vnode.component, vnode.type, isRoot));
    var close = ">" + postfix;
    return vnode.props ? [open].concat(_toConsumableArray(formatProps$1(vnode.props)), [close]) : [open + close];
  }
  /* istanbul ignore next */


  function formatProps$1(props) {
    var res = [];
    var keys = Object.keys(props);
    keys.slice(0, 3).forEach(function (key) {
      res.push.apply(res, _toConsumableArray(formatProp$1(key, props[key])));
    });

    if (keys.length > 3) {
      res.push(" ...");
    }

    return res;
  }
  /* istanbul ignore next */


  function formatProp$1(key, value, raw) {
    if (isString$1(value)) {
      value = JSON.stringify(value);
      return raw ? value : ["".concat(key, "=").concat(value)];
    } else if (typeof value === 'number' || typeof value === 'boolean' || value == null) {
      return raw ? value : ["".concat(key, "=").concat(value)];
    } else if (isRef$1(value)) {
      value = formatProp$1(key, toRaw$1(value.value), true);
      return raw ? value : ["".concat(key, "=Ref<"), value, ">"];
    } else if (isFunction$1(value)) {
      return ["".concat(key, "=fn").concat(value.name ? "<".concat(value.name, ">") : "")];
    } else {
      value = toRaw$1(value);
      return raw ? value : ["".concat(key, "="), value];
    }
  }

  var ErrorTypeStrings$1 = (_ErrorTypeStrings$1 = {}, _defineProperty(_ErrorTypeStrings$1, "bc"
  /* BEFORE_CREATE */
  , 'beforeCreate hook'), _defineProperty(_ErrorTypeStrings$1, "c"
  /* CREATED */
  , 'created hook'), _defineProperty(_ErrorTypeStrings$1, "bm"
  /* BEFORE_MOUNT */
  , 'beforeMount hook'), _defineProperty(_ErrorTypeStrings$1, "m"
  /* MOUNTED */
  , 'mounted hook'), _defineProperty(_ErrorTypeStrings$1, "bu"
  /* BEFORE_UPDATE */
  , 'beforeUpdate hook'), _defineProperty(_ErrorTypeStrings$1, "u"
  /* UPDATED */
  , 'updated'), _defineProperty(_ErrorTypeStrings$1, "bum"
  /* BEFORE_UNMOUNT */
  , 'beforeUnmount hook'), _defineProperty(_ErrorTypeStrings$1, "um"
  /* UNMOUNTED */
  , 'unmounted hook'), _defineProperty(_ErrorTypeStrings$1, "a"
  /* ACTIVATED */
  , 'activated hook'), _defineProperty(_ErrorTypeStrings$1, "da"
  /* DEACTIVATED */
  , 'deactivated hook'), _defineProperty(_ErrorTypeStrings$1, "ec"
  /* ERROR_CAPTURED */
  , 'errorCaptured hook'), _defineProperty(_ErrorTypeStrings$1, "rtc"
  /* RENDER_TRACKED */
  , 'renderTracked hook'), _defineProperty(_ErrorTypeStrings$1, "rtg"
  /* RENDER_TRIGGERED */
  , 'renderTriggered hook'), _defineProperty(_ErrorTypeStrings$1, 0
  /* SETUP_FUNCTION */
  , 'setup function'), _defineProperty(_ErrorTypeStrings$1, 1
  /* RENDER_FUNCTION */
  , 'render function'), _defineProperty(_ErrorTypeStrings$1, 2
  /* WATCH_GETTER */
  , 'watcher getter'), _defineProperty(_ErrorTypeStrings$1, 3
  /* WATCH_CALLBACK */
  , 'watcher callback'), _defineProperty(_ErrorTypeStrings$1, 4
  /* WATCH_CLEANUP */
  , 'watcher cleanup function'), _defineProperty(_ErrorTypeStrings$1, 5
  /* NATIVE_EVENT_HANDLER */
  , 'native event handler'), _defineProperty(_ErrorTypeStrings$1, 6
  /* COMPONENT_EVENT_HANDLER */
  , 'component event handler'), _defineProperty(_ErrorTypeStrings$1, 7
  /* VNODE_HOOK */
  , 'vnode hook'), _defineProperty(_ErrorTypeStrings$1, 8
  /* DIRECTIVE_HOOK */
  , 'directive hook'), _defineProperty(_ErrorTypeStrings$1, 9
  /* TRANSITION_HOOK */
  , 'transition hook'), _defineProperty(_ErrorTypeStrings$1, 10
  /* APP_ERROR_HANDLER */
  , 'app errorHandler'), _defineProperty(_ErrorTypeStrings$1, 11
  /* APP_WARN_HANDLER */
  , 'app warnHandler'), _defineProperty(_ErrorTypeStrings$1, 12
  /* FUNCTION_REF */
  , 'ref function'), _defineProperty(_ErrorTypeStrings$1, 13
  /* ASYNC_COMPONENT_LOADER */
  , 'async component loader'), _defineProperty(_ErrorTypeStrings$1, 14
  /* SCHEDULER */
  , 'scheduler flush. This is likely a Vue internals bug. ' + 'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-next'), _ErrorTypeStrings$1);

  function callWithErrorHandling$1(fn, instance, type, args) {
    var res;

    try {
      res = args ? fn.apply(void 0, _toConsumableArray(args)) : fn();
    } catch (err) {
      handleError$1(err, instance, type);
    }

    return res;
  }

  function callWithAsyncErrorHandling$1(fn, instance, type, args) {
    if (isFunction$1(fn)) {
      var res = callWithErrorHandling$1(fn, instance, type, args);

      if (res && isPromise$1(res)) {
        res.catch(function (err) {
          handleError$1(err, instance, type);
        });
      }

      return res;
    }

    var values = [];

    for (var i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling$1(fn[i], instance, type, args));
    }

    return values;
  }

  function handleError$1(err, instance, type) {
    var throwInDev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    var contextVNode = instance ? instance.vnode : null;

    if (instance) {
      var cur = instance.parent; // the exposed instance is the render proxy to keep it consistent with 2.x

      var exposedInstance = instance.proxy; // in production the hook receives only the error code

      var errorInfo = process.env.NODE_ENV !== 'production' ? ErrorTypeStrings$1[type] : type;

      while (cur) {
        var errorCapturedHooks = cur.ec;

        if (errorCapturedHooks) {
          for (var i = 0; i < errorCapturedHooks.length; i++) {
            if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
              return;
            }
          }
        }

        cur = cur.parent;
      } // app-level handling


      var appErrorHandler = instance.appContext.config.errorHandler;

      if (appErrorHandler) {
        callWithErrorHandling$1(appErrorHandler, null, 10
        /* APP_ERROR_HANDLER */
        , [err, exposedInstance, errorInfo]);
        return;
      }
    }

    logError$1(err, type, contextVNode, throwInDev);
  }

  function logError$1(err, type, contextVNode) {
    var throwInDev = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    if (process.env.NODE_ENV !== 'production') {
      var info = ErrorTypeStrings$1[type];

      if (contextVNode) {
        pushWarningContext$1(contextVNode);
      }

      warn$1("Unhandled error".concat(info ? " during execution of ".concat(info) : ""));

      if (contextVNode) {
        popWarningContext$1();
      } // crash in dev by default so it's more noticeable


      if (throwInDev) {
        throw err;
      } else {
        console.error(err);
      }
    } else {
      // recover in prod to reduce the impact on end-user
      console.error(err);
    }
  }

  var isFlushing$1 = false;
  var isFlushPending$1 = false;
  var queue$1 = [];
  var flushIndex$1 = 0;
  var pendingPreFlushCbs$1 = [];
  var activePreFlushCbs$1 = null;
  var preFlushIndex$1 = 0;
  var pendingPostFlushCbs$1 = [];
  var activePostFlushCbs$1 = null;
  var postFlushIndex$1 = 0;
  var resolvedPromise$1 = Promise.resolve();
  var currentFlushPromise$1 = null;
  var currentPreFlushParentJob$1 = null;
  var RECURSION_LIMIT$1 = 100;

  function nextTick$1(fn) {
    var p = currentFlushPromise$1 || resolvedPromise$1;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
  }

  function queueJob$1(job) {
    // the dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if ((!queue$1.length || !queue$1.includes(job, isFlushing$1 && job.allowRecurse ? flushIndex$1 + 1 : flushIndex$1)) && job !== currentPreFlushParentJob$1) {
      queue$1.push(job);
      queueFlush$1();
    }
  }

  function queueFlush$1() {
    if (!isFlushing$1 && !isFlushPending$1) {
      isFlushPending$1 = true;
      currentFlushPromise$1 = resolvedPromise$1.then(flushJobs$1);
    }
  }

  function queueCb$1(cb, activeQueue, pendingQueue, index) {
    if (!isArray$1(cb)) {
      if (!activeQueue || !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
        pendingQueue.push(cb);
      }
    } else {
      // if cb is an array, it is a component lifecycle hook which can only be
      // triggered by a job, which is already deduped in the main queue, so
      // we can skip duplicate check here to improve perf
      pendingQueue.push.apply(pendingQueue, _toConsumableArray(cb));
    }

    queueFlush$1();
  }

  function queuePreFlushCb$1(cb) {
    queueCb$1(cb, activePreFlushCbs$1, pendingPreFlushCbs$1, preFlushIndex$1);
  }

  function queuePostFlushCb$1(cb) {
    queueCb$1(cb, activePostFlushCbs$1, pendingPostFlushCbs$1, postFlushIndex$1);
  }

  function flushPreFlushCbs$1(seen) {
    var parentJob = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (pendingPreFlushCbs$1.length) {
      currentPreFlushParentJob$1 = parentJob;
      activePreFlushCbs$1 = _toConsumableArray(new Set(pendingPreFlushCbs$1));
      pendingPreFlushCbs$1.length = 0;

      if (process.env.NODE_ENV !== 'production') {
        seen = seen || new Map();
      }

      for (preFlushIndex$1 = 0; preFlushIndex$1 < activePreFlushCbs$1.length; preFlushIndex$1++) {
        if (process.env.NODE_ENV !== 'production') {
          checkRecursiveUpdates$1(seen, activePreFlushCbs$1[preFlushIndex$1]);
        }

        activePreFlushCbs$1[preFlushIndex$1]();
      }

      activePreFlushCbs$1 = null;
      preFlushIndex$1 = 0;
      currentPreFlushParentJob$1 = null; // recursively flush until it drains

      flushPreFlushCbs$1(seen, parentJob);
    }
  }

  function flushPostFlushCbs$1(seen) {
    if (pendingPostFlushCbs$1.length) {
      var deduped = _toConsumableArray(new Set(pendingPostFlushCbs$1));

      pendingPostFlushCbs$1.length = 0; // #1947 already has active queue, nested flushPostFlushCbs call

      if (activePostFlushCbs$1) {
        var _activePostFlushCbs;

        (_activePostFlushCbs = activePostFlushCbs$1).push.apply(_activePostFlushCbs, _toConsumableArray(deduped));

        return;
      }

      activePostFlushCbs$1 = deduped;

      if (process.env.NODE_ENV !== 'production') {
        seen = seen || new Map();
      }

      activePostFlushCbs$1.sort(function (a, b) {
        return getId$1(a) - getId$1(b);
      });

      for (postFlushIndex$1 = 0; postFlushIndex$1 < activePostFlushCbs$1.length; postFlushIndex$1++) {
        if (process.env.NODE_ENV !== 'production') {
          checkRecursiveUpdates$1(seen, activePostFlushCbs$1[postFlushIndex$1]);
        }

        activePostFlushCbs$1[postFlushIndex$1]();
      }

      activePostFlushCbs$1 = null;
      postFlushIndex$1 = 0;
    }
  }

  var getId$1 = function getId(job) {
    return job.id == null ? Infinity : job.id;
  };

  function flushJobs$1(seen) {
    isFlushPending$1 = false;
    isFlushing$1 = true;

    if (process.env.NODE_ENV !== 'production') {
      seen = seen || new Map();
    }

    flushPreFlushCbs$1(seen); // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child so its render effect will have smaller
    //    priority number)
    // 2. If a component is unmounted during a parent component's update,
    //    its update can be skipped.

    queue$1.sort(function (a, b) {
      return getId$1(a) - getId$1(b);
    });

    try {
      for (flushIndex$1 = 0; flushIndex$1 < queue$1.length; flushIndex$1++) {
        var job = queue$1[flushIndex$1];

        if (job) {
          if (process.env.NODE_ENV !== 'production') {
            checkRecursiveUpdates$1(seen, job);
          }

          callWithErrorHandling$1(job, null, 14
          /* SCHEDULER */
          );
        }
      }
    } finally {
      flushIndex$1 = 0;
      queue$1.length = 0;
      flushPostFlushCbs$1(seen);
      isFlushing$1 = false;
      currentFlushPromise$1 = null; // some postFlushCb queued jobs!
      // keep flushing until it drains.

      if (queue$1.length || pendingPostFlushCbs$1.length) {
        flushJobs$1(seen);
      }
    }
  }

  function checkRecursiveUpdates$1(seen, fn) {
    if (!seen.has(fn)) {
      seen.set(fn, 1);
    } else {
      var count = seen.get(fn);

      if (count > RECURSION_LIMIT$1) {
        throw new Error("Maximum recursive updates exceeded. " + "This means you have a reactive effect that is mutating its own " + "dependencies and thus recursively triggering itself. Possible sources " + "include component template, render function, updated hook or " + "watcher source function.");
      } else {
        seen.set(fn, count + 1);
      }
    }
  }

  var hmrDirtyComponents$1 = new Set(); // Expose the HMR runtime on the global object
  // This makes it entirely tree-shakable without polluting the exports and makes
  // it easier to be used in toolings like vue-loader
  // Note: for a component to be eligible for HMR it also needs the __hmrId option
  // to be set so that its instances can be registered / removed.

  if (process.env.NODE_ENV !== 'production') {
    var globalObject$1 = typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {};
    globalObject$1.__VUE_HMR_RUNTIME__ = {
      createRecord: tryWrap$1(createRecord$1),
      rerender: tryWrap$1(rerender$1),
      reload: tryWrap$1(reload$1)
    };
  }

  var map$1 = new Map();

  function createRecord$1(id, component) {
    if (!component) {
      warn$1("HMR API usage is out of date.\n" + "Please upgrade vue-loader/vite/rollup-plugin-vue or other relevant " + "depdendency that handles Vue SFC compilation.");
      component = {};
    }

    if (map$1.has(id)) {
      return false;
    }

    map$1.set(id, {
      component: isClassComponent$1(component) ? component.__vccOpts : component,
      instances: new Set()
    });
    return true;
  }

  function rerender$1(id, newRender) {
    var record = map$1.get(id);
    if (!record) return;
    if (newRender) record.component.render = newRender; // Array.from creates a snapshot which avoids the set being mutated during
    // updates

    Array.from(record.instances).forEach(function (instance) {
      if (newRender) {
        instance.render = newRender;
      }

      instance.renderCache = [];
      instance.update();
    });
  }

  function reload$1(id, newComp) {
    var record = map$1.get(id);
    if (!record) return; // Array.from creates a snapshot which avoids the set being mutated during
    // updates

    var component = record.component,
        instances = record.instances;

    if (!hmrDirtyComponents$1.has(component)) {
      // 1. Update existing comp definition to match new one
      newComp = isClassComponent$1(newComp) ? newComp.__vccOpts : newComp;
      extend$1(component, newComp);

      for (var key in component) {
        if (!(key in newComp)) {
          delete component[key];
        }
      } // 2. Mark component dirty. This forces the renderer to replace the component
      // on patch.


      hmrDirtyComponents$1.add(component); // 3. Make sure to unmark the component after the reload.

      queuePostFlushCb$1(function () {
        hmrDirtyComponents$1.delete(component);
      });
    }

    Array.from(instances).forEach(function (instance) {
      if (instance.parent) {
        // 4. Force the parent instance to re-render. This will cause all updated
        // components to be unmounted and re-mounted. Queue the update so that we
        // don't end up forcing the same parent to re-render multiple times.
        queueJob$1(instance.parent.update);
      } else if (instance.appContext.reload) {
        // root instance mounted via createApp() has a reload method
        instance.appContext.reload();
      } else if (typeof window !== 'undefined') {
        // root instance inside tree created via raw render(). Force reload.
        window.location.reload();
      } else {
        console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
      }
    });
  }

  function tryWrap$1(fn) {
    return function (id, arg) {
      try {
        return fn(id, arg);
      } catch (e) {
        console.error(e);
        console.warn("[HMR] Something went wrong during Vue component hot-reload. " + "Full reload required.");
      }
    };
  }

  function setDevtoolsHook$1(hook) {}
  /**
   * mark the current rendering instance for asset resolution (e.g.
   * resolveComponent, resolveDirective) during render
   */


  var currentRenderingInstance$1 = null;

  function markAttrsAccessed$1() {}

  function filterSingleRoot$1(children) {
    var singleRoot;

    for (var i = 0; i < children.length; i++) {
      var child = children[i];

      if (isVNode$1(child)) {
        // ignore user comment
        if (child.type !== Comment$1 || child.children === 'v-if') {
          if (singleRoot) {
            // has more than 1 non-comment child, return now
            return;
          } else {
            singleRoot = child;
          }
        }
      } else {
        return;
      }
    }

    return singleRoot;
  }

  var isSuspense$1 = function isSuspense(type) {
    return type.__isSuspense;
  };

  function normalizeSuspenseChildren$1(vnode) {
    var shapeFlag = vnode.shapeFlag,
        children = vnode.children;
    var content;
    var fallback;

    if (shapeFlag & 32
    /* SLOTS_CHILDREN */
    ) {
        content = normalizeSuspenseSlot$1(children.default);
        fallback = normalizeSuspenseSlot$1(children.fallback);
      } else {
      content = normalizeSuspenseSlot$1(children);
      fallback = normalizeVNode$1(null);
    }

    return {
      content: content,
      fallback: fallback
    };
  }

  function normalizeSuspenseSlot$1(s) {
    if (isFunction$1(s)) {
      s = s();
    }

    if (isArray$1(s)) {
      var singleChild = filterSingleRoot$1(s);

      if (process.env.NODE_ENV !== 'production' && !singleChild) {
        warn$1("<Suspense> slots expect a single root node.");
      }

      s = singleChild;
    }

    return normalizeVNode$1(s);
  }

  function queueEffectWithSuspense$1(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
      if (isArray$1(fn)) {
        var _suspense$effects;

        (_suspense$effects = suspense.effects).push.apply(_suspense$effects, _toConsumableArray(fn));
      } else {
        suspense.effects.push(fn);
      }
    } else {
      queuePostFlushCb$1(fn);
    }
  }

  var isRenderingCompiledSlot$1 = 0;

  var setCompiledSlotRendering$1 = function setCompiledSlotRendering(n) {
    return isRenderingCompiledSlot$1 += n;
  }; // SFC scoped style ID management.


  var currentScopeId$1 = null; // initial value for watchers to trigger on undefined initial values

  var INITIAL_WATCHER_VALUE$1 = {};

  function doWatch$1(source, cb) {
    var _ref7 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : EMPTY_OBJ$1,
        immediate = _ref7.immediate,
        deep = _ref7.deep,
        flush = _ref7.flush,
        onTrack = _ref7.onTrack,
        onTrigger = _ref7.onTrigger;

    var instance = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : currentInstance$1;

    if (process.env.NODE_ENV !== 'production' && !cb) {
      if (immediate !== undefined) {
        warn$1("watch() \"immediate\" option is only respected when using the " + "watch(source, callback, options?) signature.");
      }

      if (deep !== undefined) {
        warn$1("watch() \"deep\" option is only respected when using the " + "watch(source, callback, options?) signature.");
      }
    }

    var warnInvalidSource = function warnInvalidSource(s) {
      warn$1("Invalid watch source: ", s, "A watch source can only be a getter/effect function, a ref, " + "a reactive object, or an array of these types.");
    };

    var getter;
    var forceTrigger = false;

    if (isRef$1(source)) {
      getter = function getter() {
        return source.value;
      };

      forceTrigger = !!source._shallow;
    } else if (isReactive$1(source)) {
      getter = function getter() {
        return source;
      };

      deep = true;
    } else if (isArray$1(source)) {
      getter = function getter() {
        return source.map(function (s) {
          if (isRef$1(s)) {
            return s.value;
          } else if (isReactive$1(s)) {
            return traverse$1(s);
          } else if (isFunction$1(s)) {
            return callWithErrorHandling$1(s, instance, 2
            /* WATCH_GETTER */
            );
          } else {
            process.env.NODE_ENV !== 'production' && warnInvalidSource(s);
          }
        });
      };
    } else if (isFunction$1(source)) {
      if (cb) {
        // getter with cb
        getter = function getter() {
          return callWithErrorHandling$1(source, instance, 2
          /* WATCH_GETTER */
          );
        };
      } else {
        // no cb -> simple effect
        getter = function getter() {
          if (instance && instance.isUnmounted) {
            return;
          }

          if (cleanup) {
            cleanup();
          }

          return callWithErrorHandling$1(source, instance, 3
          /* WATCH_CALLBACK */
          , [onInvalidate]);
        };
      }
    } else {
      getter = NOOP$1;
      process.env.NODE_ENV !== 'production' && warnInvalidSource(source);
    }

    if (cb && deep) {
      var baseGetter = getter;

      getter = function getter() {
        return traverse$1(baseGetter());
      };
    }

    var cleanup;

    var onInvalidate = function onInvalidate(fn) {
      cleanup = runner.options.onStop = function () {
        callWithErrorHandling$1(fn, instance, 4
        /* WATCH_CLEANUP */
        );
      };
    };

    var oldValue = isArray$1(source) ? [] : INITIAL_WATCHER_VALUE$1;

    var job = function job() {
      if (!runner.active) {
        return;
      }

      if (cb) {
        // watch(source, cb)
        var newValue = runner();

        if (deep || forceTrigger || hasChanged$1(newValue, oldValue)) {
          // cleanup before running cb again
          if (cleanup) {
            cleanup();
          }

          callWithAsyncErrorHandling$1(cb, instance, 3
          /* WATCH_CALLBACK */
          , [newValue, // pass undefined as the old value when it's changed for the first time
          oldValue === INITIAL_WATCHER_VALUE$1 ? undefined : oldValue, onInvalidate]);
          oldValue = newValue;
        }
      } else {
        // watchEffect
        runner();
      }
    }; // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)


    job.allowRecurse = !!cb;
    var scheduler;

    if (flush === 'sync') {
      scheduler = job;
    } else if (flush === 'post') {
      scheduler = function scheduler() {
        return queuePostRenderEffect$1(job, instance && instance.suspense);
      };
    } else {
      // default: 'pre'
      scheduler = function scheduler() {
        if (!instance || instance.isMounted) {
          queuePreFlushCb$1(job);
        } else {
          // with 'pre' option, the first call must happen before
          // the component is mounted so it is called synchronously.
          job();
        }
      };
    }

    var runner = effect$1(getter, {
      lazy: true,
      onTrack: onTrack,
      onTrigger: onTrigger,
      scheduler: scheduler
    });
    recordInstanceBoundEffect$1(runner, instance); // initial run

    if (cb) {
      if (immediate) {
        job();
      } else {
        oldValue = runner();
      }
    } else if (flush === 'post') {
      queuePostRenderEffect$1(runner, instance && instance.suspense);
    } else {
      runner();
    }

    return function () {
      stop$1(runner);

      if (instance) {
        remove$1(instance.effects, runner);
      }
    };
  } // this.$watch


  function instanceWatch$1(source, cb, options) {
    var publicThis = this.proxy;
    var getter = isString$1(source) ? function () {
      return publicThis[source];
    } : source.bind(publicThis);
    return doWatch$1(getter, cb.bind(publicThis), options, this);
  }

  function traverse$1(value) {
    var seen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

    if (!isObject$1(value) || seen.has(value)) {
      return value;
    }

    seen.add(value);

    if (isRef$1(value)) {
      traverse$1(value.value, seen);
    } else if (isArray$1(value)) {
      for (var i = 0; i < value.length; i++) {
        traverse$1(value[i], seen);
      }
    } else if (isSet$1(value) || isMap$1(value)) {
      value.forEach(function (v) {
        traverse$1(v, seen);
      });
    } else {
      for (var key in value) {
        traverse$1(value[key], seen);
      }
    }

    return value;
  }

  var queuePostRenderEffect$1 = queueEffectWithSuspense$1;

  var isTeleport$1 = function isTeleport(type) {
    return type.__isTeleport;
  };

  var NULL_DYNAMIC_COMPONENT$1 = Symbol();
  var Fragment$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'Fragment' : undefined);
  var Text$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'Text' : undefined);
  var Comment$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'Comment' : undefined);
  var Static$1 = Symbol(process.env.NODE_ENV !== 'production' ? 'Static' : undefined);
  var currentBlock$1 = null; // Whether we should be tracking dynamic child nodes inside a block.

  function isVNode$1(value) {
    return value ? value.__v_isVNode === true : false;
  }

  var createVNodeWithArgsTransform$1 = function createVNodeWithArgsTransform() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return _createVNode$1.apply(void 0, _toConsumableArray( args));
  };

  var InternalObjectKey$1 = "__vInternal";

  var normalizeKey$1 = function normalizeKey(_ref8) {
    var key = _ref8.key;
    return key != null ? key : null;
  };

  var normalizeRef$1 = function normalizeRef(_ref9) {
    var ref = _ref9.ref;
    return ref != null ? isString$1(ref) || isRef$1(ref) || isFunction$1(ref) ? {
      i: currentRenderingInstance$1,
      r: ref
    } : ref : null;
  };

  var createVNode$1 = process.env.NODE_ENV !== 'production' ? createVNodeWithArgsTransform$1 : _createVNode$1;

  function _createVNode$1(type) {
    var _vnode;

    var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var patchFlag = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var dynamicProps = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var isBlockNode = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    if (!type || type === NULL_DYNAMIC_COMPONENT$1) {
      if (process.env.NODE_ENV !== 'production' && !type) {
        warn$1("Invalid vnode type when creating vnode: ".concat(type, "."));
      }

      type = Comment$1;
    }

    if (isVNode$1(type)) {
      // createVNode receiving an existing vnode. This happens in cases like
      // <component :is="vnode"/>
      // #2078 make sure to merge refs during the clone instead of overwriting it
      var cloned = cloneVNode$1(type, props, true
      /* mergeRef: true */
      );

      if (children) {
        normalizeChildren$1(cloned, children);
      }

      return cloned;
    } // class component normalization.


    if (isClassComponent$1(type)) {
      type = type.__vccOpts;
    } // class & style normalization.


    if (props) {
      // for reactive or proxy objects, we need to clone it to enable mutation.
      if (isProxy$1(props) || InternalObjectKey$1 in props) {
        props = extend$1({}, props);
      }

      var _props = props,
          klass = _props.class,
          style = _props.style;

      if (klass && !isString$1(klass)) {
        props.class = normalizeClass$1(klass);
      }

      if (isObject$1(style)) {
        // reactive state objects need to be cloned since they are likely to be
        // mutated
        if (isProxy$1(style) && !isArray$1(style)) {
          style = extend$1({}, style);
        }

        props.style = normalizeStyle$1(style);
      }
    } // encode the vnode type information into a bitmap


    var shapeFlag = isString$1(type) ? 1
    /* ELEMENT */
    : isSuspense$1(type) ? 128
    /* SUSPENSE */
    : isTeleport$1(type) ? 64
    /* TELEPORT */
    : isObject$1(type) ? 4
    /* STATEFUL_COMPONENT */
    : isFunction$1(type) ? 2
    /* FUNCTIONAL_COMPONENT */
    : 0;

    if (process.env.NODE_ENV !== 'production' && shapeFlag & 4
    /* STATEFUL_COMPONENT */
    && isProxy$1(type)) {
      type = toRaw$1(type);
      warn$1("Vue received a Component which was made a reactive object. This can " + "lead to unnecessary performance overhead, and should be avoided by " + "marking the component with `markRaw` or using `shallowRef` " + "instead of `ref`.", "\nComponent that was made reactive: ", type);
    }

    var vnode = (_vnode = {
      __v_isVNode: true
    }, _defineProperty(_vnode, "__v_skip"
    /* SKIP */
    , true), _defineProperty(_vnode, "type", type), _defineProperty(_vnode, "props", props), _defineProperty(_vnode, "key", props && normalizeKey$1(props)), _defineProperty(_vnode, "ref", props && normalizeRef$1(props)), _defineProperty(_vnode, "scopeId", currentScopeId$1), _defineProperty(_vnode, "children", null), _defineProperty(_vnode, "component", null), _defineProperty(_vnode, "suspense", null), _defineProperty(_vnode, "ssContent", null), _defineProperty(_vnode, "ssFallback", null), _defineProperty(_vnode, "dirs", null), _defineProperty(_vnode, "transition", null), _defineProperty(_vnode, "el", null), _defineProperty(_vnode, "anchor", null), _defineProperty(_vnode, "target", null), _defineProperty(_vnode, "targetAnchor", null), _defineProperty(_vnode, "staticCount", 0), _defineProperty(_vnode, "shapeFlag", shapeFlag), _defineProperty(_vnode, "patchFlag", patchFlag), _defineProperty(_vnode, "dynamicProps", dynamicProps), _defineProperty(_vnode, "dynamicChildren", null), _defineProperty(_vnode, "appContext", null), _vnode); // validate key

    if (process.env.NODE_ENV !== 'production' && vnode.key !== vnode.key) {
      warn$1("VNode created with invalid key (NaN). VNode type:", vnode.type);
    }

    normalizeChildren$1(vnode, children); // normalize suspense children

    if (shapeFlag & 128
    /* SUSPENSE */
    ) {
        var _normalizeSuspenseChi = normalizeSuspenseChildren$1(vnode),
            content = _normalizeSuspenseChi.content,
            fallback = _normalizeSuspenseChi.fallback;

        vnode.ssContent = content;
        vnode.ssFallback = fallback;
      }

    if ( // avoid a block node from tracking itself
    !isBlockNode && // has current parent block
    currentBlock$1 && ( // presence of a patch flag indicates this node needs patching on updates.
    // component nodes also should always be patched, because even if the
    // component doesn't need to update, it needs to persist the instance on to
    // the next vnode so that it can be properly unmounted later.
    patchFlag > 0 || shapeFlag & 6
    /* COMPONENT */
    ) && // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    patchFlag !== 32
    /* HYDRATE_EVENTS */
    ) {
        currentBlock$1.push(vnode);
      }

    return vnode;
  }

  function cloneVNode$1(vnode, extraProps) {
    var _ref10;

    var mergeRef = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    // This is intentionally NOT using spread or extend to avoid the runtime
    // key enumeration cost.
    var props = vnode.props,
        ref = vnode.ref,
        patchFlag = vnode.patchFlag;
    var mergedProps = extraProps ? mergeProps$1(props || {}, extraProps) : props;
    return _ref10 = {
      __v_isVNode: true
    }, _defineProperty(_ref10, "__v_skip"
    /* SKIP */
    , true), _defineProperty(_ref10, "type", vnode.type), _defineProperty(_ref10, "props", mergedProps), _defineProperty(_ref10, "key", mergedProps && normalizeKey$1(mergedProps)), _defineProperty(_ref10, "ref", extraProps && extraProps.ref ? // #2078 in the case of <component :is="vnode" ref="extra"/>
    // if the vnode itself already has a ref, cloneVNode will need to merge
    // the refs so the single vnode can be set on multiple refs
    mergeRef && ref ? isArray$1(ref) ? ref.concat(normalizeRef$1(extraProps)) : [ref, normalizeRef$1(extraProps)] : normalizeRef$1(extraProps) : ref), _defineProperty(_ref10, "scopeId", vnode.scopeId), _defineProperty(_ref10, "children", vnode.children), _defineProperty(_ref10, "target", vnode.target), _defineProperty(_ref10, "targetAnchor", vnode.targetAnchor), _defineProperty(_ref10, "staticCount", vnode.staticCount), _defineProperty(_ref10, "shapeFlag", vnode.shapeFlag), _defineProperty(_ref10, "patchFlag", extraProps && vnode.type !== Fragment$1 ? patchFlag === -1 // hoisted node
    ? 16
    /* FULL_PROPS */
    : patchFlag | 16
    /* FULL_PROPS */
    : patchFlag), _defineProperty(_ref10, "dynamicProps", vnode.dynamicProps), _defineProperty(_ref10, "dynamicChildren", vnode.dynamicChildren), _defineProperty(_ref10, "appContext", vnode.appContext), _defineProperty(_ref10, "dirs", vnode.dirs), _defineProperty(_ref10, "transition", vnode.transition), _defineProperty(_ref10, "component", vnode.component), _defineProperty(_ref10, "suspense", vnode.suspense), _defineProperty(_ref10, "ssContent", vnode.ssContent && cloneVNode$1(vnode.ssContent)), _defineProperty(_ref10, "ssFallback", vnode.ssFallback && cloneVNode$1(vnode.ssFallback)), _defineProperty(_ref10, "el", vnode.el), _defineProperty(_ref10, "anchor", vnode.anchor), _ref10;
  }
  /**
   * @private
   */


  function createTextVNode$1() {
    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ' ';
    var flag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return createVNode$1(Text$1, null, text, flag);
  }

  function normalizeVNode$1(child) {
    if (child == null || typeof child === 'boolean') {
      // empty placeholder
      return createVNode$1(Comment$1);
    } else if (isArray$1(child)) {
      // fragment
      return createVNode$1(Fragment$1, null, child);
    } else if (_typeof(child) === 'object') {
      // already vnode, this should be the most common since compiled templates
      // always produce all-vnode children arrays
      return child.el === null ? child : cloneVNode$1(child);
    } else {
      // strings and numbers
      return createVNode$1(Text$1, null, String(child));
    }
  }

  function normalizeChildren$1(vnode, children) {
    var type = 0;
    var shapeFlag = vnode.shapeFlag;

    if (children == null) {
      children = null;
    } else if (isArray$1(children)) {
      type = 16
      /* ARRAY_CHILDREN */
      ;
    } else if (_typeof(children) === 'object') {
      if (shapeFlag & 1
      /* ELEMENT */
      || shapeFlag & 64
      /* TELEPORT */
      ) {
          // Normalize slot to plain children for plain element and Teleport
          var slot = children.default;

          if (slot) {
            // _c marker is added by withCtx() indicating this is a compiled slot
            slot._c && setCompiledSlotRendering$1(1);
            normalizeChildren$1(vnode, slot());
            slot._c && setCompiledSlotRendering$1(-1);
          }

          return;
        } else {
        type = 32
        /* SLOTS_CHILDREN */
        ;
        var slotFlag = children._;

        if (!slotFlag && !(InternalObjectKey$1 in children)) {
          children._ctx = currentRenderingInstance$1;
        } else if (slotFlag === 3
        /* FORWARDED */
        && currentRenderingInstance$1) {
          // a child component receives forwarded slots from the parent.
          // its slot type is determined by its parent's slot type.
          if (currentRenderingInstance$1.vnode.patchFlag & 1024
          /* DYNAMIC_SLOTS */
          ) {
              children._ = 2
              /* DYNAMIC */
              ;
              vnode.patchFlag |= 1024
              /* DYNAMIC_SLOTS */
              ;
            } else {
            children._ = 1
            /* STABLE */
            ;
          }
        }
      }
    } else if (isFunction$1(children)) {
      children = {
        default: children,
        _ctx: currentRenderingInstance$1
      };
      type = 32
      /* SLOTS_CHILDREN */
      ;
    } else {
      children = String(children); // force teleport children to array so it can be moved around

      if (shapeFlag & 64
      /* TELEPORT */
      ) {
          type = 16
          /* ARRAY_CHILDREN */
          ;
          children = [createTextVNode$1(children)];
        } else {
        type = 8
        /* TEXT_CHILDREN */
        ;
      }
    }

    vnode.children = children;
    vnode.shapeFlag |= type;
  }

  function mergeProps$1() {
    var ret = extend$1({}, arguments.length <= 0 ? undefined : arguments[0]);

    for (var i = 1; i < arguments.length; i++) {
      var toMerge = i < 0 || arguments.length <= i ? undefined : arguments[i];

      for (var key in toMerge) {
        if (key === 'class') {
          if (ret.class !== toMerge.class) {
            ret.class = normalizeClass$1([ret.class, toMerge.class]);
          }
        } else if (key === 'style') {
          ret.style = normalizeStyle$1([ret.style, toMerge.style]);
        } else if (isOn$1(key)) {
          var existing = ret[key];
          var incoming = toMerge[key];

          if (existing !== incoming) {
            ret[key] = existing ? [].concat(existing, toMerge[key]) : incoming;
          }
        } else if (key !== '') {
          ret[key] = toMerge[key];
        }
      }
    }

    return ret;
  }

  var isInBeforeCreate$1 = false;

  function resolveMergedOptions$1(instance) {
    var raw = instance.type;
    var __merged = raw.__merged,
        mixins = raw.mixins,
        extendsOptions = raw.extends;
    if (__merged) return __merged;
    var globalMixins = instance.appContext.mixins;
    if (!globalMixins.length && !mixins && !extendsOptions) return raw;
    var options = {};
    globalMixins.forEach(function (m) {
      return mergeOptions$1(options, m, instance);
    });
    mergeOptions$1(options, raw, instance);
    return raw.__merged = options;
  }

  function mergeOptions$1(to, from, instance) {
    var strats = instance.appContext.config.optionMergeStrategies;
    var mixins = from.mixins,
        extendsOptions = from.extends;
    extendsOptions && mergeOptions$1(to, extendsOptions, instance);
    mixins && mixins.forEach(function (m) {
      return mergeOptions$1(to, m, instance);
    });

    for (var key in from) {
      if (strats && hasOwn$1(strats, key)) {
        to[key] = strats[key](to[key], from[key], instance.proxy, key);
      } else {
        to[key] = from[key];
      }
    }
  }
  /**
   * #2437 In Vue 3, functional components do not have a public instance proxy but
   * they exist in the internal parent chain. For code that relies on traversing
   * public $parent chains, skip functional ones and go to the parent instead.
   */


  var getPublicInstance$1 = function getPublicInstance(i) {
    return i && (i.proxy ? i.proxy : getPublicInstance(i.parent));
  };

  var publicPropertiesMap$1 = extend$1(Object.create(null), {
    $: function $(i) {
      return i;
    },
    $el: function $el(i) {
      return i.vnode.el;
    },
    $data: function $data(i) {
      return i.data;
    },
    $props: function $props(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly$1(i.props) : i.props;
    },
    $attrs: function $attrs(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly$1(i.attrs) : i.attrs;
    },
    $slots: function $slots(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly$1(i.slots) : i.slots;
    },
    $refs: function $refs(i) {
      return process.env.NODE_ENV !== 'production' ? shallowReadonly$1(i.refs) : i.refs;
    },
    $parent: function $parent(i) {
      return getPublicInstance$1(i.parent);
    },
    $root: function $root(i) {
      return i.root && i.root.proxy;
    },
    $emit: function $emit(i) {
      return i.emit;
    },
    $options: function $options(i) {
      return __VUE_OPTIONS_API__ ? resolveMergedOptions$1(i) : i.type;
    },
    $forceUpdate: function $forceUpdate(i) {
      return function () {
        return queueJob$1(i.update);
      };
    },
    $nextTick: function $nextTick(i) {
      return nextTick$1.bind(i.proxy);
    },
    $watch: function $watch(i) {
      return __VUE_OPTIONS_API__ ? instanceWatch$1.bind(i) : NOOP$1;
    }
  });
  var PublicInstanceProxyHandlers$1 = {
    get: function get(_ref11, key) {
      var instance = _ref11._;
      var ctx = instance.ctx,
          setupState = instance.setupState,
          data = instance.data,
          props = instance.props,
          accessCache = instance.accessCache,
          type = instance.type,
          appContext = instance.appContext; // let @vue/reactivity know it should never observe Vue public instances.

      if (key === "__v_skip"
      /* SKIP */
      ) {
          return true;
        } // for internal formatters to know that this is a Vue instance


      if (process.env.NODE_ENV !== 'production' && key === '__isVue') {
        return true;
      } // data / props / ctx
      // This getter gets called for every property access on the render context
      // during render and is a major hotspot. The most expensive part of this
      // is the multiple hasOwn() calls. It's much faster to do a simple property
      // access on a plain object, so we use an accessCache object (with null
      // prototype) to memoize what access type a key corresponds to.


      var normalizedProps;

      if (key[0] !== '$') {
        var n = accessCache[key];

        if (n !== undefined) {
          switch (n) {
            case 0
            /* SETUP */
            :
              return setupState[key];

            case 1
            /* DATA */
            :
              return data[key];

            case 3
            /* CONTEXT */
            :
              return ctx[key];

            case 2
            /* PROPS */
            :
              return props[key];
            // default: just fallthrough
          }
        } else if (setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key)) {
          accessCache[key] = 0
          /* SETUP */
          ;
          return setupState[key];
        } else if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
          accessCache[key] = 1
          /* DATA */
          ;
          return data[key];
        } else if ( // only cache other properties when instance has declared (thus stable)
        // props
        (normalizedProps = instance.propsOptions[0]) && hasOwn$1(normalizedProps, key)) {
          accessCache[key] = 2
          /* PROPS */
          ;
          return props[key];
        } else if (ctx !== EMPTY_OBJ$1 && hasOwn$1(ctx, key)) {
          accessCache[key] = 3
          /* CONTEXT */
          ;
          return ctx[key];
        } else if (!__VUE_OPTIONS_API__ || !isInBeforeCreate$1) {
          accessCache[key] = 4
          /* OTHER */
          ;
        }
      }

      var publicGetter = publicPropertiesMap$1[key];
      var cssModule, globalProperties; // public $xxx properties

      if (publicGetter) {
        if (key === '$attrs') {
          track$1(instance, "get"
          /* GET */
          , key);
          process.env.NODE_ENV !== 'production' && markAttrsAccessed$1();
        }

        return publicGetter(instance);
      } else if ( // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])) {
        return cssModule;
      } else if (ctx !== EMPTY_OBJ$1 && hasOwn$1(ctx, key)) {
        // user may set custom properties to `this` that start with `$`
        accessCache[key] = 3
        /* CONTEXT */
        ;
        return ctx[key];
      } else if ( // global properties
      globalProperties = appContext.config.globalProperties, hasOwn$1(globalProperties, key)) {
        return globalProperties[key];
      } else if (process.env.NODE_ENV !== 'production' && currentRenderingInstance$1 && (!isString$1(key) || // #1091 avoid internal isRef/isVNode checks on component instance leading
      // to infinite warning loop
      key.indexOf('__v') !== 0)) {
        if (data !== EMPTY_OBJ$1 && (key[0] === '$' || key[0] === '_') && hasOwn$1(data, key)) {
          warn$1("Property ".concat(JSON.stringify(key), " must be accessed via $data because it starts with a reserved ") + "character (\"$\" or \"_\") and is not proxied on the render context.");
        } else {
          warn$1("Property ".concat(JSON.stringify(key), " was accessed during render ") + "but is not defined on instance.");
        }
      }
    },
    set: function set(_ref12, key, value) {
      var instance = _ref12._;
      var data = instance.data,
          setupState = instance.setupState,
          ctx = instance.ctx;

      if (setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key)) {
        setupState[key] = value;
      } else if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
        data[key] = value;
      } else if (key in instance.props) {
        process.env.NODE_ENV !== 'production' && warn$1("Attempting to mutate prop \"".concat(key, "\". Props are readonly."), instance);
        return false;
      }

      if (key[0] === '$' && key.slice(1) in instance) {
        process.env.NODE_ENV !== 'production' && warn$1("Attempting to mutate public property \"".concat(key, "\". ") + "Properties starting with $ are reserved and readonly.", instance);
        return false;
      } else {
        if (process.env.NODE_ENV !== 'production' && key in instance.appContext.config.globalProperties) {
          Object.defineProperty(ctx, key, {
            enumerable: true,
            configurable: true,
            value: value
          });
        } else {
          ctx[key] = value;
        }
      }

      return true;
    },
    has: function has(_ref13, key) {
      var _ref13$_ = _ref13._,
          data = _ref13$_.data,
          setupState = _ref13$_.setupState,
          accessCache = _ref13$_.accessCache,
          ctx = _ref13$_.ctx,
          appContext = _ref13$_.appContext,
          propsOptions = _ref13$_.propsOptions;
      var normalizedProps;
      return accessCache[key] !== undefined || data !== EMPTY_OBJ$1 && hasOwn$1(data, key) || setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key) || (normalizedProps = propsOptions[0]) && hasOwn$1(normalizedProps, key) || hasOwn$1(ctx, key) || hasOwn$1(publicPropertiesMap$1, key) || hasOwn$1(appContext.config.globalProperties, key);
    }
  };

  if (process.env.NODE_ENV !== 'production' && !false) {
    PublicInstanceProxyHandlers$1.ownKeys = function (target) {
      warn$1("Avoid app logic that relies on enumerating keys on a component instance. " + "The keys will be empty in production mode to avoid performance overhead.");
      return Reflect.ownKeys(target);
    };
  }

  var RuntimeCompiledPublicInstanceProxyHandlers$1 = extend$1({}, PublicInstanceProxyHandlers$1, {
    get: function get(target, key) {
      // fast path for unscopables when using `with` block
      if (key === Symbol.unscopables) {
        return;
      }

      return PublicInstanceProxyHandlers$1.get(target, key, target);
    },
    has: function has(_, key) {
      var has = key[0] !== '_' && !isGloballyWhitelisted$1(key);

      if (process.env.NODE_ENV !== 'production' && !has && PublicInstanceProxyHandlers$1.has(_, key)) {
        warn$1("Property ".concat(JSON.stringify(key), " should not start with _ which is a reserved prefix for Vue internals."));
      }

      return has;
    }
  });
  var currentInstance$1 = null; // record effects created during a component's setup() so that they can be
  // stopped when the component unmounts

  function recordInstanceBoundEffect$1(effect) {
    var instance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : currentInstance$1;

    if (instance) {
      (instance.effects || (instance.effects = [])).push(effect);
    }
  }

  var classifyRE$1 = /(?:^|[-_])(\w)/g;

  var classify$1 = function classify(str) {
    return str.replace(classifyRE$1, function (c) {
      return c.toUpperCase();
    }).replace(/[-_]/g, '');
  };
  /* istanbul ignore next */


  function formatComponentName$1(instance, Component) {
    var isRoot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var name = isFunction$1(Component) ? Component.displayName || Component.name : Component.name;

    if (!name && Component.__file) {
      var match = Component.__file.match(/([^/\\]+)\.\w+$/);

      if (match) {
        name = match[1];
      }
    }

    if (!name && instance && instance.parent) {
      // try to infer the name based on reverse resolution
      var inferFromRegistry = function inferFromRegistry(registry) {
        for (var key in registry) {
          if (registry[key] === Component) {
            return key;
          }
        }
      };

      name = inferFromRegistry(instance.components || instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }

    return name ? classify$1(name) : isRoot ? "App" : "Anonymous";
  }

  function isClassComponent$1(value) {
    return isFunction$1(value) && '__vccOpts' in value;
  }

  var ssrContextKey$1 = Symbol(process.env.NODE_ENV !== 'production' ? "ssrContext" : "");

  function initCustomFormatter$1() {
    /* eslint-disable no-restricted-globals */
    if (!(process.env.NODE_ENV !== 'production') || typeof window === 'undefined') {
      return;
    }

    var vueStyle = {
      style: 'color:#3ba776'
    };
    var numberStyle = {
      style: 'color:#0b1bc9'
    };
    var stringStyle = {
      style: 'color:#b62e24'
    };
    var keywordStyle = {
      style: 'color:#9d288c'
    }; // custom formatter for Chrome
    // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html

    var formatter = {
      header: function header(obj) {
        // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
        if (!isObject$1(obj)) {
          return null;
        }

        if (obj.__isVue) {
          return ['div', vueStyle, "VueInstance"];
        } else if (isRef$1(obj)) {
          return ['div', {}, ['span', vueStyle, genRefFlag(obj)], '<', formatValue(obj.value), ">"];
        } else if (isReactive$1(obj)) {
          return ['div', {}, ['span', vueStyle, 'Reactive'], '<', formatValue(obj), ">".concat(isReadonly$1(obj) ? " (readonly)" : "")];
        } else if (isReadonly$1(obj)) {
          return ['div', {}, ['span', vueStyle, 'Readonly'], '<', formatValue(obj), '>'];
        }

        return null;
      },
      hasBody: function hasBody(obj) {
        return obj && obj.__isVue;
      },
      body: function body(obj) {
        if (obj && obj.__isVue) {
          return ['div', {}].concat(_toConsumableArray(formatInstance(obj.$)));
        }
      }
    };

    function formatInstance(instance) {
      var blocks = [];

      if (instance.type.props && instance.props) {
        blocks.push(createInstanceBlock('props', toRaw$1(instance.props)));
      }

      if (instance.setupState !== EMPTY_OBJ$1) {
        blocks.push(createInstanceBlock('setup', instance.setupState));
      }

      if (instance.data !== EMPTY_OBJ$1) {
        blocks.push(createInstanceBlock('data', toRaw$1(instance.data)));
      }

      var computed = extractKeys(instance, 'computed');

      if (computed) {
        blocks.push(createInstanceBlock('computed', computed));
      }

      var injected = extractKeys(instance, 'inject');

      if (injected) {
        blocks.push(createInstanceBlock('injected', injected));
      }

      blocks.push(['div', {}, ['span', {
        style: keywordStyle.style + ';opacity:0.66'
      }, '$ (internal): '], ['object', {
        object: instance
      }]]);
      return blocks;
    }

    function createInstanceBlock(type, target) {
      target = extend$1({}, target);

      if (!Object.keys(target).length) {
        return ['span', {}];
      }

      return ['div', {
        style: 'line-height:1.25em;margin-bottom:0.6em'
      }, ['div', {
        style: 'color:#476582'
      }, type], ['div', {
        style: 'padding-left:1.25em'
      }].concat(_toConsumableArray(Object.keys(target).map(function (key) {
        return ['div', {}, ['span', keywordStyle, key + ': '], formatValue(target[key], false)];
      })))];
    }

    function formatValue(v) {
      var asRaw = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (typeof v === 'number') {
        return ['span', numberStyle, v];
      } else if (typeof v === 'string') {
        return ['span', stringStyle, JSON.stringify(v)];
      } else if (typeof v === 'boolean') {
        return ['span', keywordStyle, v];
      } else if (isObject$1(v)) {
        return ['object', {
          object: asRaw ? toRaw$1(v) : v
        }];
      } else {
        return ['span', stringStyle, String(v)];
      }
    }

    function extractKeys(instance, type) {
      var Comp = instance.type;

      if (isFunction$1(Comp)) {
        return;
      }

      var extracted = {};

      for (var key in instance.ctx) {
        if (isKeyOfType(Comp, key, type)) {
          extracted[key] = instance.ctx[key];
        }
      }

      return extracted;
    }

    function isKeyOfType(Comp, key, type) {
      var opts = Comp[type];

      if (isArray$1(opts) && opts.includes(key) || isObject$1(opts) && key in opts) {
        return true;
      }

      if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
        return true;
      }

      if (Comp.mixins && Comp.mixins.some(function (m) {
        return isKeyOfType(m, key, type);
      })) {
        return true;
      }
    }

    function genRefFlag(v) {
      if (v._shallow) {
        return "ShallowRef";
      }

      if (v.effect) {
        return "ComputedRef";
      }

      return "Ref";
    }

    if (window.devtoolsFormatters) {
      window.devtoolsFormatters.push(formatter);
    } else {
      window.devtoolsFormatters = [formatter];
    }
  }

  var svgNS = 'http://www.w3.org/2000/svg';
  var doc = typeof document !== 'undefined' ? document : null;
  var tempContainer;
  var tempSVGContainer;
  var nodeOps = {
    insert: function insert(child, parent, anchor) {
      parent.insertBefore(child, anchor || null);
    },
    remove: function remove(child) {
      var parent = child.parentNode;

      if (parent) {
        parent.removeChild(child);
      }
    },
    createElement: function createElement(tag, isSVG, is) {
      return isSVG ? doc.createElementNS(svgNS, tag) : doc.createElement(tag, is ? {
        is: is
      } : undefined);
    },
    createText: function createText(text) {
      return doc.createTextNode(text);
    },
    createComment: function createComment(text) {
      return doc.createComment(text);
    },
    setText: function setText(node, text) {
      node.nodeValue = text;
    },
    setElementText: function setElementText(el, text) {
      el.textContent = text;
    },
    parentNode: function parentNode(node) {
      return node.parentNode;
    },
    nextSibling: function nextSibling(node) {
      return node.nextSibling;
    },
    querySelector: function querySelector(selector) {
      return doc.querySelector(selector);
    },
    setScopeId: function setScopeId(el, id) {
      el.setAttribute(id, '');
    },
    cloneNode: function cloneNode(el) {
      return el.cloneNode(true);
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent: function insertStaticContent(content, parent, anchor, isSVG) {
      var temp = isSVG ? tempSVGContainer || (tempSVGContainer = doc.createElementNS(svgNS, 'svg')) : tempContainer || (tempContainer = doc.createElement('div'));
      temp.innerHTML = content;
      var first = temp.firstChild;
      var node = first;
      var last = node;

      while (node) {
        last = node;
        nodeOps.insert(node, parent, anchor);
        node = temp.firstChild;
      }

      return [first, last];
    }
  }; // compiler should normalize class + :class bindings on the same element
  // into a single binding ['staticClass', dynamic]

  function patchClass(el, value, isSVG) {
    if (value == null) {
      value = '';
    }

    if (isSVG) {
      el.setAttribute('class', value);
    } else {
      // directly setting className should be faster than setAttribute in theory
      // if this is an element during a transition, take the temporary transition
      // classes into account.
      var transitionClasses = el._vtc;

      if (transitionClasses) {
        value = (value ? [value].concat(_toConsumableArray(transitionClasses)) : _toConsumableArray(transitionClasses)).join(' ');
      }

      el.className = value;
    }
  }

  function patchStyle(el, prev, next) {
    var style = el.style;

    if (!next) {
      el.removeAttribute('style');
    } else if (isString$1(next)) {
      if (prev !== next) {
        style.cssText = next;
      }
    } else {
      for (var key in next) {
        setStyle(style, key, next[key]);
      }

      if (prev && !isString$1(prev)) {
        for (var _key6 in prev) {
          if (next[_key6] == null) {
            setStyle(style, _key6, '');
          }
        }
      }
    }
  }

  var importantRE = /\s*!important$/;

  function setStyle(style, name, val) {
    if (isArray$1(val)) {
      val.forEach(function (v) {
        return setStyle(style, name, v);
      });
    } else {
      if (name.startsWith('--')) {
        // custom property definition
        style.setProperty(name, val);
      } else {
        var prefixed = autoPrefix(style, name);

        if (importantRE.test(val)) {
          // !important
          style.setProperty(hyphenate(prefixed), val.replace(importantRE, ''), 'important');
        } else {
          style[prefixed] = val;
        }
      }
    }
  }

  var prefixes = ['Webkit', 'Moz', 'ms'];
  var prefixCache = {};

  function autoPrefix(style, rawName) {
    var cached = prefixCache[rawName];

    if (cached) {
      return cached;
    }

    var name = camelize(rawName);

    if (name !== 'filter' && name in style) {
      return prefixCache[rawName] = name;
    }

    name = capitalize$1(name);

    for (var i = 0; i < prefixes.length; i++) {
      var prefixed = prefixes[i] + name;

      if (prefixed in style) {
        return prefixCache[rawName] = prefixed;
      }
    }

    return rawName;
  }

  var xlinkNS = 'http://www.w3.org/1999/xlink';

  function patchAttr(el, key, value, isSVG) {
    if (isSVG && key.startsWith('xlink:')) {
      if (value == null) {
        el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      // note we are only checking boolean attributes that don't have a
      // corresponding dom prop of the same name here.
      var isBoolean = isSpecialBooleanAttr(key);

      if (value == null || isBoolean && value === false) {
        el.removeAttribute(key);
      } else {
        el.setAttribute(key, isBoolean ? '' : value);
      }
    }
  } // __UNSAFE__
  // functions. The user is responsible for using them with only trusted content.


  function patchDOMProp(el, key, value, // the following args are passed only due to potential innerHTML/textContent
  // overriding existing VNodes, in which case the old tree must be properly
  // unmounted.
  prevChildren, parentComponent, parentSuspense, unmountChildren) {
    if (key === 'innerHTML' || key === 'textContent') {
      if (prevChildren) {
        unmountChildren(prevChildren, parentComponent, parentSuspense);
      }

      el[key] = value == null ? '' : value;
      return;
    }

    if (key === 'value' && el.tagName !== 'PROGRESS') {
      // store value as _value as well since
      // non-string values will be stringified.
      el._value = value;
      var newValue = value == null ? '' : value;

      if (el.value !== newValue) {
        el.value = newValue;
      }

      return;
    }

    if (value === '' || value == null) {
      var type = _typeof(el[key]);

      if (value === '' && type === 'boolean') {
        // e.g. <select multiple> compiles to { multiple: '' }
        el[key] = true;
        return;
      } else if (value == null && type === 'string') {
        // e.g. <div :id="null">
        el[key] = '';
        el.removeAttribute(key);
        return;
      } else if (type === 'number') {
        // e.g. <img :width="null">
        el[key] = 0;
        el.removeAttribute(key);
        return;
      }
    } // some properties perform value validation and throw


    try {
      el[key] = value;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        warn$1("Failed setting prop \"".concat(key, "\" on <").concat(el.tagName.toLowerCase(), ">: ") + "value ".concat(value, " is invalid."), e);
      }
    }
  } // Async edge case fix requires storing an event listener's attach timestamp.


  var _getNow = Date.now; // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.

  if (typeof document !== 'undefined' && _getNow() > document.createEvent('Event').timeStamp) {
    // if the low-res timestamp which is bigger than the event timestamp
    // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listeners as well.
    _getNow = function _getNow() {
      return performance.now();
    };
  } // To avoid the overhead of repeatedly calling performance.now(), we cache
  // and use the same timestamp for all event listeners attached in the same tick.


  var cachedNow = 0;
  var p = Promise.resolve();

  var reset = function reset() {
    cachedNow = 0;
  };

  var getNow = function getNow() {
    return cachedNow || (p.then(reset), cachedNow = _getNow());
  };

  function addEventListener(el, event, handler, options) {
    el.addEventListener(event, handler, options);
  }

  function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
  }

  function patchEvent(el, rawName, prevValue, nextValue) {
    var instance = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    // vei = vue event invokers
    var invokers = el._vei || (el._vei = {});
    var existingInvoker = invokers[rawName];

    if (nextValue && existingInvoker) {
      // patch
      existingInvoker.value = nextValue;
    } else {
      var _parseName = parseName(rawName),
          _parseName2 = _slicedToArray(_parseName, 2),
          name = _parseName2[0],
          options = _parseName2[1];

      if (nextValue) {
        // add
        var invoker = invokers[rawName] = createInvoker(nextValue, instance);
        addEventListener(el, name, invoker, options);
      } else if (existingInvoker) {
        // remove
        removeEventListener(el, name, existingInvoker, options);
        invokers[rawName] = undefined;
      }
    }
  }

  var optionsModifierRE = /(?:Once|Passive|Capture)$/;

  function parseName(name) {
    var options;

    if (optionsModifierRE.test(name)) {
      options = {};
      var m;

      while (m = name.match(optionsModifierRE)) {
        name = name.slice(0, name.length - m[0].length);
        options[m[0].toLowerCase()] = true;
      }
    }

    return [name.slice(2).toLowerCase(), options];
  }

  function createInvoker(initialValue, instance) {
    var invoker = function invoker(e) {
      // async edge case #6566: inner click event triggers patch, event handler
      // attached to outer element during patch, and triggered again. This
      // happens because browsers fire microtask ticks between event propagation.
      // the solution is simple: we save the timestamp when a handler is attached,
      // and the handler would only fire if the event passed to it was fired
      // AFTER it was attached.
      var timeStamp = e.timeStamp || _getNow();

      if (timeStamp >= invoker.attached - 1) {
        callWithAsyncErrorHandling$1(patchStopImmediatePropagation(e, invoker.value), instance, 5
        /* NATIVE_EVENT_HANDLER */
        , [e]);
      }
    };

    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
  }

  function patchStopImmediatePropagation(e, value) {
    if (isArray$1(value)) {
      var originalStop = e.stopImmediatePropagation;

      e.stopImmediatePropagation = function () {
        originalStop.call(e);
        e._stopped = true;
      };

      return value.map(function (fn) {
        return function (e) {
          return !e._stopped && fn(e);
        };
      });
    } else {
      return value;
    }
  }

  var nativeOnRE = /^on[a-z]/;

  var forcePatchProp = function forcePatchProp(_, key) {
    return key === 'value';
  };

  var patchProp = function patchProp(el, key, prevValue, nextValue) {
    var isSVG = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var prevChildren = arguments.length > 5 ? arguments[5] : undefined;
    var parentComponent = arguments.length > 6 ? arguments[6] : undefined;
    var parentSuspense = arguments.length > 7 ? arguments[7] : undefined;
    var unmountChildren = arguments.length > 8 ? arguments[8] : undefined;

    switch (key) {
      // special
      case 'class':
        patchClass(el, nextValue, isSVG);
        break;

      case 'style':
        patchStyle(el, prevValue, nextValue);
        break;

      default:
        if (isOn$1(key)) {
          // ignore v-model listeners
          if (!isModelListener(key)) {
            patchEvent(el, key, prevValue, nextValue, parentComponent);
          }
        } else if (shouldSetAsProp(el, key, nextValue, isSVG)) {
          patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
        } else {
          // special case for <input v-model type="checkbox"> with
          // :true-value & :false-value
          // store value as dom properties since non-string values will be
          // stringified.
          if (key === 'true-value') {
            el._trueValue = nextValue;
          } else if (key === 'false-value') {
            el._falseValue = nextValue;
          }

          patchAttr(el, key, nextValue, isSVG);
        }

        break;
    }
  };

  function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
      // most keys must be set as attribute on svg elements to work
      // ...except innerHTML
      if (key === 'innerHTML') {
        return true;
      } // or native onclick with function values


      if (key in el && nativeOnRE.test(key) && isFunction$1(value)) {
        return true;
      }

      return false;
    } // spellcheck and draggable are numerated attrs, however their
    // corresponding DOM properties are actually booleans - this leads to
    // setting it with a string "false" value leading it to be coerced to
    // `true`, so we need to always treat them as attributes.
    // Note that `contentEditable` doesn't have this problem: its DOM
    // property is also enumerated string values.


    if (key === 'spellcheck' || key === 'draggable') {
      return false;
    } // #1787 form as an attribute must be a string, while it accepts an Element as
    // a prop


    if (key === 'form' && typeof value === 'string') {
      return false;
    } // #1526 <input list> must be set as attribute


    if (key === 'list' && el.tagName === 'INPUT') {
      return false;
    } // native onclick with string value, must be set as attribute


    if (nativeOnRE.test(key) && isString$1(value)) {
      return false;
    }

    return key in el;
  }

  var rendererOptions = extend$1({
    patchProp: patchProp,
    forcePatchProp: forcePatchProp
  }, nodeOps);

  function initDev$1() {
    var target = getGlobalThis$1();
    target.__VUE__ = true;
    setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__);
    {
      initCustomFormatter$1();
    }
  } // This entry exports the runtime only, and is built as


  process.env.NODE_ENV !== 'production' && initDev$1();

  function processOptions(value) {
    var options;

    if (typeof value === 'function') {
      // Simple options (callback-only)
      options = {
        callback: value
      };
    } else {
      // Options object
      options = value;
    }

    return options;
  }

  function throttle(callback, delay) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var timeout;
    var lastState;
    var currentArgs;

    var throttled = function throttled(state) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      currentArgs = args;
      if (timeout && state === lastState) return;
      var leading = options.leading;

      if (typeof leading === 'function') {
        leading = leading(state, lastState);
      }

      if ((!timeout || state !== lastState) && leading) {
        callback.apply(void 0, [state].concat(_toConsumableArray$1(currentArgs)));
      }

      lastState = state;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        callback.apply(void 0, [state].concat(_toConsumableArray$1(currentArgs)));
        timeout = 0;
      }, delay);
    };

    throttled._clear = function () {
      clearTimeout(timeout);
      timeout = null;
    };

    return throttled;
  }

  function deepEqual(val1, val2) {
    if (val1 === val2) return true;

    if (_typeof$1(val1) === 'object') {
      for (var key in val1) {
        if (!deepEqual(val1[key], val2[key])) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  var VisibilityState = /*#__PURE__*/function () {
    function VisibilityState(el, options, vnode) {
      _classCallCheck(this, VisibilityState);

      this.el = el;
      this.observer = null;
      this.frozen = false;
      this.createObserver(options, vnode);
    }

    _createClass(VisibilityState, [{
      key: "createObserver",
      value: function createObserver(options, vnode) {
        var _this = this;

        if (this.observer) {
          this.destroyObserver();
        }

        if (this.frozen) return;
        this.options = processOptions(options);

        this.callback = function (result, entry) {
          _this.options.callback(result, entry);

          if (result && _this.options.once) {
            _this.frozen = true;

            _this.destroyObserver();
          }
        }; // Throttle


        if (this.callback && this.options.throttle) {
          var _ref = this.options.throttleOptions || {},
              _leading = _ref.leading;

          this.callback = throttle(this.callback, this.options.throttle, {
            leading: function leading(state) {
              return _leading === 'both' || _leading === 'visible' && state || _leading === 'hidden' && !state;
            }
          });
        }

        this.oldResult = undefined;
        this.observer = new IntersectionObserver(function (entries) {
          var entry = entries[0];

          if (entries.length > 1) {
            var intersectingEntry = entries.find(function (e) {
              return e.isIntersecting;
            });

            if (intersectingEntry) {
              entry = intersectingEntry;
            }
          }

          if (_this.callback) {
            // Use isIntersecting if possible because browsers can report isIntersecting as true, but intersectionRatio as 0, when something very slowly enters the viewport.
            var result = entry.isIntersecting && entry.intersectionRatio >= _this.threshold;
            if (result === _this.oldResult) return;
            _this.oldResult = result;

            _this.callback(result, entry);
          }
        }, this.options.intersection); // Wait for the element to be in document

        nextTick$1(function () {
          if (_this.observer) {
            _this.observer.observe(_this.el);
          }
        });
      }
    }, {
      key: "destroyObserver",
      value: function destroyObserver() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        } // Cancel throttled call


        if (this.callback && this.callback._clear) {
          this.callback._clear();

          this.callback = null;
        }
      }
    }, {
      key: "threshold",
      get: function get() {
        return this.options.intersection && this.options.intersection.threshold || 0;
      }
    }]);

    return VisibilityState;
  }();

  function bind(el, _ref2, vnode) {
    var value = _ref2.value;
    if (!value) return;

    if (typeof IntersectionObserver === 'undefined') {
      console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill');
    } else {
      var state = new VisibilityState(el, value, vnode);
      el._vue_visibilityState = state;
    }
  }

  function update(el, _ref3, vnode) {
    var value = _ref3.value,
        oldValue = _ref3.oldValue;
    if (deepEqual(value, oldValue)) return;
    var state = el._vue_visibilityState;

    if (!value) {
      unbind(el);
      return;
    }

    if (state) {
      state.createObserver(value, vnode);
    } else {
      bind(el, {
        value: value
      }, vnode);
    }
  }

  function unbind(el) {
    var state = el._vue_visibilityState;

    if (state) {
      state.destroyObserver();
      delete el._vue_visibilityState;
    }
  }

  var ObserveVisibility = {
    beforeMount: bind,
    updated: update,
    unmounted: unbind
  };

  function install$1(Vue) {
    Vue.directive('observe-visibility', ObserveVisibility);
    /* -- Add more components here -- */
  }
  /* -- Plugin definition & Auto-install -- */

  /* You shouldn't have to modify the code below */
  // Plugin


  var plugin$1 = {
    // eslint-disable-next-line no-undef
    version: "0.4.6",
    install: install$1
  };
  var GlobalVue$1 = null;

  if (typeof window !== 'undefined') {
    GlobalVue$1 = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue$1 = global.Vue;
  }

  if (GlobalVue$1) {
    GlobalVue$1.use(plugin$1);
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var scrollparent = createCommonjsModule(function (module) {
  (function (root, factory) {
    if ( module.exports) {
      module.exports = factory();
    } else {
      root.Scrollparent = factory();
    }
  }(commonjsGlobal, function () {
    var regex = /(auto|scroll)/;

    var parents = function (node, ps) {
      if (node.parentNode === null) { return ps; }

      return parents(node.parentNode, ps.concat([node]));
    };

    var style = function (node, prop) {
      return getComputedStyle(node, null).getPropertyValue(prop);
    };

    var overflow = function (node) {
      return style(node, "overflow") + style(node, "overflow-y") + style(node, "overflow-x");
    };

    var scroll = function (node) {
     return regex.test(overflow(node));
    };

    var scrollParent = function (node) {
      if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
        return ;
      }

      var ps = parents(node.parentNode, []);

      for (var i = 0; i < ps.length; i += 1) {
        if (scroll(ps[i])) {
          return ps[i];
        }
      }

      return document.scrollingElement || document.documentElement;
    };

    return scrollParent;
  }));
  });

  var props = {
    items: {
      type: Array,
      required: true
    },
    keyField: {
      type: String,
      default: 'id'
    },
    direction: {
      type: String,
      default: 'vertical',
      validator: function validator(value) {
        return ['vertical', 'horizontal'].includes(value);
      }
    }
  };
  function simpleArray() {
    return this.items.length && _typeof(this.items[0]) !== 'object';
  }

  var supportsPassive = false;

  if (typeof window !== 'undefined') {
    supportsPassive = false;

    try {
      var opts = Object.defineProperty({}, 'passive', {
        get: function get() {
          supportsPassive = true;
        }
      });
      window.addEventListener('test', null, opts);
    } catch (e) {}
  }

  var uid$2 = 0;
  var script$1 = {
    name: 'RecycleScroller',
    components: {
      ResizeObserver: script
    },
    directives: {
      ObserveVisibility: ObserveVisibility
    },
    props: _objectSpread2({}, props, {
      itemSize: {
        type: Number,
        default: null
      },
      minItemSize: {
        type: [Number, String],
        default: null
      },
      sizeField: {
        type: String,
        default: 'size'
      },
      typeField: {
        type: String,
        default: 'type'
      },
      buffer: {
        type: Number,
        default: 200
      },
      pageMode: {
        type: Boolean,
        default: false
      },
      prerender: {
        type: Number,
        default: 0
      },
      emitUpdate: {
        type: Boolean,
        default: false
      }
    }),
    data: function data() {
      return {
        pool: [],
        totalSize: 0,
        ready: false,
        hoverKey: null
      };
    },
    computed: {
      sizes: function sizes() {
        if (this.itemSize === null) {
          var sizes = {
            '-1': {
              accumulator: 0
            }
          };
          var items = this.items;
          var field = this.sizeField;
          var minItemSize = this.minItemSize;
          var computedMinSize = 10000;
          var accumulator = 0;
          var current;

          for (var i = 0, l = items.length; i < l; i++) {
            current = items[i][field] || minItemSize;

            if (current < computedMinSize) {
              computedMinSize = current;
            }

            accumulator += current;
            sizes[i] = {
              accumulator: accumulator,
              size: current
            };
          } // eslint-disable-next-line


          this.$_computedMinItemSize = computedMinSize;
          return sizes;
        }

        return [];
      },
      simpleArray: simpleArray
    },
    watch: {
      items: function items() {
        this.updateVisibleItems(true);
      },
      pageMode: function pageMode() {
        this.applyPageMode();
        this.updateVisibleItems(false);
      },
      sizes: {
        handler: function handler() {
          this.updateVisibleItems(false);
        },
        deep: true
      }
    },
    created: function created() {
      this.$_startIndex = 0;
      this.$_endIndex = 0;
      this.$_views = new Map();
      this.$_unusedViews = new Map();
      this.$_scrollDirty = false;
      this.$_lastUpdateScrollPosition = 0; // In SSR mode, we also prerender the same number of item for the first render
      // to avoir mismatch between server and client templates

      if (this.prerender) {
        this.$_prerender = true;
        this.updateVisibleItems(false);
      }
    },
    mounted: function mounted() {
      var _this = this;

      this.applyPageMode();
      this.$nextTick(function () {
        // In SSR mode, render the real number of visible items
        _this.$_prerender = false;

        _this.updateVisibleItems(true);

        _this.ready = true;
      });
    },
    beforeUnmount: function beforeUnmount() {
      this.removeListeners();
    },
    methods: {
      addView: function addView(pool, index, item, key, type) {
        var view = vue.shallowReactive({
          item: item,
          position: 0,
          nr: {
            id: uid$2++,
            index: index,
            used: true,
            key: key,
            type: type
          }
        });
        pool.push(view);
        return view;
      },
      unuseView: function unuseView(view) {
        var fake = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var unusedViews = this.$_unusedViews;
        var type = view.nr.type;
        var unusedPool = unusedViews.get(type);

        if (!unusedPool) {
          unusedPool = [];
          unusedViews.set(type, unusedPool);
        }

        unusedPool.push(view);

        if (!fake) {
          view.nr.used = false;
          view.position = -9999;
          this.$_views.delete(view.nr.key);
        }
      },
      handleResize: function handleResize() {
        this.$emit('resize');
        if (this.ready) this.updateVisibleItems(false);
      },
      handleScroll: function handleScroll(event) {
        var _this2 = this;

        if (!this.$_scrollDirty) {
          this.$_scrollDirty = true;
          requestAnimationFrame(function () {
            _this2.$_scrollDirty = false;

            var _this2$updateVisibleI = _this2.updateVisibleItems(false, true),
                continuous = _this2$updateVisibleI.continuous; // It seems sometimes chrome doesn't fire scroll event :/
            // When non continous scrolling is ending, we force a refresh


            if (!continuous) {
              clearTimeout(_this2.$_refreshTimout);
              _this2.$_refreshTimout = setTimeout(_this2.handleScroll, 100);
            }
          });
        }
      },
      handleVisibilityChange: function handleVisibilityChange(isVisible, entry) {
        var _this3 = this;

        if (this.ready) {
          if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {
            this.$emit('visible');
            requestAnimationFrame(function () {
              _this3.updateVisibleItems(false);
            });
          } else {
            this.$emit('hidden');
          }
        }
      },
      updateVisibleItems: function updateVisibleItems(checkItem) {
        var checkPositionDiff = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var itemSize = this.itemSize;
        var minItemSize = this.$_computedMinItemSize;
        var typeField = this.typeField;
        var keyField = this.simpleArray ? null : this.keyField;
        var items = this.items;
        var count = items.length;
        var sizes = this.sizes;
        var views = this.$_views;
        var unusedViews = this.$_unusedViews;
        var pool = this.pool;
        var startIndex, endIndex;
        var totalSize;

        if (!count) {
          startIndex = endIndex = totalSize = 0;
        } else if (this.$_prerender) {
          startIndex = 0;
          endIndex = this.prerender;
          totalSize = null;
        } else {
          var scroll = this.getScroll(); // Skip update if use hasn't scrolled enough

          if (checkPositionDiff) {
            var positionDiff = scroll.start - this.$_lastUpdateScrollPosition;
            if (positionDiff < 0) positionDiff = -positionDiff;

            if (itemSize === null && positionDiff < minItemSize || positionDiff < itemSize) {
              return {
                continuous: true
              };
            }
          }

          this.$_lastUpdateScrollPosition = scroll.start;
          var buffer = this.buffer;
          scroll.start -= buffer;
          scroll.end += buffer; // Variable size mode

          if (itemSize === null) {
            var h;
            var a = 0;
            var b = count - 1;
            var i = ~~(count / 2);
            var oldI; // Searching for startIndex

            do {
              oldI = i;
              h = sizes[i].accumulator;

              if (h < scroll.start) {
                a = i;
              } else if (i < count - 1 && sizes[i + 1].accumulator > scroll.start) {
                b = i;
              }

              i = ~~((a + b) / 2);
            } while (i !== oldI);

            i < 0 && (i = 0);
            startIndex = i; // For container style

            totalSize = sizes[count - 1].accumulator; // Searching for endIndex

            for (endIndex = i; endIndex < count && sizes[endIndex].accumulator < scroll.end; endIndex++) {
            }

            if (endIndex === -1) {
              endIndex = items.length - 1;
            } else {
              endIndex++; // Bounds

              endIndex > count && (endIndex = count);
            }
          } else {
            // Fixed size mode
            startIndex = ~~(scroll.start / itemSize);
            endIndex = Math.ceil(scroll.end / itemSize); // Bounds

            startIndex < 0 && (startIndex = 0);
            endIndex > count && (endIndex = count);
            totalSize = count * itemSize;
          }
        }

        if (endIndex - startIndex > config.itemsLimit) {
          this.itemsLimitError();
        }

        this.totalSize = totalSize;
        var view;
        var continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex;

        if (this.$_continuous !== continuous) {
          if (continuous) {
            views.clear();
            unusedViews.clear();

            for (var _i = 0, l = pool.length; _i < l; _i++) {
              view = pool[_i];
              this.unuseView(view);
            }
          }

          this.$_continuous = continuous;
        } else if (continuous) {
          for (var _i2 = 0, _l = pool.length; _i2 < _l; _i2++) {
            view = pool[_i2];

            if (view.nr.used) {
              // Update view item index
              if (checkItem) {
                view.nr.index = items.findIndex(function (item) {
                  return keyField ? item[keyField] === view.item[keyField] : item === view.item;
                });
              } // Check if index is still in visible range


              if (view.nr.index === -1 || view.nr.index < startIndex || view.nr.index >= endIndex) {
                this.unuseView(view);
              }
            }
          }
        }

        var unusedIndex = continuous ? null : new Map();
        var item, type, unusedPool;
        var v;

        for (var _i3 = startIndex; _i3 < endIndex; _i3++) {
          item = items[_i3];
          var key = keyField ? item[keyField] : item;

          if (key == null) {
            throw new Error("Key is ".concat(key, " on item (keyField is '").concat(keyField, "')"));
          }

          view = views.get(key);

          if (!itemSize && !sizes[_i3].size) {
            if (view) this.unuseView(view);
            continue;
          } // No view assigned to item


          if (!view) {
            type = item[typeField];
            unusedPool = unusedViews.get(type);

            if (continuous) {
              // Reuse existing view
              if (unusedPool && unusedPool.length) {
                view = unusedPool.pop();
                view.item = item;
                view.nr.used = true;
                view.nr.index = _i3;
                view.nr.key = key;
                view.nr.type = type;
              } else {
                view = this.addView(pool, _i3, item, key, type);
              }
            } else {
              // Use existing view
              // We don't care if they are already used
              // because we are not in continous scrolling
              v = unusedIndex.get(type) || 0;

              if (!unusedPool || v >= unusedPool.length) {
                view = this.addView(pool, _i3, item, key, type);
                this.unuseView(view, true);
                unusedPool = unusedViews.get(type);
              }

              view = unusedPool[v];
              view.item = item;
              view.nr.used = true;
              view.nr.index = _i3;
              view.nr.key = key;
              view.nr.type = type;
              unusedIndex.set(type, v + 1);
              v++;
            }

            views.set(key, view);
          } else {
            view.nr.used = true;
            view.item = item;
          } // Update position


          if (itemSize === null) {
            view.position = sizes[_i3 - 1].accumulator;
          } else {
            view.position = _i3 * itemSize;
          }
        }

        this.$_startIndex = startIndex;
        this.$_endIndex = endIndex;
        if (this.emitUpdate) this.$emit('update', startIndex, endIndex); // After the user has finished scrolling
        // Sort views so text selection is correct

        clearTimeout(this.$_sortTimer);
        this.$_sortTimer = setTimeout(this.sortViews, 300);
        return {
          continuous: continuous
        };
      },
      getListenerTarget: function getListenerTarget() {
        var target = scrollparent(this.$el); // Fix global scroll target for Chrome and Safari

        if (window.document && (target === window.document.documentElement || target === window.document.body)) {
          target = window;
        }

        return target;
      },
      getScroll: function getScroll() {
        var el = this.$el,
            direction = this.direction;
        var isVertical = direction === 'vertical';
        var scrollState;

        if (this.pageMode) {
          var bounds = el.getBoundingClientRect();
          var boundsSize = isVertical ? bounds.height : bounds.width;
          var start = -(isVertical ? bounds.top : bounds.left);
          var size = isVertical ? window.innerHeight : window.innerWidth;

          if (start < 0) {
            size += start;
            start = 0;
          }

          if (start + size > boundsSize) {
            size = boundsSize - start;
          }

          scrollState = {
            start: start,
            end: start + size
          };
        } else if (isVertical) {
          scrollState = {
            start: el.scrollTop,
            end: el.scrollTop + el.clientHeight
          };
        } else {
          scrollState = {
            start: el.scrollLeft,
            end: el.scrollLeft + el.clientWidth
          };
        }

        return scrollState;
      },
      applyPageMode: function applyPageMode() {
        if (this.pageMode) {
          this.addListeners();
        } else {
          this.removeListeners();
        }
      },
      addListeners: function addListeners() {
        this.listenerTarget = this.getListenerTarget();
        this.listenerTarget.addEventListener('scroll', this.handleScroll, supportsPassive ? {
          passive: true
        } : false);
        this.listenerTarget.addEventListener('resize', this.handleResize);
      },
      removeListeners: function removeListeners() {
        if (!this.listenerTarget) {
          return;
        }

        this.listenerTarget.removeEventListener('scroll', this.handleScroll);
        this.listenerTarget.removeEventListener('resize', this.handleResize);
        this.listenerTarget = null;
      },
      scrollToItem: function scrollToItem(index) {
        var scroll;

        if (this.itemSize === null) {
          scroll = index > 0 ? this.sizes[index - 1].accumulator : 0;
        } else {
          scroll = index * this.itemSize;
        }

        this.scrollToPosition(scroll);
      },
      scrollToPosition: function scrollToPosition(position) {
        if (this.direction === 'vertical') {
          this.$el.scrollTop = position;
        } else {
          this.$el.scrollLeft = position;
        }
      },
      itemsLimitError: function itemsLimitError() {
        var _this4 = this;

        setTimeout(function () {
          console.log('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', _this4.$el);
          console.log('Make sure the scroller has a fixed height (or width) and \'overflow-y\' (or \'overflow-x\') set to \'auto\' so it can scroll correctly and only render the items visible in the scroll viewport.');
        });
        throw new Error('Rendered items limit reached');
      },
      sortViews: function sortViews() {
        this.pool.sort(function (viewA, viewB) {
          return viewA.nr.index - viewB.nr.index;
        });
      }
    }
  };

  var _hoisted_1$1 = {
    key: 0,
    class: "vue-recycle-scroller__slot"
  };
  var _hoisted_2 = {
    key: 1,
    class: "vue-recycle-scroller__slot"
  };
  function render$1(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_ResizeObserver = vue.resolveComponent("ResizeObserver");

    var _directive_observe_visibility = vue.resolveDirective("observe-visibility");

    return vue.withDirectives((vue.openBlock(), vue.createBlock("div", {
      class: ["vue-recycle-scroller", _defineProperty({
        ready: $data.ready,
        'page-mode': $props.pageMode
      }, "direction-".concat(_ctx.direction), true)],
      onScrollPassive: _cache[2] || (_cache[2] = function () {
        return $options.handleScroll && $options.handleScroll.apply($options, arguments);
      })
    }, [_ctx.$slots.before ? (vue.openBlock(), vue.createBlock("div", _hoisted_1$1, [vue.renderSlot(_ctx.$slots, "before")])) : vue.createCommentVNode("v-if", true), vue.createVNode("div", {
      ref: "wrapper",
      style: _defineProperty({}, _ctx.direction === 'vertical' ? 'minHeight' : 'minWidth', $data.totalSize + 'px'),
      class: "vue-recycle-scroller__item-wrapper"
    }, [(vue.openBlock(true), vue.createBlock(vue.Fragment, null, vue.renderList($data.pool, function (view) {
      return vue.openBlock(), vue.createBlock("div", {
        key: view.nr.id,
        style: $data.ready ? {
          transform: "translate".concat(_ctx.direction === 'vertical' ? 'Y' : 'X', "(").concat(view.position, "px)")
        } : null,
        class: ["vue-recycle-scroller__item-view", {
          hover: $data.hoverKey === view.nr.key
        }],
        onMouseenter: function onMouseenter($event) {
          return $data.hoverKey = view.nr.key;
        },
        onMouseleave: _cache[1] || (_cache[1] = function ($event) {
          return $data.hoverKey = null;
        })
      }, [vue.renderSlot(_ctx.$slots, "default", {
        item: view.item,
        index: view.nr.index,
        active: view.nr.used
      })], 46
      /* CLASS, STYLE, PROPS, HYDRATE_EVENTS */
      , ["onMouseenter"]);
    }), 128
    /* KEYED_FRAGMENT */
    ))], 4
    /* STYLE */
    ), _ctx.$slots.after ? (vue.openBlock(), vue.createBlock("div", _hoisted_2, [vue.renderSlot(_ctx.$slots, "after")])) : vue.createCommentVNode("v-if", true), vue.createVNode(_component_ResizeObserver, {
      onNotify: $options.handleResize
    }, null, 8
    /* PROPS */
    , ["onNotify"])], 34
    /* CLASS, HYDRATE_EVENTS */
    )), [[_directive_observe_visibility, $options.handleVisibilityChange]]);
  }

  script$1.render = render$1;
  script$1.__file = "src/components/RecycleScroller.vue";

  var script$2 = {
    name: 'DynamicScroller',
    components: {
      RecycleScroller: script$1
    },
    inheritAttrs: false,
    provide: function provide() {
      if (typeof ResizeObserver !== 'undefined') {
        this.$_resizeObserver = new ResizeObserver(function (entries) {
          var _iterator = _createForOfIteratorHelper(entries),
              _step;

          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var entry = _step.value;

              if (entry.target) {
                var event = new CustomEvent('resize', {
                  detail: {
                    contentRect: entry.contentRect
                  }
                });
                entry.target.dispatchEvent(event);
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        });
      }

      return {
        vscrollData: this.vscrollData,
        vscrollParent: this,
        vscrollResizeObserver: this.$_resizeObserver
      };
    },
    props: _objectSpread2({}, props, {
      minItemSize: {
        type: [Number, String],
        required: true
      }
    }),
    data: function data() {
      return {
        vscrollData: {
          active: true,
          sizes: {},
          validSizes: {},
          keyField: this.keyField,
          simpleArray: false
        }
      };
    },
    computed: {
      simpleArray: simpleArray,
      itemsWithSize: function itemsWithSize() {
        var result = [];
        var items = this.items,
            keyField = this.keyField,
            simpleArray = this.simpleArray;
        var sizes = this.vscrollData.sizes;

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          var id = simpleArray ? i : item[keyField];
          var size = sizes[id];

          if (typeof size === 'undefined' && !this.$_undefinedMap[id]) {
            size = 0;
          }

          result.push({
            item: item,
            id: id,
            size: size
          });
        }

        return result;
      },
      listeners: function listeners() {
        var listeners = {};

        for (var key in this.$listeners) {
          if (key !== 'resize' && key !== 'visible') {
            listeners[key] = this.$listeners[key];
          }
        }

        return listeners;
      }
    },
    watch: {
      items: function items() {
        this.forceUpdate(false);
      },
      simpleArray: {
        handler: function handler(value) {
          this.vscrollData.simpleArray = value;
        },
        immediate: true
      },
      direction: function direction(value) {
        this.forceUpdate(true);
      }
    },
    created: function created() {
      this.$_updates = [];
      this.$_undefinedSizes = 0;
      this.$_undefinedMap = {};
    },
    activated: function activated() {
      this.vscrollData.active = true;
    },
    deactivated: function deactivated() {
      this.vscrollData.active = false;
    },
    methods: {
      onScrollerResize: function onScrollerResize() {
        var scroller = this.$refs.scroller;

        if (scroller) {
          this.forceUpdate();
        }

        this.$emit('resize');
      },
      onScrollerVisible: function onScrollerVisible() {
        this.$emit('vscroll:update', {
          force: false
        });
        this.$emit('visible');
      },
      forceUpdate: function forceUpdate() {
        var clear = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (clear || this.simpleArray) {
          this.vscrollData.validSizes = {};
        }

        this.$emit('vscroll:update', {
          force: true
        });
      },
      scrollToItem: function scrollToItem(index) {
        var scroller = this.$refs.scroller;
        if (scroller) scroller.scrollToItem(index);
      },
      getItemSize: function getItemSize(item) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        var id = this.simpleArray ? index != null ? index : this.items.indexOf(item) : item[this.keyField];
        return this.vscrollData.sizes[id] || 0;
      },
      scrollToBottom: function scrollToBottom() {
        var _this = this;

        if (this.$_scrollingToBottom) return;
        this.$_scrollingToBottom = true;
        var el = this.$el; // Item is inserted to the DOM

        this.$nextTick(function () {
          el.scrollTop = el.scrollHeight + 5000; // Item sizes are computed

          var cb = function cb() {
            el.scrollTop = el.scrollHeight + 5000;
            requestAnimationFrame(function () {
              el.scrollTop = el.scrollHeight + 5000;

              if (_this.$_undefinedSizes === 0) {
                _this.$_scrollingToBottom = false;
              } else {
                requestAnimationFrame(cb);
              }
            });
          };

          requestAnimationFrame(cb);
        });
      }
    }
  };

  var _hoisted_1$2 = {
    "slot-scope": "{ item: itemWithSize, index, active }"
  };
  var _hoisted_2$1 = {
    slot: "before"
  };
  var _hoisted_3 = {
    slot: "after"
  };
  function render$2(_ctx, _cache, $props, $setup, $data, $options) {
    var _component_RecycleScroller = vue.resolveComponent("RecycleScroller");

    return vue.openBlock(), vue.createBlock(_component_RecycleScroller, vue.mergeProps({
      ref: "scroller",
      items: $options.itemsWithSize,
      "min-item-size": $props.minItemSize,
      direction: _ctx.direction,
      "key-field": "id"
    }, _ctx.$attrs, {
      onResize: $options.onScrollerResize,
      onVisible: $options.onScrollerVisible
    }, vue.toHandlers($options.listeners)), {
      default: vue.withCtx(function () {
        return [vue.createVNode("template", _hoisted_1$2, [vue.renderSlot(_ctx.$slots, "default", {
          item: _ctx.itemWithSize.item,
          index: _ctx.index,
          active: _ctx.active,
          itemWithSize: _ctx.itemWithSize
        })]), vue.createVNode("template", _hoisted_2$1, [vue.renderSlot(_ctx.$slots, "before")]), vue.createVNode("template", _hoisted_3, [vue.renderSlot(_ctx.$slots, "after")])];
      }),
      _: 3
      /* FORWARDED */

    }, 16
    /* FULL_PROPS */
    , ["items", "min-item-size", "direction", "onResize", "onVisible"]);
  }

  script$2.render = render$2;
  script$2.__file = "src/components/DynamicScroller.vue";

  var script$3 = {
    name: 'DynamicScrollerItem',
    inject: ['vscrollData', 'vscrollParent', 'vscrollResizeObserver'],
    props: {
      // eslint-disable-next-line vue/require-prop-types
      item: {
        required: true
      },
      watchData: {
        type: Boolean,
        default: false
      },

      /**
       * Indicates if the view is actively used to display an item.
       */
      active: {
        type: Boolean,
        required: true
      },
      index: {
        type: Number,
        default: undefined
      },
      sizeDependencies: {
        type: [Array, Object],
        default: null
      },
      emitResize: {
        type: Boolean,
        default: false
      },
      tag: {
        type: String,
        default: 'div'
      }
    },
    computed: {
      id: function id() {
        return this.vscrollData.simpleArray ? this.index : this.item[this.vscrollData.keyField];
      },
      size: function size() {
        return this.vscrollData.validSizes[this.id] && this.vscrollData.sizes[this.id] || 0;
      },
      finalActive: function finalActive() {
        return this.active && this.vscrollData.active;
      }
    },
    watch: {
      watchData: 'updateWatchData',
      id: function id() {
        if (!this.size) {
          this.onDataUpdate();
        }
      },
      finalActive: function finalActive(value) {
        if (!this.size) {
          if (value) {
            if (!this.vscrollParent.$_undefinedMap[this.id]) {
              this.vscrollParent.$_undefinedSizes++;
              this.vscrollParent.$_undefinedMap[this.id] = true;
            }
          } else {
            if (this.vscrollParent.$_undefinedMap[this.id]) {
              this.vscrollParent.$_undefinedSizes--;
              this.vscrollParent.$_undefinedMap[this.id] = false;
            }
          }
        }

        if (this.vscrollResizeObserver) {
          if (value) {
            this.observeSize();
          } else {
            this.unobserveSize();
          }
        } else if (value && this.$_pendingVScrollUpdate === this.id) {
          this.updateSize();
        }
      }
    },
    created: function created() {
      var _this = this;

      if (this.$isServer) return;
      this.$_forceNextVScrollUpdate = null;
      this.updateWatchData();

      if (!this.vscrollResizeObserver) {
        var _loop = function _loop(k) {
          _this.$watch(function () {
            return _this.sizeDependencies[k];
          }, _this.onDataUpdate);
        };

        for (var k in this.sizeDependencies) {
          _loop(k);
        }

        this.vscrollParent.$on('vscroll:update', this.onVscrollUpdate);
        this.vscrollParent.$on('vscroll:update-size', this.onVscrollUpdateSize);
      }
    },
    mounted: function mounted() {
      if (this.vscrollData.active) {
        this.updateSize();
        this.observeSize();
      }
    },
    beforeUnmount: function beforeUnmount() {
      this.vscrollParent.$off('vscroll:update', this.onVscrollUpdate);
      this.vscrollParent.$off('vscroll:update-size', this.onVscrollUpdateSize);
      this.unobserveSize();
    },
    methods: {
      updateSize: function updateSize() {
        if (this.finalActive) {
          if (this.$_pendingSizeUpdate !== this.id) {
            this.$_pendingSizeUpdate = this.id;
            this.$_forceNextVScrollUpdate = null;
            this.$_pendingVScrollUpdate = null;
            this.computeSize(this.id);
          }
        } else {
          this.$_forceNextVScrollUpdate = this.id;
        }
      },
      updateWatchData: function updateWatchData() {
        var _this2 = this;

        if (this.watchData) {
          this.$_watchData = this.$watch('data', function () {
            _this2.onDataUpdate();
          }, {
            deep: true
          });
        } else if (this.$_watchData) {
          this.$_watchData();
          this.$_watchData = null;
        }
      },
      onVscrollUpdate: function onVscrollUpdate(_ref) {
        var force = _ref.force;

        // If not active, sechedule a size update when it becomes active
        if (!this.finalActive && force) {
          this.$_pendingVScrollUpdate = this.id;
        }

        if (this.$_forceNextVScrollUpdate === this.id || force || !this.size) {
          this.updateSize();
        }
      },
      onDataUpdate: function onDataUpdate() {
        this.updateSize();
      },
      computeSize: function computeSize(id) {
        var _this3 = this;

        this.$nextTick(function () {
          if (_this3.id === id) {
            var width = _this3.$el.offsetWidth;
            var height = _this3.$el.offsetHeight;

            _this3.applySize(width, height);
          }

          _this3.$_pendingSizeUpdate = null;
        });
      },
      applySize: function applySize(width, height) {
        var size = Math.round(this.vscrollParent.direction === 'vertical' ? height : width);

        if (size && this.size !== size) {
          if (this.vscrollParent.$_undefinedMap[this.id]) {
            this.vscrollParent.$_undefinedSizes--;
            this.vscrollParent.$_undefinedMap[this.id] = undefined;
          }

          this.$set(this.vscrollData.sizes, this.id, size);
          this.$set(this.vscrollData.validSizes, this.id, true);
          if (this.emitResize) this.$emit('resize', this.id);
        }
      },
      observeSize: function observeSize() {
        if (!this.vscrollResizeObserver) return;
        this.vscrollResizeObserver.observe(this.$el.parentNode);
        this.$el.parentNode.addEventListener('resize', this.onResize);
      },
      unobserveSize: function unobserveSize() {
        if (!this.vscrollResizeObserver) return;
        this.vscrollResizeObserver.unobserve(this.$el.parentNode);
        this.$el.parentNode.removeEventListener('resize', this.onResize);
      },
      onResize: function onResize(event) {
        var _event$detail$content = event.detail.contentRect,
            width = _event$detail$content.width,
            height = _event$detail$content.height;
        this.applySize(width, height);
      }
    },
    render: function render(h) {
      console.log('render', h);
      return h(this.tag, this.$slots.default);
    }
  };

  script$3.__file = "src/components/DynamicScrollerItem.vue";

  function IdState () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$idProp = _ref.idProp,
        idProp = _ref$idProp === void 0 ? function (vm) {
      return vm.item.id;
    } : _ref$idProp;

    var store = vue.reactive({}); // @vue/component

    return {
      data: function data() {
        return {
          idState: null
        };
      },
      created: function created() {
        var _this = this;

        this.$_id = null;

        if (typeof idProp === 'function') {
          this.$_getId = function () {
            return idProp.call(_this, _this);
          };
        } else {
          this.$_getId = function () {
            return _this[idProp];
          };
        }

        this.$watch(this.$_getId, {
          handler: function handler(value) {
            var _this2 = this;

            this.$nextTick(function () {
              _this2.$_id = value;
            });
          },
          immediate: true
        });
        this.$_updateIdState();
      },
      beforeUpdate: function beforeUpdate() {
        this.$_updateIdState();
      },
      methods: {
        /**
         * Initialize an idState
         * @param {number|string} id Unique id for the data
         */
        $_idStateInit: function $_idStateInit(id) {
          var factory = this.$options.idState;

          if (typeof factory === 'function') {
            var data = factory.call(this, this);
            store[id] = data;
            this.$_id = id;
            return data;
          } else {
            throw new Error('[mixin IdState] Missing `idState` function on component definition.');
          }
        },

        /**
         * Ensure idState is created and up-to-date
         */
        $_updateIdState: function $_updateIdState() {
          var id = this.$_getId();

          if (id == null) {
            console.warn("No id found for IdState with idProp: '".concat(idProp, "'."));
          }

          if (id !== this.$_id) {
            if (!store[id]) {
              this.$_idStateInit(id);
            }

            this.idState = store[id];
          }
        }
      }
    };
  }

  function registerComponents(Vue, prefix) {
    Vue.component("".concat(prefix, "recycle-scroller"), script$1);
    Vue.component("".concat(prefix, "RecycleScroller"), script$1);
    Vue.component("".concat(prefix, "dynamic-scroller"), script$2);
    Vue.component("".concat(prefix, "DynamicScroller"), script$2);
    Vue.component("".concat(prefix, "dynamic-scroller-item"), script$3);
    Vue.component("".concat(prefix, "DynamicScrollerItem"), script$3);
  }

  var plugin$2 = {
    // eslint-disable-next-line no-undef
    version: "1.0.10",
    install: function install(Vue, options) {
      var finalOptions = Object.assign({}, {
        installComponents: true,
        componentsPrefix: ''
      }, options);

      for (var key in finalOptions) {
        if (typeof finalOptions[key] !== 'undefined') {
          config[key] = finalOptions[key];
        }
      }

      if (finalOptions.installComponents) {
        registerComponents(Vue, finalOptions.componentsPrefix);
      }
    }
  };

  var GlobalVue$2 = null;

  if (typeof window !== 'undefined') {
    GlobalVue$2 = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue$2 = global.Vue;
  }

  if (GlobalVue$2) {
    GlobalVue$2.use(plugin$2);
  }

  exports.DynamicScroller = script$2;
  exports.DynamicScrollerItem = script$3;
  exports.IdState = IdState;
  exports.RecycleScroller = script$1;
  exports.default = plugin$2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vue-virtual-scroller.umd.js.map
