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

  /**
   * Make a map and return a function for checking if a key
   * is in that map.
   * IMPORTANT: all calls of this function must be prefixed with
   * \/\*#\_\_PURE\_\_\*\/
   * So that rollup can tree-shake them if necessary.
   */
  function makeMap(str, expectsLowerCase) {
      const map = Object.create(null);
      const list = str.split(',');
      for (let i = 0; i < list.length; i++) {
          map[list[i]] = true;
      }
      return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
  }

  const GLOBALS_WHITE_LISTED = 'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
      'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
      'Object,Boolean,String,RegExp,Map,Set,JSON,Intl';
  const isGloballyWhitelisted = /*#__PURE__*/ makeMap(GLOBALS_WHITE_LISTED);

  function normalizeStyle(value) {
      if (isArray(value)) {
          const res = {};
          for (let i = 0; i < value.length; i++) {
              const item = value[i];
              const normalized = normalizeStyle(isString(item) ? parseStringStyle(item) : item);
              if (normalized) {
                  for (const key in normalized) {
                      res[key] = normalized[key];
                  }
              }
          }
          return res;
      }
      else if (isObject(value)) {
          return value;
      }
  }
  const listDelimiterRE = /;(?![^(]*\))/g;
  const propertyDelimiterRE = /:(.+)/;
  function parseStringStyle(cssText) {
      const ret = {};
      cssText.split(listDelimiterRE).forEach(item => {
          if (item) {
              const tmp = item.split(propertyDelimiterRE);
              tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
          }
      });
      return ret;
  }
  function normalizeClass(value) {
      let res = '';
      if (isString(value)) {
          res = value;
      }
      else if (isArray(value)) {
          for (let i = 0; i < value.length; i++) {
              res += normalizeClass(value[i]) + ' ';
          }
      }
      else if (isObject(value)) {
          for (const name in value) {
              if (value[name]) {
                  res += name + ' ';
              }
          }
      }
      return res.trim();
  }
  const EMPTY_OBJ = (process.env.NODE_ENV !== 'production')
      ? Object.freeze({})
      : {};
  const EMPTY_ARR = (process.env.NODE_ENV !== 'production') ? Object.freeze([]) : [];
  const NOOP = () => { };
  const onRE = /^on[^a-z]/;
  const isOn = (key) => onRE.test(key);
  const extend = Object.assign;
  const remove = (arr, el) => {
      const i = arr.indexOf(el);
      if (i > -1) {
          arr.splice(i, 1);
      }
  };
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const isArray = Array.isArray;
  const isMap = (val) => toTypeString(val) === '[object Map]';
  const isSet = (val) => toTypeString(val) === '[object Set]';
  const isFunction = (val) => typeof val === 'function';
  const isString = (val) => typeof val === 'string';
  const isSymbol = (val) => typeof val === 'symbol';
  const isObject = (val) => val !== null && typeof val === 'object';
  const isPromise = (val) => {
      return isObject(val) && isFunction(val.then) && isFunction(val.catch);
  };
  const objectToString = Object.prototype.toString;
  const toTypeString = (value) => objectToString.call(value);
  const toRawType = (value) => {
      // extract "RawType" from strings like "[object RawType]"
      return toTypeString(value).slice(8, -1);
  };
  const isIntegerKey = (key) => isString(key) &&
      key !== 'NaN' &&
      key[0] !== '-' &&
      '' + parseInt(key, 10) === key;
  const cacheStringFunction = (fn) => {
      const cache = Object.create(null);
      return ((str) => {
          const hit = cache[str];
          return hit || (cache[str] = fn(str));
      });
  };
  /**
   * @private
   */
  const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
  // compare whether a value has changed, accounting for NaN.
  const hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
  let _globalThis;
  const getGlobalThis = () => {
      return (_globalThis ||
          (_globalThis =
              typeof globalThis !== 'undefined'
                  ? globalThis
                  : typeof self !== 'undefined'
                      ? self
                      : typeof window !== 'undefined'
                          ? window
                          : typeof global !== 'undefined'
                              ? global
                              : {}));
  };

  const targetMap = new WeakMap();
  const effectStack = [];
  let activeEffect;
  const ITERATE_KEY = Symbol((process.env.NODE_ENV !== 'production') ? 'iterate' : '');
  const MAP_KEY_ITERATE_KEY = Symbol((process.env.NODE_ENV !== 'production') ? 'Map key iterate' : '');
  function isEffect(fn) {
      return fn && fn._isEffect === true;
  }
  function effect(fn, options = EMPTY_OBJ) {
      if (isEffect(fn)) {
          fn = fn.raw;
      }
      const effect = createReactiveEffect(fn, options);
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
  let uid = 0;
  function createReactiveEffect(fn, options) {
      const effect = function reactiveEffect() {
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
              }
              finally {
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
      const { deps } = effect;
      if (deps.length) {
          for (let i = 0; i < deps.length; i++) {
              deps[i].delete(effect);
          }
          deps.length = 0;
      }
  }
  let shouldTrack = true;
  const trackStack = [];
  function pauseTracking() {
      trackStack.push(shouldTrack);
      shouldTrack = false;
  }
  function enableTracking() {
      trackStack.push(shouldTrack);
      shouldTrack = true;
  }
  function resetTracking() {
      const last = trackStack.pop();
      shouldTrack = last === undefined ? true : last;
  }
  function track(target, type, key) {
      if (!shouldTrack || activeEffect === undefined) {
          return;
      }
      let depsMap = targetMap.get(target);
      if (!depsMap) {
          targetMap.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      if (!dep.has(activeEffect)) {
          dep.add(activeEffect);
          activeEffect.deps.push(dep);
          if ((process.env.NODE_ENV !== 'production') && activeEffect.options.onTrack) {
              activeEffect.options.onTrack({
                  effect: activeEffect,
                  target,
                  type,
                  key
              });
          }
      }
  }
  function trigger(target, type, key, newValue, oldValue, oldTarget) {
      const depsMap = targetMap.get(target);
      if (!depsMap) {
          // never been tracked
          return;
      }
      const effects = new Set();
      const add = (effectsToAdd) => {
          if (effectsToAdd) {
              effectsToAdd.forEach(effect => {
                  if (effect !== activeEffect || effect.allowRecurse) {
                      effects.add(effect);
                  }
              });
          }
      };
      if (type === "clear" /* CLEAR */) {
          // collection being cleared
          // trigger all effects for target
          depsMap.forEach(add);
      }
      else if (key === 'length' && isArray(target)) {
          depsMap.forEach((dep, key) => {
              if (key === 'length' || key >= newValue) {
                  add(dep);
              }
          });
      }
      else {
          // schedule runs for SET | ADD | DELETE
          if (key !== void 0) {
              add(depsMap.get(key));
          }
          // also run for iteration key on ADD | DELETE | Map.SET
          switch (type) {
              case "add" /* ADD */:
                  if (!isArray(target)) {
                      add(depsMap.get(ITERATE_KEY));
                      if (isMap(target)) {
                          add(depsMap.get(MAP_KEY_ITERATE_KEY));
                      }
                  }
                  else if (isIntegerKey(key)) {
                      // new index added to array -> length changes
                      add(depsMap.get('length'));
                  }
                  break;
              case "delete" /* DELETE */:
                  if (!isArray(target)) {
                      add(depsMap.get(ITERATE_KEY));
                      if (isMap(target)) {
                          add(depsMap.get(MAP_KEY_ITERATE_KEY));
                      }
                  }
                  break;
              case "set" /* SET */:
                  if (isMap(target)) {
                      add(depsMap.get(ITERATE_KEY));
                  }
                  break;
          }
      }
      const run = (effect) => {
          if ((process.env.NODE_ENV !== 'production') && effect.options.onTrigger) {
              effect.options.onTrigger({
                  effect,
                  target,
                  key,
                  type,
                  newValue,
                  oldValue,
                  oldTarget
              });
          }
          if (effect.options.scheduler) {
              effect.options.scheduler(effect);
          }
          else {
              effect();
          }
      };
      effects.forEach(run);
  }

  const builtInSymbols = new Set(Object.getOwnPropertyNames(Symbol)
      .map(key => Symbol[key])
      .filter(isSymbol));
  const get = /*#__PURE__*/ createGetter();
  const shallowGet = /*#__PURE__*/ createGetter(false, true);
  const readonlyGet = /*#__PURE__*/ createGetter(true);
  const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
  const arrayInstrumentations = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
      const method = Array.prototype[key];
      arrayInstrumentations[key] = function (...args) {
          const arr = toRaw(this);
          for (let i = 0, l = this.length; i < l; i++) {
              track(arr, "get" /* GET */, i + '');
          }
          // we run the method using the original args first (which may be reactive)
          const res = method.apply(arr, args);
          if (res === -1 || res === false) {
              // if that didn't work, run it again using raw values.
              return method.apply(arr, args.map(toRaw));
          }
          else {
              return res;
          }
      };
  });
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
      const method = Array.prototype[key];
      arrayInstrumentations[key] = function (...args) {
          pauseTracking();
          const res = method.apply(this, args);
          resetTracking();
          return res;
      };
  });
  function createGetter(isReadonly = false, shallow = false) {
      return function get(target, key, receiver) {
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return !isReadonly;
          }
          else if (key === "__v_isReadonly" /* IS_READONLY */) {
              return isReadonly;
          }
          else if (key === "__v_raw" /* RAW */ &&
              receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)) {
              return target;
          }
          const targetIsArray = isArray(target);
          if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
              return Reflect.get(arrayInstrumentations, key, receiver);
          }
          const res = Reflect.get(target, key, receiver);
          if (isSymbol(key)
              ? builtInSymbols.has(key)
              : key === `__proto__` || key === `__v_isRef`) {
              return res;
          }
          if (!isReadonly) {
              track(target, "get" /* GET */, key);
          }
          if (shallow) {
              return res;
          }
          if (isRef(res)) {
              // ref unwrapping - does not apply for Array + integer key.
              const shouldUnwrap = !targetIsArray || !isIntegerKey(key);
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
  const set = /*#__PURE__*/ createSetter();
  const shallowSet = /*#__PURE__*/ createSetter(true);
  function createSetter(shallow = false) {
      return function set(target, key, value, receiver) {
          const oldValue = target[key];
          if (!shallow) {
              value = toRaw(value);
              if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                  oldValue.value = value;
                  return true;
              }
          }
          const hadKey = isArray(target) && isIntegerKey(key)
              ? Number(key) < target.length
              : hasOwn(target, key);
          const result = Reflect.set(target, key, value, receiver);
          // don't trigger if target is something up in the prototype chain of original
          if (target === toRaw(receiver)) {
              if (!hadKey) {
                  trigger(target, "add" /* ADD */, key, value);
              }
              else if (hasChanged(value, oldValue)) {
                  trigger(target, "set" /* SET */, key, value, oldValue);
              }
          }
          return result;
      };
  }
  function deleteProperty(target, key) {
      const hadKey = hasOwn(target, key);
      const oldValue = target[key];
      const result = Reflect.deleteProperty(target, key);
      if (result && hadKey) {
          trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
      }
      return result;
  }
  function has(target, key) {
      const result = Reflect.has(target, key);
      if (!isSymbol(key) || !builtInSymbols.has(key)) {
          track(target, "has" /* HAS */, key);
      }
      return result;
  }
  function ownKeys$1(target) {
      track(target, "iterate" /* ITERATE */, isArray(target) ? 'length' : ITERATE_KEY);
      return Reflect.ownKeys(target);
  }
  const mutableHandlers = {
      get,
      set,
      deleteProperty,
      has,
      ownKeys: ownKeys$1
  };
  const readonlyHandlers = {
      get: readonlyGet,
      set(target, key) {
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
      },
      deleteProperty(target, key) {
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
      }
  };
  const shallowReactiveHandlers = extend({}, mutableHandlers, {
      get: shallowGet,
      set: shallowSet
  });
  // Props handlers are special in the sense that it should not unwrap top-level
  // refs (in order to allow refs to be explicitly passed down), but should
  // retain the reactivity of the normal readonly object.
  const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
      get: shallowReadonlyGet
  });

  const toReactive = (value) => isObject(value) ? reactive(value) : value;
  const toReadonly = (value) => isObject(value) ? readonly(value) : value;
  const toShallow = (value) => value;
  const getProto = (v) => Reflect.getPrototypeOf(v);
  function get$1(target, key, isReadonly = false, isShallow = false) {
      // #1772: readonly(reactive(Map)) should return readonly + reactive version
      // of the value
      target = target["__v_raw" /* RAW */];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (key !== rawKey) {
          !isReadonly && track(rawTarget, "get" /* GET */, key);
      }
      !isReadonly && track(rawTarget, "get" /* GET */, rawKey);
      const { has } = getProto(rawTarget);
      const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
      if (has.call(rawTarget, key)) {
          return wrap(target.get(key));
      }
      else if (has.call(rawTarget, rawKey)) {
          return wrap(target.get(rawKey));
      }
  }
  function has$1(key, isReadonly = false) {
      const target = this["__v_raw" /* RAW */];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (key !== rawKey) {
          !isReadonly && track(rawTarget, "has" /* HAS */, key);
      }
      !isReadonly && track(rawTarget, "has" /* HAS */, rawKey);
      return key === rawKey
          ? target.has(key)
          : target.has(key) || target.has(rawKey);
  }
  function size(target, isReadonly = false) {
      target = target["__v_raw" /* RAW */];
      !isReadonly && track(toRaw(target), "iterate" /* ITERATE */, ITERATE_KEY);
      return Reflect.get(target, 'size', target);
  }
  function add(value) {
      value = toRaw(value);
      const target = toRaw(this);
      const proto = getProto(target);
      const hadKey = proto.has.call(target, value);
      target.add(value);
      if (!hadKey) {
          trigger(target, "add" /* ADD */, value, value);
      }
      return this;
  }
  function set$1(key, value) {
      value = toRaw(value);
      const target = toRaw(this);
      const { has, get } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
      }
      else if ((process.env.NODE_ENV !== 'production')) {
          checkIdentityKeys(target, has, key);
      }
      const oldValue = get.call(target, key);
      target.set(key, value);
      if (!hadKey) {
          trigger(target, "add" /* ADD */, key, value);
      }
      else if (hasChanged(value, oldValue)) {
          trigger(target, "set" /* SET */, key, value, oldValue);
      }
      return this;
  }
  function deleteEntry(key) {
      const target = toRaw(this);
      const { has, get } = getProto(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
      }
      else if ((process.env.NODE_ENV !== 'production')) {
          checkIdentityKeys(target, has, key);
      }
      const oldValue = get ? get.call(target, key) : undefined;
      // forward the operation before queueing reactions
      const result = target.delete(key);
      if (hadKey) {
          trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
      }
      return result;
  }
  function clear() {
      const target = toRaw(this);
      const hadItems = target.size !== 0;
      const oldTarget = (process.env.NODE_ENV !== 'production')
          ? isMap(target)
              ? new Map(target)
              : new Set(target)
          : undefined;
      // forward the operation before queueing reactions
      const result = target.clear();
      if (hadItems) {
          trigger(target, "clear" /* CLEAR */, undefined, undefined, oldTarget);
      }
      return result;
  }
  function createForEach(isReadonly, isShallow) {
      return function forEach(callback, thisArg) {
          const observed = this;
          const target = observed["__v_raw" /* RAW */];
          const rawTarget = toRaw(target);
          const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
          !isReadonly && track(rawTarget, "iterate" /* ITERATE */, ITERATE_KEY);
          return target.forEach((value, key) => {
              // important: make sure the callback is
              // 1. invoked with the reactive map as `this` and 3rd arg
              // 2. the value received should be a corresponding reactive/readonly.
              return callback.call(thisArg, wrap(value), wrap(key), observed);
          });
      };
  }
  function createIterableMethod(method, isReadonly, isShallow) {
      return function (...args) {
          const target = this["__v_raw" /* RAW */];
          const rawTarget = toRaw(target);
          const targetIsMap = isMap(rawTarget);
          const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
          const isKeyOnly = method === 'keys' && targetIsMap;
          const innerIterator = target[method](...args);
          const wrap = isReadonly ? toReadonly : isShallow ? toShallow : toReactive;
          !isReadonly &&
              track(rawTarget, "iterate" /* ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
          // return a wrapped iterator which returns observed versions of the
          // values emitted from the real iterator
          return {
              // iterator protocol
              next() {
                  const { value, done } = innerIterator.next();
                  return done
                      ? { value, done }
                      : {
                          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                          done
                      };
              },
              // iterable protocol
              [Symbol.iterator]() {
                  return this;
              }
          };
      };
  }
  function createReadonlyMethod(type) {
      return function (...args) {
          if ((process.env.NODE_ENV !== 'production')) {
              const key = args[0] ? `on key "${args[0]}" ` : ``;
              console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
          }
          return type === "delete" /* DELETE */ ? false : this;
      };
  }
  const mutableInstrumentations = {
      get(key) {
          return get$1(this, key);
      },
      get size() {
          return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, false)
  };
  const shallowInstrumentations = {
      get(key) {
          return get$1(this, key, false, true);
      },
      get size() {
          return size(this);
      },
      has: has$1,
      add,
      set: set$1,
      delete: deleteEntry,
      clear,
      forEach: createForEach(false, true)
  };
  const readonlyInstrumentations = {
      get(key) {
          return get$1(this, key, true);
      },
      get size() {
          return size(this, true);
      },
      has(key) {
          return has$1.call(this, key, true);
      },
      add: createReadonlyMethod("add" /* ADD */),
      set: createReadonlyMethod("set" /* SET */),
      delete: createReadonlyMethod("delete" /* DELETE */),
      clear: createReadonlyMethod("clear" /* CLEAR */),
      forEach: createForEach(true, false)
  };
  const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
  iteratorMethods.forEach(method => {
      mutableInstrumentations[method] = createIterableMethod(method, false, false);
      readonlyInstrumentations[method] = createIterableMethod(method, true, false);
      shallowInstrumentations[method] = createIterableMethod(method, false, true);
  });
  function createInstrumentationGetter(isReadonly, shallow) {
      const instrumentations = shallow
          ? shallowInstrumentations
          : isReadonly
              ? readonlyInstrumentations
              : mutableInstrumentations;
      return (target, key, receiver) => {
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return !isReadonly;
          }
          else if (key === "__v_isReadonly" /* IS_READONLY */) {
              return isReadonly;
          }
          else if (key === "__v_raw" /* RAW */) {
              return target;
          }
          return Reflect.get(hasOwn(instrumentations, key) && key in target
              ? instrumentations
              : target, key, receiver);
      };
  }
  const mutableCollectionHandlers = {
      get: createInstrumentationGetter(false, false)
  };
  const readonlyCollectionHandlers = {
      get: createInstrumentationGetter(true, false)
  };
  function checkIdentityKeys(target, has, key) {
      const rawKey = toRaw(key);
      if (rawKey !== key && has.call(target, rawKey)) {
          const type = toRawType(target);
          console.warn(`Reactive ${type} contains both the raw and reactive ` +
              `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
              `which can lead to inconsistencies. ` +
              `Avoid differentiating between the raw and reactive versions ` +
              `of an object and only use the reactive version if possible.`);
      }
  }

  const reactiveMap = new WeakMap();
  const readonlyMap = new WeakMap();
  function targetTypeMap(rawType) {
      switch (rawType) {
          case 'Object':
          case 'Array':
              return 1 /* COMMON */;
          case 'Map':
          case 'Set':
          case 'WeakMap':
          case 'WeakSet':
              return 2 /* COLLECTION */;
          default:
              return 0 /* INVALID */;
      }
  }
  function getTargetType(value) {
      return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
          ? 0 /* INVALID */
          : targetTypeMap(toRawType(value));
  }
  function reactive(target) {
      // if trying to observe a readonly proxy, return the readonly version.
      if (target && target["__v_isReadonly" /* IS_READONLY */]) {
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
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`value cannot be made reactive: ${String(target)}`);
          }
          return target;
      }
      // target is already a Proxy, return it.
      // exception: calling readonly() on a reactive object
      if (target["__v_raw" /* RAW */] &&
          !(isReadonly && target["__v_isReactive" /* IS_REACTIVE */])) {
          return target;
      }
      // target already has corresponding Proxy
      const proxyMap = isReadonly ? readonlyMap : reactiveMap;
      const existingProxy = proxyMap.get(target);
      if (existingProxy) {
          return existingProxy;
      }
      // only a whitelist of value types can be observed.
      const targetType = getTargetType(target);
      if (targetType === 0 /* INVALID */) {
          return target;
      }
      const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
      proxyMap.set(target, proxy);
      return proxy;
  }
  function isReactive(value) {
      if (isReadonly(value)) {
          return isReactive(value["__v_raw" /* RAW */]);
      }
      return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
  }
  function isReadonly(value) {
      return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
  }
  function isProxy(value) {
      return isReactive(value) || isReadonly(value);
  }
  function toRaw(observed) {
      return ((observed && toRaw(observed["__v_raw" /* RAW */])) || observed);
  }
  function isRef(r) {
      return Boolean(r && r.__v_isRef === true);
  }

  const stack = [];
  function pushWarningContext(vnode) {
      stack.push(vnode);
  }
  function popWarningContext() {
      stack.pop();
  }
  function warn(msg, ...args) {
      // avoid props formatting or warn handler tracking deps that might be mutated
      // during patch, leading to infinite recursion.
      pauseTracking();
      const instance = stack.length ? stack[stack.length - 1].component : null;
      const appWarnHandler = instance && instance.appContext.config.warnHandler;
      const trace = getComponentTrace();
      if (appWarnHandler) {
          callWithErrorHandling(appWarnHandler, instance, 11 /* APP_WARN_HANDLER */, [
              msg + args.join(''),
              instance && instance.proxy,
              trace
                  .map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`)
                  .join('\n'),
              trace
          ]);
      }
      else {
          const warnArgs = [`[Vue warn]: ${msg}`, ...args];
          /* istanbul ignore if */
          if (trace.length &&
              // avoid spamming console during tests
              !false) {
              warnArgs.push(`\n`, ...formatTrace(trace));
          }
          console.warn(...warnArgs);
      }
      resetTracking();
  }
  function getComponentTrace() {
      let currentVNode = stack[stack.length - 1];
      if (!currentVNode) {
          return [];
      }
      // we can't just use the stack because it will be incomplete during updates
      // that did not start from the root. Re-construct the parent chain using
      // instance parent pointers.
      const normalizedStack = [];
      while (currentVNode) {
          const last = normalizedStack[0];
          if (last && last.vnode === currentVNode) {
              last.recurseCount++;
          }
          else {
              normalizedStack.push({
                  vnode: currentVNode,
                  recurseCount: 0
              });
          }
          const parentInstance = currentVNode.component && currentVNode.component.parent;
          currentVNode = parentInstance && parentInstance.vnode;
      }
      return normalizedStack;
  }
  /* istanbul ignore next */
  function formatTrace(trace) {
      const logs = [];
      trace.forEach((entry, i) => {
          logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
      });
      return logs;
  }
  function formatTraceEntry({ vnode, recurseCount }) {
      const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
      const isRoot = vnode.component ? vnode.component.parent == null : false;
      const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
      const close = `>` + postfix;
      return vnode.props
          ? [open, ...formatProps(vnode.props), close]
          : [open + close];
  }
  /* istanbul ignore next */
  function formatProps(props) {
      const res = [];
      const keys = Object.keys(props);
      keys.slice(0, 3).forEach(key => {
          res.push(...formatProp(key, props[key]));
      });
      if (keys.length > 3) {
          res.push(` ...`);
      }
      return res;
  }
  /* istanbul ignore next */
  function formatProp(key, value, raw) {
      if (isString(value)) {
          value = JSON.stringify(value);
          return raw ? value : [`${key}=${value}`];
      }
      else if (typeof value === 'number' ||
          typeof value === 'boolean' ||
          value == null) {
          return raw ? value : [`${key}=${value}`];
      }
      else if (isRef(value)) {
          value = formatProp(key, toRaw(value.value), true);
          return raw ? value : [`${key}=Ref<`, value, `>`];
      }
      else if (isFunction(value)) {
          return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
      }
      else {
          value = toRaw(value);
          return raw ? value : [`${key}=`, value];
      }
  }

  const ErrorTypeStrings = {
      ["bc" /* BEFORE_CREATE */]: 'beforeCreate hook',
      ["c" /* CREATED */]: 'created hook',
      ["bm" /* BEFORE_MOUNT */]: 'beforeMount hook',
      ["m" /* MOUNTED */]: 'mounted hook',
      ["bu" /* BEFORE_UPDATE */]: 'beforeUpdate hook',
      ["u" /* UPDATED */]: 'updated',
      ["bum" /* BEFORE_UNMOUNT */]: 'beforeUnmount hook',
      ["um" /* UNMOUNTED */]: 'unmounted hook',
      ["a" /* ACTIVATED */]: 'activated hook',
      ["da" /* DEACTIVATED */]: 'deactivated hook',
      ["ec" /* ERROR_CAPTURED */]: 'errorCaptured hook',
      ["rtc" /* RENDER_TRACKED */]: 'renderTracked hook',
      ["rtg" /* RENDER_TRIGGERED */]: 'renderTriggered hook',
      [0 /* SETUP_FUNCTION */]: 'setup function',
      [1 /* RENDER_FUNCTION */]: 'render function',
      [2 /* WATCH_GETTER */]: 'watcher getter',
      [3 /* WATCH_CALLBACK */]: 'watcher callback',
      [4 /* WATCH_CLEANUP */]: 'watcher cleanup function',
      [5 /* NATIVE_EVENT_HANDLER */]: 'native event handler',
      [6 /* COMPONENT_EVENT_HANDLER */]: 'component event handler',
      [7 /* VNODE_HOOK */]: 'vnode hook',
      [8 /* DIRECTIVE_HOOK */]: 'directive hook',
      [9 /* TRANSITION_HOOK */]: 'transition hook',
      [10 /* APP_ERROR_HANDLER */]: 'app errorHandler',
      [11 /* APP_WARN_HANDLER */]: 'app warnHandler',
      [12 /* FUNCTION_REF */]: 'ref function',
      [13 /* ASYNC_COMPONENT_LOADER */]: 'async component loader',
      [14 /* SCHEDULER */]: 'scheduler flush. This is likely a Vue internals bug. ' +
          'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-next'
  };
  function callWithErrorHandling(fn, instance, type, args) {
      let res;
      try {
          res = args ? fn(...args) : fn();
      }
      catch (err) {
          handleError(err, instance, type);
      }
      return res;
  }
  function callWithAsyncErrorHandling(fn, instance, type, args) {
      if (isFunction(fn)) {
          const res = callWithErrorHandling(fn, instance, type, args);
          if (res && isPromise(res)) {
              res.catch(err => {
                  handleError(err, instance, type);
              });
          }
          return res;
      }
      const values = [];
      for (let i = 0; i < fn.length; i++) {
          values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
      }
      return values;
  }
  function handleError(err, instance, type, throwInDev = true) {
      const contextVNode = instance ? instance.vnode : null;
      if (instance) {
          let cur = instance.parent;
          // the exposed instance is the render proxy to keep it consistent with 2.x
          const exposedInstance = instance.proxy;
          // in production the hook receives only the error code
          const errorInfo = (process.env.NODE_ENV !== 'production') ? ErrorTypeStrings[type] : type;
          while (cur) {
              const errorCapturedHooks = cur.ec;
              if (errorCapturedHooks) {
                  for (let i = 0; i < errorCapturedHooks.length; i++) {
                      if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                          return;
                      }
                  }
              }
              cur = cur.parent;
          }
          // app-level handling
          const appErrorHandler = instance.appContext.config.errorHandler;
          if (appErrorHandler) {
              callWithErrorHandling(appErrorHandler, null, 10 /* APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
              return;
          }
      }
      logError(err, type, contextVNode, throwInDev);
  }
  function logError(err, type, contextVNode, throwInDev = true) {
      if ((process.env.NODE_ENV !== 'production')) {
          const info = ErrorTypeStrings[type];
          if (contextVNode) {
              pushWarningContext(contextVNode);
          }
          warn(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
          if (contextVNode) {
              popWarningContext();
          }
          // crash in dev by default so it's more noticeable
          if (throwInDev) {
              throw err;
          }
          else {
              console.error(err);
          }
      }
      else {
          // recover in prod to reduce the impact on end-user
          console.error(err);
      }
  }

  let isFlushing = false;
  let isFlushPending = false;
  const queue = [];
  let flushIndex = 0;
  const pendingPreFlushCbs = [];
  let activePreFlushCbs = null;
  let preFlushIndex = 0;
  const pendingPostFlushCbs = [];
  let activePostFlushCbs = null;
  let postFlushIndex = 0;
  const resolvedPromise = Promise.resolve();
  let currentFlushPromise = null;
  let currentPreFlushParentJob = null;
  const RECURSION_LIMIT = 100;
  function nextTick(fn) {
      const p = currentFlushPromise || resolvedPromise;
      return fn ? p.then(this ? fn.bind(this) : fn) : p;
  }
  function queueJob(job) {
      // the dedupe search uses the startIndex argument of Array.includes()
      // by default the search index includes the current job that is being run
      // so it cannot recursively trigger itself again.
      // if the job is a watch() callback, the search will start with a +1 index to
      // allow it recursively trigger itself - it is the user's responsibility to
      // ensure it doesn't end up in an infinite loop.
      if ((!queue.length ||
          !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) &&
          job !== currentPreFlushParentJob) {
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
          if (!activeQueue ||
              !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
              pendingQueue.push(cb);
          }
      }
      else {
          // if cb is an array, it is a component lifecycle hook which can only be
          // triggered by a job, which is already deduped in the main queue, so
          // we can skip duplicate check here to improve perf
          pendingQueue.push(...cb);
      }
      queueFlush();
  }
  function queuePreFlushCb(cb) {
      queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
  }
  function queuePostFlushCb(cb) {
      queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
  }
  function flushPreFlushCbs(seen, parentJob = null) {
      if (pendingPreFlushCbs.length) {
          currentPreFlushParentJob = parentJob;
          activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
          pendingPreFlushCbs.length = 0;
          if ((process.env.NODE_ENV !== 'production')) {
              seen = seen || new Map();
          }
          for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
              if ((process.env.NODE_ENV !== 'production')) {
                  checkRecursiveUpdates(seen, activePreFlushCbs[preFlushIndex]);
              }
              activePreFlushCbs[preFlushIndex]();
          }
          activePreFlushCbs = null;
          preFlushIndex = 0;
          currentPreFlushParentJob = null;
          // recursively flush until it drains
          flushPreFlushCbs(seen, parentJob);
      }
  }
  function flushPostFlushCbs(seen) {
      if (pendingPostFlushCbs.length) {
          const deduped = [...new Set(pendingPostFlushCbs)];
          pendingPostFlushCbs.length = 0;
          // #1947 already has active queue, nested flushPostFlushCbs call
          if (activePostFlushCbs) {
              activePostFlushCbs.push(...deduped);
              return;
          }
          activePostFlushCbs = deduped;
          if ((process.env.NODE_ENV !== 'production')) {
              seen = seen || new Map();
          }
          activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
          for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
              if ((process.env.NODE_ENV !== 'production')) {
                  checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex]);
              }
              activePostFlushCbs[postFlushIndex]();
          }
          activePostFlushCbs = null;
          postFlushIndex = 0;
      }
  }
  const getId = (job) => job.id == null ? Infinity : job.id;
  function flushJobs(seen) {
      isFlushPending = false;
      isFlushing = true;
      if ((process.env.NODE_ENV !== 'production')) {
          seen = seen || new Map();
      }
      flushPreFlushCbs(seen);
      // Sort queue before flush.
      // This ensures that:
      // 1. Components are updated from parent to child. (because parent is always
      //    created before the child so its render effect will have smaller
      //    priority number)
      // 2. If a component is unmounted during a parent component's update,
      //    its update can be skipped.
      queue.sort((a, b) => getId(a) - getId(b));
      try {
          for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
              const job = queue[flushIndex];
              if (job) {
                  if ((process.env.NODE_ENV !== 'production')) {
                      checkRecursiveUpdates(seen, job);
                  }
                  callWithErrorHandling(job, null, 14 /* SCHEDULER */);
              }
          }
      }
      finally {
          flushIndex = 0;
          queue.length = 0;
          flushPostFlushCbs(seen);
          isFlushing = false;
          currentFlushPromise = null;
          // some postFlushCb queued jobs!
          // keep flushing until it drains.
          if (queue.length || pendingPostFlushCbs.length) {
              flushJobs(seen);
          }
      }
  }
  function checkRecursiveUpdates(seen, fn) {
      if (!seen.has(fn)) {
          seen.set(fn, 1);
      }
      else {
          const count = seen.get(fn);
          if (count > RECURSION_LIMIT) {
              throw new Error(`Maximum recursive updates exceeded. ` +
                  `This means you have a reactive effect that is mutating its own ` +
                  `dependencies and thus recursively triggering itself. Possible sources ` +
                  `include component template, render function, updated hook or ` +
                  `watcher source function.`);
          }
          else {
              seen.set(fn, count + 1);
          }
      }
  }
  const hmrDirtyComponents = new Set();
  // Expose the HMR runtime on the global object
  // This makes it entirely tree-shakable without polluting the exports and makes
  // it easier to be used in toolings like vue-loader
  // Note: for a component to be eligible for HMR it also needs the __hmrId option
  // to be set so that its instances can be registered / removed.
  if ((process.env.NODE_ENV !== 'production')) {
      const globalObject = typeof global !== 'undefined'
          ? global
          : typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
                  ? window
                  : {};
      globalObject.__VUE_HMR_RUNTIME__ = {
          createRecord: tryWrap(createRecord),
          rerender: tryWrap(rerender),
          reload: tryWrap(reload)
      };
  }
  const map = new Map();
  function createRecord(id, component) {
      if (!component) {
          warn(`HMR API usage is out of date.\n` +
              `Please upgrade vue-loader/vite/rollup-plugin-vue or other relevant ` +
              `depdendency that handles Vue SFC compilation.`);
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
      const record = map.get(id);
      if (!record)
          return;
      if (newRender)
          record.component.render = newRender;
      // Array.from creates a snapshot which avoids the set being mutated during
      // updates
      Array.from(record.instances).forEach(instance => {
          if (newRender) {
              instance.render = newRender;
          }
          instance.renderCache = [];
          instance.update();
      });
  }
  function reload(id, newComp) {
      const record = map.get(id);
      if (!record)
          return;
      // Array.from creates a snapshot which avoids the set being mutated during
      // updates
      const { component, instances } = record;
      if (!hmrDirtyComponents.has(component)) {
          // 1. Update existing comp definition to match new one
          newComp = isClassComponent(newComp) ? newComp.__vccOpts : newComp;
          extend(component, newComp);
          for (const key in component) {
              if (!(key in newComp)) {
                  delete component[key];
              }
          }
          // 2. Mark component dirty. This forces the renderer to replace the component
          // on patch.
          hmrDirtyComponents.add(component);
          // 3. Make sure to unmark the component after the reload.
          queuePostFlushCb(() => {
              hmrDirtyComponents.delete(component);
          });
      }
      Array.from(instances).forEach(instance => {
          if (instance.parent) {
              // 4. Force the parent instance to re-render. This will cause all updated
              // components to be unmounted and re-mounted. Queue the update so that we
              // don't end up forcing the same parent to re-render multiple times.
              queueJob(instance.parent.update);
          }
          else if (instance.appContext.reload) {
              // root instance mounted via createApp() has a reload method
              instance.appContext.reload();
          }
          else if (typeof window !== 'undefined') {
              // root instance inside tree created via raw render(). Force reload.
              window.location.reload();
          }
          else {
              console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
          }
      });
  }
  function tryWrap(fn) {
      return (id, arg) => {
          try {
              return fn(id, arg);
          }
          catch (e) {
              console.error(e);
              console.warn(`[HMR] Something went wrong during Vue component hot-reload. ` +
                  `Full reload required.`);
          }
      };
  }
  function setDevtoolsHook(hook) {
  }

  /**
   * mark the current rendering instance for asset resolution (e.g.
   * resolveComponent, resolveDirective) during render
   */
  let currentRenderingInstance = null;
  function setCurrentRenderingInstance(instance) {
      currentRenderingInstance = instance;
  }
  function markAttrsAccessed() {
  }
  function filterSingleRoot(children) {
      let singleRoot;
      for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (isVNode(child)) {
              // ignore user comment
              if (child.type !== Comment || child.children === 'v-if') {
                  if (singleRoot) {
                      // has more than 1 non-comment child, return now
                      return;
                  }
                  else {
                      singleRoot = child;
                  }
              }
          }
          else {
              return;
          }
      }
      return singleRoot;
  }

  const isSuspense = (type) => type.__isSuspense;
  function normalizeSuspenseChildren(vnode) {
      const { shapeFlag, children } = vnode;
      let content;
      let fallback;
      if (shapeFlag & 32 /* SLOTS_CHILDREN */) {
          content = normalizeSuspenseSlot(children.default);
          fallback = normalizeSuspenseSlot(children.fallback);
      }
      else {
          content = normalizeSuspenseSlot(children);
          fallback = normalizeVNode(null);
      }
      return {
          content,
          fallback
      };
  }
  function normalizeSuspenseSlot(s) {
      if (isFunction(s)) {
          s = s();
      }
      if (isArray(s)) {
          const singleChild = filterSingleRoot(s);
          if ((process.env.NODE_ENV !== 'production') && !singleChild) {
              warn(`<Suspense> slots expect a single root node.`);
          }
          s = singleChild;
      }
      return normalizeVNode(s);
  }
  function queueEffectWithSuspense(fn, suspense) {
      if (suspense && suspense.pendingBranch) {
          if (isArray(fn)) {
              suspense.effects.push(...fn);
          }
          else {
              suspense.effects.push(fn);
          }
      }
      else {
          queuePostFlushCb(fn);
      }
  }

  let isRenderingCompiledSlot = 0;
  const setCompiledSlotRendering = (n) => (isRenderingCompiledSlot += n);

  /**
   * Wrap a slot function to memoize current rendering instance
   * @private
   */
  function withCtx(fn, ctx = currentRenderingInstance) {
      if (!ctx)
          return fn;
      const renderFnWithContext = (...args) => {
          // If a user calls a compiled slot inside a template expression (#1745), it
          // can mess up block tracking, so by default we need to push a null block to
          // avoid that. This isn't necessary if rendering a compiled `<slot>`.
          if (!isRenderingCompiledSlot) {
              openBlock(true /* null block that disables tracking */);
          }
          const owner = currentRenderingInstance;
          setCurrentRenderingInstance(ctx);
          const res = fn(...args);
          setCurrentRenderingInstance(owner);
          if (!isRenderingCompiledSlot) {
              closeBlock();
          }
          return res;
      };
      renderFnWithContext._c = true;
      return renderFnWithContext;
  }

  // SFC scoped style ID management.
  let currentScopeId = null;
  const scopeIdStack = [];
  /**
   * @private
   */
  function pushScopeId(id) {
      scopeIdStack.push((currentScopeId = id));
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
      return ((fn) => withCtx(function () {
          pushScopeId(id);
          const res = fn.apply(this, arguments);
          popScopeId();
          return res;
      }));
  }
  // initial value for watchers to trigger on undefined initial values
  const INITIAL_WATCHER_VALUE = {};
  function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ, instance = currentInstance) {
      if ((process.env.NODE_ENV !== 'production') && !cb) {
          if (immediate !== undefined) {
              warn(`watch() "immediate" option is only respected when using the ` +
                  `watch(source, callback, options?) signature.`);
          }
          if (deep !== undefined) {
              warn(`watch() "deep" option is only respected when using the ` +
                  `watch(source, callback, options?) signature.`);
          }
      }
      const warnInvalidSource = (s) => {
          warn(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, ` +
              `a reactive object, or an array of these types.`);
      };
      let getter;
      let forceTrigger = false;
      if (isRef(source)) {
          getter = () => source.value;
          forceTrigger = !!source._shallow;
      }
      else if (isReactive(source)) {
          getter = () => source;
          deep = true;
      }
      else if (isArray(source)) {
          getter = () => source.map(s => {
              if (isRef(s)) {
                  return s.value;
              }
              else if (isReactive(s)) {
                  return traverse(s);
              }
              else if (isFunction(s)) {
                  return callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */);
              }
              else {
                  (process.env.NODE_ENV !== 'production') && warnInvalidSource(s);
              }
          });
      }
      else if (isFunction(source)) {
          if (cb) {
              // getter with cb
              getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */);
          }
          else {
              // no cb -> simple effect
              getter = () => {
                  if (instance && instance.isUnmounted) {
                      return;
                  }
                  if (cleanup) {
                      cleanup();
                  }
                  return callWithErrorHandling(source, instance, 3 /* WATCH_CALLBACK */, [onInvalidate]);
              };
          }
      }
      else {
          getter = NOOP;
          (process.env.NODE_ENV !== 'production') && warnInvalidSource(source);
      }
      if (cb && deep) {
          const baseGetter = getter;
          getter = () => traverse(baseGetter());
      }
      let cleanup;
      const onInvalidate = (fn) => {
          cleanup = runner.options.onStop = () => {
              callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */);
          };
      };
      let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE;
      const job = () => {
          if (!runner.active) {
              return;
          }
          if (cb) {
              // watch(source, cb)
              const newValue = runner();
              if (deep || forceTrigger || hasChanged(newValue, oldValue)) {
                  // cleanup before running cb again
                  if (cleanup) {
                      cleanup();
                  }
                  callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                      newValue,
                      // pass undefined as the old value when it's changed for the first time
                      oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                      onInvalidate
                  ]);
                  oldValue = newValue;
              }
          }
          else {
              // watchEffect
              runner();
          }
      };
      // important: mark the job as a watcher callback so that scheduler knows
      // it is allowed to self-trigger (#1727)
      job.allowRecurse = !!cb;
      let scheduler;
      if (flush === 'sync') {
          scheduler = job;
      }
      else if (flush === 'post') {
          scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
      }
      else {
          // default: 'pre'
          scheduler = () => {
              if (!instance || instance.isMounted) {
                  queuePreFlushCb(job);
              }
              else {
                  // with 'pre' option, the first call must happen before
                  // the component is mounted so it is called synchronously.
                  job();
              }
          };
      }
      const runner = effect(getter, {
          lazy: true,
          onTrack,
          onTrigger,
          scheduler
      });
      recordInstanceBoundEffect(runner, instance);
      // initial run
      if (cb) {
          if (immediate) {
              job();
          }
          else {
              oldValue = runner();
          }
      }
      else if (flush === 'post') {
          queuePostRenderEffect(runner, instance && instance.suspense);
      }
      else {
          runner();
      }
      return () => {
          stop(runner);
          if (instance) {
              remove(instance.effects, runner);
          }
      };
  }
  // this.$watch
  function instanceWatch(source, cb, options) {
      const publicThis = this.proxy;
      const getter = isString(source)
          ? () => publicThis[source]
          : source.bind(publicThis);
      return doWatch(getter, cb.bind(publicThis), options, this);
  }
  function traverse(value, seen = new Set()) {
      if (!isObject(value) || seen.has(value)) {
          return value;
      }
      seen.add(value);
      if (isRef(value)) {
          traverse(value.value, seen);
      }
      else if (isArray(value)) {
          for (let i = 0; i < value.length; i++) {
              traverse(value[i], seen);
          }
      }
      else if (isSet(value) || isMap(value)) {
          value.forEach((v) => {
              traverse(v, seen);
          });
      }
      else {
          for (const key in value) {
              traverse(value[key], seen);
          }
      }
      return value;
  }
  const queuePostRenderEffect =  queueEffectWithSuspense
      ;

  const isTeleport = (type) => type.__isTeleport;
  const NULL_DYNAMIC_COMPONENT = Symbol();

  const Fragment = Symbol((process.env.NODE_ENV !== 'production') ? 'Fragment' : undefined);
  const Text = Symbol((process.env.NODE_ENV !== 'production') ? 'Text' : undefined);
  const Comment = Symbol((process.env.NODE_ENV !== 'production') ? 'Comment' : undefined);
  const Static = Symbol((process.env.NODE_ENV !== 'production') ? 'Static' : undefined);
  // Since v-if and v-for are the two possible ways node structure can dynamically
  // change, once we consider v-if branches and each v-for fragment a block, we
  // can divide a template into nested blocks, and within each block the node
  // structure would be stable. This allows us to skip most children diffing
  // and only worry about the dynamic nodes (indicated by patch flags).
  const blockStack = [];
  let currentBlock = null;
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
  function openBlock(disableTracking = false) {
      blockStack.push((currentBlock = disableTracking ? null : []));
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
      const vnode = createVNode(type, props, children, patchFlag, dynamicProps, true /* isBlock: prevent a block from tracking itself */);
      // save current block children on the block vnode
      vnode.dynamicChildren = currentBlock || EMPTY_ARR;
      // close block
      closeBlock();
      // a block is always going to be patched, so track it as a child of its
      // parent block
      if ( currentBlock) {
          currentBlock.push(vnode);
      }
      return vnode;
  }
  function isVNode(value) {
      return value ? value.__v_isVNode === true : false;
  }
  const createVNodeWithArgsTransform = (...args) => {
      return _createVNode(...( args));
  };
  const InternalObjectKey = `__vInternal`;
  const normalizeKey = ({ key }) => key != null ? key : null;
  const normalizeRef = ({ ref }) => {
      return (ref != null
          ? isString(ref) || isRef(ref) || isFunction(ref)
              ? { i: currentRenderingInstance, r: ref }
              : ref
          : null);
  };
  const createVNode = ((process.env.NODE_ENV !== 'production')
      ? createVNodeWithArgsTransform
      : _createVNode);
  function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
      if (!type || type === NULL_DYNAMIC_COMPONENT) {
          if ((process.env.NODE_ENV !== 'production') && !type) {
              warn(`Invalid vnode type when creating vnode: ${type}.`);
          }
          type = Comment;
      }
      if (isVNode(type)) {
          // createVNode receiving an existing vnode. This happens in cases like
          // <component :is="vnode"/>
          // #2078 make sure to merge refs during the clone instead of overwriting it
          const cloned = cloneVNode(type, props, true /* mergeRef: true */);
          if (children) {
              normalizeChildren(cloned, children);
          }
          return cloned;
      }
      // class component normalization.
      if (isClassComponent(type)) {
          type = type.__vccOpts;
      }
      // class & style normalization.
      if (props) {
          // for reactive or proxy objects, we need to clone it to enable mutation.
          if (isProxy(props) || InternalObjectKey in props) {
              props = extend({}, props);
          }
          let { class: klass, style } = props;
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
      }
      // encode the vnode type information into a bitmap
      const shapeFlag = isString(type)
          ? 1 /* ELEMENT */
          :  isSuspense(type)
              ? 128 /* SUSPENSE */
              : isTeleport(type)
                  ? 64 /* TELEPORT */
                  : isObject(type)
                      ? 4 /* STATEFUL_COMPONENT */
                      : isFunction(type)
                          ? 2 /* FUNCTIONAL_COMPONENT */
                          : 0;
      if ((process.env.NODE_ENV !== 'production') && shapeFlag & 4 /* STATEFUL_COMPONENT */ && isProxy(type)) {
          type = toRaw(type);
          warn(`Vue received a Component which was made a reactive object. This can ` +
              `lead to unnecessary performance overhead, and should be avoided by ` +
              `marking the component with \`markRaw\` or using \`shallowRef\` ` +
              `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
      }
      const vnode = {
          __v_isVNode: true,
          ["__v_skip" /* SKIP */]: true,
          type,
          props,
          key: props && normalizeKey(props),
          ref: props && normalizeRef(props),
          scopeId: currentScopeId,
          children: null,
          component: null,
          suspense: null,
          ssContent: null,
          ssFallback: null,
          dirs: null,
          transition: null,
          el: null,
          anchor: null,
          target: null,
          targetAnchor: null,
          staticCount: 0,
          shapeFlag,
          patchFlag,
          dynamicProps,
          dynamicChildren: null,
          appContext: null
      };
      // validate key
      if ((process.env.NODE_ENV !== 'production') && vnode.key !== vnode.key) {
          warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
      }
      normalizeChildren(vnode, children);
      // normalize suspense children
      if ( shapeFlag & 128 /* SUSPENSE */) {
          const { content, fallback } = normalizeSuspenseChildren(vnode);
          vnode.ssContent = content;
          vnode.ssFallback = fallback;
      }
      if (
          // avoid a block node from tracking itself
          !isBlockNode &&
          // has current parent block
          currentBlock &&
          // presence of a patch flag indicates this node needs patching on updates.
          // component nodes also should always be patched, because even if the
          // component doesn't need to update, it needs to persist the instance on to
          // the next vnode so that it can be properly unmounted later.
          (patchFlag > 0 || shapeFlag & 6 /* COMPONENT */) &&
          // the EVENTS flag is only for hydration and if it is the only flag, the
          // vnode should not be considered dynamic due to handler caching.
          patchFlag !== 32 /* HYDRATE_EVENTS */) {
          currentBlock.push(vnode);
      }
      return vnode;
  }
  function cloneVNode(vnode, extraProps, mergeRef = false) {
      // This is intentionally NOT using spread or extend to avoid the runtime
      // key enumeration cost.
      const { props, ref, patchFlag } = vnode;
      const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
      return {
          __v_isVNode: true,
          ["__v_skip" /* SKIP */]: true,
          type: vnode.type,
          props: mergedProps,
          key: mergedProps && normalizeKey(mergedProps),
          ref: extraProps && extraProps.ref
              ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                  // if the vnode itself already has a ref, cloneVNode will need to merge
                  // the refs so the single vnode can be set on multiple refs
                  mergeRef && ref
                      ? isArray(ref)
                          ? ref.concat(normalizeRef(extraProps))
                          : [ref, normalizeRef(extraProps)]
                      : normalizeRef(extraProps)
              : ref,
          scopeId: vnode.scopeId,
          children: vnode.children,
          target: vnode.target,
          targetAnchor: vnode.targetAnchor,
          staticCount: vnode.staticCount,
          shapeFlag: vnode.shapeFlag,
          // if the vnode is cloned with extra props, we can no longer assume its
          // existing patch flag to be reliable and need to add the FULL_PROPS flag.
          // note: perserve flag for fragments since they use the flag for children
          // fast paths only.
          patchFlag: extraProps && vnode.type !== Fragment
              ? patchFlag === -1 // hoisted node
                  ? 16 /* FULL_PROPS */
                  : patchFlag | 16 /* FULL_PROPS */
              : patchFlag,
          dynamicProps: vnode.dynamicProps,
          dynamicChildren: vnode.dynamicChildren,
          appContext: vnode.appContext,
          dirs: vnode.dirs,
          transition: vnode.transition,
          // These should technically only be non-null on mounted VNodes. However,
          // they *should* be copied for kept-alive vnodes. So we just always copy
          // them since them being non-null during a mount doesn't affect the logic as
          // they will simply be overwritten.
          component: vnode.component,
          suspense: vnode.suspense,
          ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
          ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
          el: vnode.el,
          anchor: vnode.anchor
      };
  }
  /**
   * @private
   */
  function createTextVNode(text = ' ', flag = 0) {
      return createVNode(Text, null, text, flag);
  }
  function normalizeVNode(child) {
      if (child == null || typeof child === 'boolean') {
          // empty placeholder
          return createVNode(Comment);
      }
      else if (isArray(child)) {
          // fragment
          return createVNode(Fragment, null, child);
      }
      else if (typeof child === 'object') {
          // already vnode, this should be the most common since compiled templates
          // always produce all-vnode children arrays
          return child.el === null ? child : cloneVNode(child);
      }
      else {
          // strings and numbers
          return createVNode(Text, null, String(child));
      }
  }
  function normalizeChildren(vnode, children) {
      let type = 0;
      const { shapeFlag } = vnode;
      if (children == null) {
          children = null;
      }
      else if (isArray(children)) {
          type = 16 /* ARRAY_CHILDREN */;
      }
      else if (typeof children === 'object') {
          if (shapeFlag & 1 /* ELEMENT */ || shapeFlag & 64 /* TELEPORT */) {
              // Normalize slot to plain children for plain element and Teleport
              const slot = children.default;
              if (slot) {
                  // _c marker is added by withCtx() indicating this is a compiled slot
                  slot._c && setCompiledSlotRendering(1);
                  normalizeChildren(vnode, slot());
                  slot._c && setCompiledSlotRendering(-1);
              }
              return;
          }
          else {
              type = 32 /* SLOTS_CHILDREN */;
              const slotFlag = children._;
              if (!slotFlag && !(InternalObjectKey in children)) {
                  children._ctx = currentRenderingInstance;
              }
              else if (slotFlag === 3 /* FORWARDED */ && currentRenderingInstance) {
                  // a child component receives forwarded slots from the parent.
                  // its slot type is determined by its parent's slot type.
                  if (currentRenderingInstance.vnode.patchFlag & 1024 /* DYNAMIC_SLOTS */) {
                      children._ = 2 /* DYNAMIC */;
                      vnode.patchFlag |= 1024 /* DYNAMIC_SLOTS */;
                  }
                  else {
                      children._ = 1 /* STABLE */;
                  }
              }
          }
      }
      else if (isFunction(children)) {
          children = { default: children, _ctx: currentRenderingInstance };
          type = 32 /* SLOTS_CHILDREN */;
      }
      else {
          children = String(children);
          // force teleport children to array so it can be moved around
          if (shapeFlag & 64 /* TELEPORT */) {
              type = 16 /* ARRAY_CHILDREN */;
              children = [createTextVNode(children)];
          }
          else {
              type = 8 /* TEXT_CHILDREN */;
          }
      }
      vnode.children = children;
      vnode.shapeFlag |= type;
  }
  function mergeProps(...args) {
      const ret = extend({}, args[0]);
      for (let i = 1; i < args.length; i++) {
          const toMerge = args[i];
          for (const key in toMerge) {
              if (key === 'class') {
                  if (ret.class !== toMerge.class) {
                      ret.class = normalizeClass([ret.class, toMerge.class]);
                  }
              }
              else if (key === 'style') {
                  ret.style = normalizeStyle([ret.style, toMerge.style]);
              }
              else if (isOn(key)) {
                  const existing = ret[key];
                  const incoming = toMerge[key];
                  if (existing !== incoming) {
                      ret[key] = existing
                          ? [].concat(existing, toMerge[key])
                          : incoming;
                  }
              }
              else if (key !== '') {
                  ret[key] = toMerge[key];
              }
          }
      }
      return ret;
  }
  let isInBeforeCreate = false;
  function resolveMergedOptions(instance) {
      const raw = instance.type;
      const { __merged, mixins, extends: extendsOptions } = raw;
      if (__merged)
          return __merged;
      const globalMixins = instance.appContext.mixins;
      if (!globalMixins.length && !mixins && !extendsOptions)
          return raw;
      const options = {};
      globalMixins.forEach(m => mergeOptions(options, m, instance));
      mergeOptions(options, raw, instance);
      return (raw.__merged = options);
  }
  function mergeOptions(to, from, instance) {
      const strats = instance.appContext.config.optionMergeStrategies;
      const { mixins, extends: extendsOptions } = from;
      extendsOptions && mergeOptions(to, extendsOptions, instance);
      mixins &&
          mixins.forEach((m) => mergeOptions(to, m, instance));
      for (const key in from) {
          if (strats && hasOwn(strats, key)) {
              to[key] = strats[key](to[key], from[key], instance.proxy, key);
          }
          else {
              to[key] = from[key];
          }
      }
  }

  /**
   * #2437 In Vue 3, functional components do not have a public instance proxy but
   * they exist in the internal parent chain. For code that relies on traversing
   * public $parent chains, skip functional ones and go to the parent instead.
   */
  const getPublicInstance = (i) => i && (i.proxy ? i.proxy : getPublicInstance(i.parent));
  const publicPropertiesMap = extend(Object.create(null), {
      $: i => i,
      $el: i => i.vnode.el,
      $data: i => i.data,
      $props: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly(i.props) : i.props),
      $attrs: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly(i.attrs) : i.attrs),
      $slots: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly(i.slots) : i.slots),
      $refs: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly(i.refs) : i.refs),
      $parent: i => getPublicInstance(i.parent),
      $root: i => i.root && i.root.proxy,
      $emit: i => i.emit,
      $options: i => (__VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type),
      $forceUpdate: i => () => queueJob(i.update),
      $nextTick: i => nextTick.bind(i.proxy),
      $watch: i => (__VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP)
  });
  const PublicInstanceProxyHandlers = {
      get({ _: instance }, key) {
          const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
          // let @vue/reactivity know it should never observe Vue public instances.
          if (key === "__v_skip" /* SKIP */) {
              return true;
          }
          // for internal formatters to know that this is a Vue instance
          if ((process.env.NODE_ENV !== 'production') && key === '__isVue') {
              return true;
          }
          // data / props / ctx
          // This getter gets called for every property access on the render context
          // during render and is a major hotspot. The most expensive part of this
          // is the multiple hasOwn() calls. It's much faster to do a simple property
          // access on a plain object, so we use an accessCache object (with null
          // prototype) to memoize what access type a key corresponds to.
          let normalizedProps;
          if (key[0] !== '$') {
              const n = accessCache[key];
              if (n !== undefined) {
                  switch (n) {
                      case 0 /* SETUP */:
                          return setupState[key];
                      case 1 /* DATA */:
                          return data[key];
                      case 3 /* CONTEXT */:
                          return ctx[key];
                      case 2 /* PROPS */:
                          return props[key];
                      // default: just fallthrough
                  }
              }
              else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
                  accessCache[key] = 0 /* SETUP */;
                  return setupState[key];
              }
              else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
                  accessCache[key] = 1 /* DATA */;
                  return data[key];
              }
              else if (
              // only cache other properties when instance has declared (thus stable)
              // props
              (normalizedProps = instance.propsOptions[0]) &&
                  hasOwn(normalizedProps, key)) {
                  accessCache[key] = 2 /* PROPS */;
                  return props[key];
              }
              else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
                  accessCache[key] = 3 /* CONTEXT */;
                  return ctx[key];
              }
              else if (!__VUE_OPTIONS_API__ || !isInBeforeCreate) {
                  accessCache[key] = 4 /* OTHER */;
              }
          }
          const publicGetter = publicPropertiesMap[key];
          let cssModule, globalProperties;
          // public $xxx properties
          if (publicGetter) {
              if (key === '$attrs') {
                  track(instance, "get" /* GET */, key);
                  (process.env.NODE_ENV !== 'production') && markAttrsAccessed();
              }
              return publicGetter(instance);
          }
          else if (
          // css module (injected by vue-loader)
          (cssModule = type.__cssModules) &&
              (cssModule = cssModule[key])) {
              return cssModule;
          }
          else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
              // user may set custom properties to `this` that start with `$`
              accessCache[key] = 3 /* CONTEXT */;
              return ctx[key];
          }
          else if (
          // global properties
          ((globalProperties = appContext.config.globalProperties),
              hasOwn(globalProperties, key))) {
              return globalProperties[key];
          }
          else if ((process.env.NODE_ENV !== 'production') &&
              currentRenderingInstance &&
              (!isString(key) ||
                  // #1091 avoid internal isRef/isVNode checks on component instance leading
                  // to infinite warning loop
                  key.indexOf('__v') !== 0)) {
              if (data !== EMPTY_OBJ &&
                  (key[0] === '$' || key[0] === '_') &&
                  hasOwn(data, key)) {
                  warn(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved ` +
                      `character ("$" or "_") and is not proxied on the render context.`);
              }
              else {
                  warn(`Property ${JSON.stringify(key)} was accessed during render ` +
                      `but is not defined on instance.`);
              }
          }
      },
      set({ _: instance }, key, value) {
          const { data, setupState, ctx } = instance;
          if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
              setupState[key] = value;
          }
          else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
              data[key] = value;
          }
          else if (key in instance.props) {
              (process.env.NODE_ENV !== 'production') &&
                  warn(`Attempting to mutate prop "${key}". Props are readonly.`, instance);
              return false;
          }
          if (key[0] === '$' && key.slice(1) in instance) {
              (process.env.NODE_ENV !== 'production') &&
                  warn(`Attempting to mutate public property "${key}". ` +
                      `Properties starting with $ are reserved and readonly.`, instance);
              return false;
          }
          else {
              if ((process.env.NODE_ENV !== 'production') && key in instance.appContext.config.globalProperties) {
                  Object.defineProperty(ctx, key, {
                      enumerable: true,
                      configurable: true,
                      value
                  });
              }
              else {
                  ctx[key] = value;
              }
          }
          return true;
      },
      has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
          let normalizedProps;
          return (accessCache[key] !== undefined ||
              (data !== EMPTY_OBJ && hasOwn(data, key)) ||
              (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) ||
              ((normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key)) ||
              hasOwn(ctx, key) ||
              hasOwn(publicPropertiesMap, key) ||
              hasOwn(appContext.config.globalProperties, key));
      }
  };
  if ((process.env.NODE_ENV !== 'production') && !false) {
      PublicInstanceProxyHandlers.ownKeys = (target) => {
          warn(`Avoid app logic that relies on enumerating keys on a component instance. ` +
              `The keys will be empty in production mode to avoid performance overhead.`);
          return Reflect.ownKeys(target);
      };
  }
  const RuntimeCompiledPublicInstanceProxyHandlers = extend({}, PublicInstanceProxyHandlers, {
      get(target, key) {
          // fast path for unscopables when using `with` block
          if (key === Symbol.unscopables) {
              return;
          }
          return PublicInstanceProxyHandlers.get(target, key, target);
      },
      has(_, key) {
          const has = key[0] !== '_' && !isGloballyWhitelisted(key);
          if ((process.env.NODE_ENV !== 'production') && !has && PublicInstanceProxyHandlers.has(_, key)) {
              warn(`Property ${JSON.stringify(key)} should not start with _ which is a reserved prefix for Vue internals.`);
          }
          return has;
      }
  });
  let currentInstance = null;
  // record effects created during a component's setup() so that they can be
  // stopped when the component unmounts
  function recordInstanceBoundEffect(effect, instance = currentInstance) {
      if (instance) {
          (instance.effects || (instance.effects = [])).push(effect);
      }
  }
  const classifyRE = /(?:^|[-_])(\w)/g;
  const classify = (str) => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');
  /* istanbul ignore next */
  function formatComponentName(instance, Component, isRoot = false) {
      let name = isFunction(Component)
          ? Component.displayName || Component.name
          : Component.name;
      if (!name && Component.__file) {
          const match = Component.__file.match(/([^/\\]+)\.\w+$/);
          if (match) {
              name = match[1];
          }
      }
      if (!name && instance && instance.parent) {
          // try to infer the name based on reverse resolution
          const inferFromRegistry = (registry) => {
              for (const key in registry) {
                  if (registry[key] === Component) {
                      return key;
                  }
              }
          };
          name =
              inferFromRegistry(instance.components ||
                  instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
      }
      return name ? classify(name) : isRoot ? `App` : `Anonymous`;
  }
  function isClassComponent(value) {
      return isFunction(value) && '__vccOpts' in value;
  }

  const ssrContextKey = Symbol((process.env.NODE_ENV !== 'production') ? `ssrContext` : ``);

  function initCustomFormatter() {
      /* eslint-disable no-restricted-globals */
      if (!(process.env.NODE_ENV !== 'production') || typeof window === 'undefined') {
          return;
      }
      const vueStyle = { style: 'color:#3ba776' };
      const numberStyle = { style: 'color:#0b1bc9' };
      const stringStyle = { style: 'color:#b62e24' };
      const keywordStyle = { style: 'color:#9d288c' };
      // custom formatter for Chrome
      // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html
      const formatter = {
          header(obj) {
              // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
              if (!isObject(obj)) {
                  return null;
              }
              if (obj.__isVue) {
                  return ['div', vueStyle, `VueInstance`];
              }
              else if (isRef(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, genRefFlag(obj)],
                      '<',
                      formatValue(obj.value),
                      `>`
                  ];
              }
              else if (isReactive(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, 'Reactive'],
                      '<',
                      formatValue(obj),
                      `>${isReadonly(obj) ? ` (readonly)` : ``}`
                  ];
              }
              else if (isReadonly(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, 'Readonly'],
                      '<',
                      formatValue(obj),
                      '>'
                  ];
              }
              return null;
          },
          hasBody(obj) {
              return obj && obj.__isVue;
          },
          body(obj) {
              if (obj && obj.__isVue) {
                  return [
                      'div',
                      {},
                      ...formatInstance(obj.$)
                  ];
              }
          }
      };
      function formatInstance(instance) {
          const blocks = [];
          if (instance.type.props && instance.props) {
              blocks.push(createInstanceBlock('props', toRaw(instance.props)));
          }
          if (instance.setupState !== EMPTY_OBJ) {
              blocks.push(createInstanceBlock('setup', instance.setupState));
          }
          if (instance.data !== EMPTY_OBJ) {
              blocks.push(createInstanceBlock('data', toRaw(instance.data)));
          }
          const computed = extractKeys(instance, 'computed');
          if (computed) {
              blocks.push(createInstanceBlock('computed', computed));
          }
          const injected = extractKeys(instance, 'inject');
          if (injected) {
              blocks.push(createInstanceBlock('injected', injected));
          }
          blocks.push([
              'div',
              {},
              [
                  'span',
                  {
                      style: keywordStyle.style + ';opacity:0.66'
                  },
                  '$ (internal): '
              ],
              ['object', { object: instance }]
          ]);
          return blocks;
      }
      function createInstanceBlock(type, target) {
          target = extend({}, target);
          if (!Object.keys(target).length) {
              return ['span', {}];
          }
          return [
              'div',
              { style: 'line-height:1.25em;margin-bottom:0.6em' },
              [
                  'div',
                  {
                      style: 'color:#476582'
                  },
                  type
              ],
              [
                  'div',
                  {
                      style: 'padding-left:1.25em'
                  },
                  ...Object.keys(target).map(key => {
                      return [
                          'div',
                          {},
                          ['span', keywordStyle, key + ': '],
                          formatValue(target[key], false)
                      ];
                  })
              ]
          ];
      }
      function formatValue(v, asRaw = true) {
          if (typeof v === 'number') {
              return ['span', numberStyle, v];
          }
          else if (typeof v === 'string') {
              return ['span', stringStyle, JSON.stringify(v)];
          }
          else if (typeof v === 'boolean') {
              return ['span', keywordStyle, v];
          }
          else if (isObject(v)) {
              return ['object', { object: asRaw ? toRaw(v) : v }];
          }
          else {
              return ['span', stringStyle, String(v)];
          }
      }
      function extractKeys(instance, type) {
          const Comp = instance.type;
          if (isFunction(Comp)) {
              return;
          }
          const extracted = {};
          for (const key in instance.ctx) {
              if (isKeyOfType(Comp, key, type)) {
                  extracted[key] = instance.ctx[key];
              }
          }
          return extracted;
      }
      function isKeyOfType(Comp, key, type) {
          const opts = Comp[type];
          if ((isArray(opts) && opts.includes(key)) ||
              (isObject(opts) && key in opts)) {
              return true;
          }
          if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
              return true;
          }
          if (Comp.mixins && Comp.mixins.some(m => isKeyOfType(m, key, type))) {
              return true;
          }
      }
      function genRefFlag(v) {
          if (v._shallow) {
              return `ShallowRef`;
          }
          if (v.effect) {
              return `ComputedRef`;
          }
          return `Ref`;
      }
      if (window.devtoolsFormatters) {
          window.devtoolsFormatters.push(formatter);
      }
      else {
          window.devtoolsFormatters = [formatter];
      }
  }

  function initDev() {
      const target = getGlobalThis();
      target.__VUE__ = true;
      setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__);
      {
          initCustomFormatter();
      }
  }

  // This entry exports the runtime only, and is built as
  (process.env.NODE_ENV !== 'production') && initDev();

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
    version: "0.9.0-ropez.1",
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

  function _typeof$1(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof$1 = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof$1 = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
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

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
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
      const map = Object.create(null);
      const list = str.split(',');
      for (let i = 0; i < list.length; i++) {
          map[list[i]] = true;
      }
      return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
  }

  const GLOBALS_WHITE_LISTED$1 = 'Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,' +
      'decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,' +
      'Object,Boolean,String,RegExp,Map,Set,JSON,Intl';
  const isGloballyWhitelisted$1 = /*#__PURE__*/ makeMap$1(GLOBALS_WHITE_LISTED$1);

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
  const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
  const isSpecialBooleanAttr = /*#__PURE__*/ makeMap$1(specialBooleanAttrs);

  function normalizeStyle$1(value) {
      if (isArray$1(value)) {
          const res = {};
          for (let i = 0; i < value.length; i++) {
              const item = value[i];
              const normalized = normalizeStyle$1(isString$1(item) ? parseStringStyle$1(item) : item);
              if (normalized) {
                  for (const key in normalized) {
                      res[key] = normalized[key];
                  }
              }
          }
          return res;
      }
      else if (isObject$1(value)) {
          return value;
      }
  }
  const listDelimiterRE$1 = /;(?![^(]*\))/g;
  const propertyDelimiterRE$1 = /:(.+)/;
  function parseStringStyle$1(cssText) {
      const ret = {};
      cssText.split(listDelimiterRE$1).forEach(item => {
          if (item) {
              const tmp = item.split(propertyDelimiterRE$1);
              tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
          }
      });
      return ret;
  }
  function normalizeClass$1(value) {
      let res = '';
      if (isString$1(value)) {
          res = value;
      }
      else if (isArray$1(value)) {
          for (let i = 0; i < value.length; i++) {
              res += normalizeClass$1(value[i]) + ' ';
          }
      }
      else if (isObject$1(value)) {
          for (const name in value) {
              if (value[name]) {
                  res += name + ' ';
              }
          }
      }
      return res.trim();
  }
  const EMPTY_OBJ$1 = (process.env.NODE_ENV !== 'production')
      ? Object.freeze({})
      : {};
  const EMPTY_ARR$1 = (process.env.NODE_ENV !== 'production') ? Object.freeze([]) : [];
  const NOOP$1 = () => { };
  const onRE$1 = /^on[^a-z]/;
  const isOn$1 = (key) => onRE$1.test(key);
  const isModelListener = (key) => key.startsWith('onUpdate:');
  const extend$1 = Object.assign;
  const remove$1 = (arr, el) => {
      const i = arr.indexOf(el);
      if (i > -1) {
          arr.splice(i, 1);
      }
  };
  const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  const hasOwn$1 = (val, key) => hasOwnProperty$1.call(val, key);
  const isArray$1 = Array.isArray;
  const isMap$1 = (val) => toTypeString$1(val) === '[object Map]';
  const isSet$1 = (val) => toTypeString$1(val) === '[object Set]';
  const isFunction$1 = (val) => typeof val === 'function';
  const isString$1 = (val) => typeof val === 'string';
  const isSymbol$1 = (val) => typeof val === 'symbol';
  const isObject$1 = (val) => val !== null && typeof val === 'object';
  const isPromise$1 = (val) => {
      return isObject$1(val) && isFunction$1(val.then) && isFunction$1(val.catch);
  };
  const objectToString$1 = Object.prototype.toString;
  const toTypeString$1 = (value) => objectToString$1.call(value);
  const toRawType$1 = (value) => {
      // extract "RawType" from strings like "[object RawType]"
      return toTypeString$1(value).slice(8, -1);
  };
  const isIntegerKey$1 = (key) => isString$1(key) &&
      key !== 'NaN' &&
      key[0] !== '-' &&
      '' + parseInt(key, 10) === key;
  const cacheStringFunction$1 = (fn) => {
      const cache = Object.create(null);
      return ((str) => {
          const hit = cache[str];
          return hit || (cache[str] = fn(str));
      });
  };
  const camelizeRE = /-(\w)/g;
  /**
   * @private
   */
  const camelize = cacheStringFunction$1((str) => {
      return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
  });
  const hyphenateRE = /\B([A-Z])/g;
  /**
   * @private
   */
  const hyphenate = cacheStringFunction$1((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
  /**
   * @private
   */
  const capitalize$1 = cacheStringFunction$1((str) => str.charAt(0).toUpperCase() + str.slice(1));
  // compare whether a value has changed, accounting for NaN.
  const hasChanged$1 = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
  let _globalThis$1;
  const getGlobalThis$1 = () => {
      return (_globalThis$1 ||
          (_globalThis$1 =
              typeof globalThis !== 'undefined'
                  ? globalThis
                  : typeof self !== 'undefined'
                      ? self
                      : typeof window !== 'undefined'
                          ? window
                          : typeof global !== 'undefined'
                              ? global
                              : {}));
  };

  const targetMap$1 = new WeakMap();
  const effectStack$1 = [];
  let activeEffect$1;
  const ITERATE_KEY$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'iterate' : '');
  const MAP_KEY_ITERATE_KEY$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'Map key iterate' : '');
  function isEffect$1(fn) {
      return fn && fn._isEffect === true;
  }
  function effect$1(fn, options = EMPTY_OBJ$1) {
      if (isEffect$1(fn)) {
          fn = fn.raw;
      }
      const effect = createReactiveEffect$1(fn, options);
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
  let uid$1 = 0;
  function createReactiveEffect$1(fn, options) {
      const effect = function reactiveEffect() {
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
              }
              finally {
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
      const { deps } = effect;
      if (deps.length) {
          for (let i = 0; i < deps.length; i++) {
              deps[i].delete(effect);
          }
          deps.length = 0;
      }
  }
  let shouldTrack$1 = true;
  const trackStack$1 = [];
  function pauseTracking$1() {
      trackStack$1.push(shouldTrack$1);
      shouldTrack$1 = false;
  }
  function enableTracking$1() {
      trackStack$1.push(shouldTrack$1);
      shouldTrack$1 = true;
  }
  function resetTracking$1() {
      const last = trackStack$1.pop();
      shouldTrack$1 = last === undefined ? true : last;
  }
  function track$1(target, type, key) {
      if (!shouldTrack$1 || activeEffect$1 === undefined) {
          return;
      }
      let depsMap = targetMap$1.get(target);
      if (!depsMap) {
          targetMap$1.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
          depsMap.set(key, (dep = new Set()));
      }
      if (!dep.has(activeEffect$1)) {
          dep.add(activeEffect$1);
          activeEffect$1.deps.push(dep);
          if ((process.env.NODE_ENV !== 'production') && activeEffect$1.options.onTrack) {
              activeEffect$1.options.onTrack({
                  effect: activeEffect$1,
                  target,
                  type,
                  key
              });
          }
      }
  }
  function trigger$1(target, type, key, newValue, oldValue, oldTarget) {
      const depsMap = targetMap$1.get(target);
      if (!depsMap) {
          // never been tracked
          return;
      }
      const effects = new Set();
      const add = (effectsToAdd) => {
          if (effectsToAdd) {
              effectsToAdd.forEach(effect => {
                  if (effect !== activeEffect$1 || effect.allowRecurse) {
                      effects.add(effect);
                  }
              });
          }
      };
      if (type === "clear" /* CLEAR */) {
          // collection being cleared
          // trigger all effects for target
          depsMap.forEach(add);
      }
      else if (key === 'length' && isArray$1(target)) {
          depsMap.forEach((dep, key) => {
              if (key === 'length' || key >= newValue) {
                  add(dep);
              }
          });
      }
      else {
          // schedule runs for SET | ADD | DELETE
          if (key !== void 0) {
              add(depsMap.get(key));
          }
          // also run for iteration key on ADD | DELETE | Map.SET
          switch (type) {
              case "add" /* ADD */:
                  if (!isArray$1(target)) {
                      add(depsMap.get(ITERATE_KEY$1));
                      if (isMap$1(target)) {
                          add(depsMap.get(MAP_KEY_ITERATE_KEY$1));
                      }
                  }
                  else if (isIntegerKey$1(key)) {
                      // new index added to array -> length changes
                      add(depsMap.get('length'));
                  }
                  break;
              case "delete" /* DELETE */:
                  if (!isArray$1(target)) {
                      add(depsMap.get(ITERATE_KEY$1));
                      if (isMap$1(target)) {
                          add(depsMap.get(MAP_KEY_ITERATE_KEY$1));
                      }
                  }
                  break;
              case "set" /* SET */:
                  if (isMap$1(target)) {
                      add(depsMap.get(ITERATE_KEY$1));
                  }
                  break;
          }
      }
      const run = (effect) => {
          if ((process.env.NODE_ENV !== 'production') && effect.options.onTrigger) {
              effect.options.onTrigger({
                  effect,
                  target,
                  key,
                  type,
                  newValue,
                  oldValue,
                  oldTarget
              });
          }
          if (effect.options.scheduler) {
              effect.options.scheduler(effect);
          }
          else {
              effect();
          }
      };
      effects.forEach(run);
  }

  const builtInSymbols$1 = new Set(Object.getOwnPropertyNames(Symbol)
      .map(key => Symbol[key])
      .filter(isSymbol$1));
  const get$2 = /*#__PURE__*/ createGetter$1();
  const shallowGet$1 = /*#__PURE__*/ createGetter$1(false, true);
  const readonlyGet$1 = /*#__PURE__*/ createGetter$1(true);
  const shallowReadonlyGet$1 = /*#__PURE__*/ createGetter$1(true, true);
  const arrayInstrumentations$1 = {};
  ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
      const method = Array.prototype[key];
      arrayInstrumentations$1[key] = function (...args) {
          const arr = toRaw$1(this);
          for (let i = 0, l = this.length; i < l; i++) {
              track$1(arr, "get" /* GET */, i + '');
          }
          // we run the method using the original args first (which may be reactive)
          const res = method.apply(arr, args);
          if (res === -1 || res === false) {
              // if that didn't work, run it again using raw values.
              return method.apply(arr, args.map(toRaw$1));
          }
          else {
              return res;
          }
      };
  });
  ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
      const method = Array.prototype[key];
      arrayInstrumentations$1[key] = function (...args) {
          pauseTracking$1();
          const res = method.apply(this, args);
          resetTracking$1();
          return res;
      };
  });
  function createGetter$1(isReadonly = false, shallow = false) {
      return function get(target, key, receiver) {
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return !isReadonly;
          }
          else if (key === "__v_isReadonly" /* IS_READONLY */) {
              return isReadonly;
          }
          else if (key === "__v_raw" /* RAW */ &&
              receiver === (isReadonly ? readonlyMap$1 : reactiveMap$1).get(target)) {
              return target;
          }
          const targetIsArray = isArray$1(target);
          if (!isReadonly && targetIsArray && hasOwn$1(arrayInstrumentations$1, key)) {
              return Reflect.get(arrayInstrumentations$1, key, receiver);
          }
          const res = Reflect.get(target, key, receiver);
          if (isSymbol$1(key)
              ? builtInSymbols$1.has(key)
              : key === `__proto__` || key === `__v_isRef`) {
              return res;
          }
          if (!isReadonly) {
              track$1(target, "get" /* GET */, key);
          }
          if (shallow) {
              return res;
          }
          if (isRef$1(res)) {
              // ref unwrapping - does not apply for Array + integer key.
              const shouldUnwrap = !targetIsArray || !isIntegerKey$1(key);
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
  const set$2 = /*#__PURE__*/ createSetter$1();
  const shallowSet$1 = /*#__PURE__*/ createSetter$1(true);
  function createSetter$1(shallow = false) {
      return function set(target, key, value, receiver) {
          const oldValue = target[key];
          if (!shallow) {
              value = toRaw$1(value);
              if (!isArray$1(target) && isRef$1(oldValue) && !isRef$1(value)) {
                  oldValue.value = value;
                  return true;
              }
          }
          const hadKey = isArray$1(target) && isIntegerKey$1(key)
              ? Number(key) < target.length
              : hasOwn$1(target, key);
          const result = Reflect.set(target, key, value, receiver);
          // don't trigger if target is something up in the prototype chain of original
          if (target === toRaw$1(receiver)) {
              if (!hadKey) {
                  trigger$1(target, "add" /* ADD */, key, value);
              }
              else if (hasChanged$1(value, oldValue)) {
                  trigger$1(target, "set" /* SET */, key, value, oldValue);
              }
          }
          return result;
      };
  }
  function deleteProperty$1(target, key) {
      const hadKey = hasOwn$1(target, key);
      const oldValue = target[key];
      const result = Reflect.deleteProperty(target, key);
      if (result && hadKey) {
          trigger$1(target, "delete" /* DELETE */, key, undefined, oldValue);
      }
      return result;
  }
  function has$2(target, key) {
      const result = Reflect.has(target, key);
      if (!isSymbol$1(key) || !builtInSymbols$1.has(key)) {
          track$1(target, "has" /* HAS */, key);
      }
      return result;
  }
  function ownKeys$2(target) {
      track$1(target, "iterate" /* ITERATE */, isArray$1(target) ? 'length' : ITERATE_KEY$1);
      return Reflect.ownKeys(target);
  }
  const mutableHandlers$1 = {
      get: get$2,
      set: set$2,
      deleteProperty: deleteProperty$1,
      has: has$2,
      ownKeys: ownKeys$2
  };
  const readonlyHandlers$1 = {
      get: readonlyGet$1,
      set(target, key) {
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
      },
      deleteProperty(target, key) {
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
          }
          return true;
      }
  };
  const shallowReactiveHandlers$1 = extend$1({}, mutableHandlers$1, {
      get: shallowGet$1,
      set: shallowSet$1
  });
  // Props handlers are special in the sense that it should not unwrap top-level
  // refs (in order to allow refs to be explicitly passed down), but should
  // retain the reactivity of the normal readonly object.
  const shallowReadonlyHandlers$1 = extend$1({}, readonlyHandlers$1, {
      get: shallowReadonlyGet$1
  });

  const toReactive$1 = (value) => isObject$1(value) ? reactive$1(value) : value;
  const toReadonly$1 = (value) => isObject$1(value) ? readonly$1(value) : value;
  const toShallow$1 = (value) => value;
  const getProto$1 = (v) => Reflect.getPrototypeOf(v);
  function get$1$1(target, key, isReadonly = false, isShallow = false) {
      // #1772: readonly(reactive(Map)) should return readonly + reactive version
      // of the value
      target = target["__v_raw" /* RAW */];
      const rawTarget = toRaw$1(target);
      const rawKey = toRaw$1(key);
      if (key !== rawKey) {
          !isReadonly && track$1(rawTarget, "get" /* GET */, key);
      }
      !isReadonly && track$1(rawTarget, "get" /* GET */, rawKey);
      const { has } = getProto$1(rawTarget);
      const wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;
      if (has.call(rawTarget, key)) {
          return wrap(target.get(key));
      }
      else if (has.call(rawTarget, rawKey)) {
          return wrap(target.get(rawKey));
      }
  }
  function has$1$1(key, isReadonly = false) {
      const target = this["__v_raw" /* RAW */];
      const rawTarget = toRaw$1(target);
      const rawKey = toRaw$1(key);
      if (key !== rawKey) {
          !isReadonly && track$1(rawTarget, "has" /* HAS */, key);
      }
      !isReadonly && track$1(rawTarget, "has" /* HAS */, rawKey);
      return key === rawKey
          ? target.has(key)
          : target.has(key) || target.has(rawKey);
  }
  function size$1(target, isReadonly = false) {
      target = target["__v_raw" /* RAW */];
      !isReadonly && track$1(toRaw$1(target), "iterate" /* ITERATE */, ITERATE_KEY$1);
      return Reflect.get(target, 'size', target);
  }
  function add$1(value) {
      value = toRaw$1(value);
      const target = toRaw$1(this);
      const proto = getProto$1(target);
      const hadKey = proto.has.call(target, value);
      target.add(value);
      if (!hadKey) {
          trigger$1(target, "add" /* ADD */, value, value);
      }
      return this;
  }
  function set$1$1(key, value) {
      value = toRaw$1(value);
      const target = toRaw$1(this);
      const { has, get } = getProto$1(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
          key = toRaw$1(key);
          hadKey = has.call(target, key);
      }
      else if ((process.env.NODE_ENV !== 'production')) {
          checkIdentityKeys$1(target, has, key);
      }
      const oldValue = get.call(target, key);
      target.set(key, value);
      if (!hadKey) {
          trigger$1(target, "add" /* ADD */, key, value);
      }
      else if (hasChanged$1(value, oldValue)) {
          trigger$1(target, "set" /* SET */, key, value, oldValue);
      }
      return this;
  }
  function deleteEntry$1(key) {
      const target = toRaw$1(this);
      const { has, get } = getProto$1(target);
      let hadKey = has.call(target, key);
      if (!hadKey) {
          key = toRaw$1(key);
          hadKey = has.call(target, key);
      }
      else if ((process.env.NODE_ENV !== 'production')) {
          checkIdentityKeys$1(target, has, key);
      }
      const oldValue = get ? get.call(target, key) : undefined;
      // forward the operation before queueing reactions
      const result = target.delete(key);
      if (hadKey) {
          trigger$1(target, "delete" /* DELETE */, key, undefined, oldValue);
      }
      return result;
  }
  function clear$1() {
      const target = toRaw$1(this);
      const hadItems = target.size !== 0;
      const oldTarget = (process.env.NODE_ENV !== 'production')
          ? isMap$1(target)
              ? new Map(target)
              : new Set(target)
          : undefined;
      // forward the operation before queueing reactions
      const result = target.clear();
      if (hadItems) {
          trigger$1(target, "clear" /* CLEAR */, undefined, undefined, oldTarget);
      }
      return result;
  }
  function createForEach$1(isReadonly, isShallow) {
      return function forEach(callback, thisArg) {
          const observed = this;
          const target = observed["__v_raw" /* RAW */];
          const rawTarget = toRaw$1(target);
          const wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;
          !isReadonly && track$1(rawTarget, "iterate" /* ITERATE */, ITERATE_KEY$1);
          return target.forEach((value, key) => {
              // important: make sure the callback is
              // 1. invoked with the reactive map as `this` and 3rd arg
              // 2. the value received should be a corresponding reactive/readonly.
              return callback.call(thisArg, wrap(value), wrap(key), observed);
          });
      };
  }
  function createIterableMethod$1(method, isReadonly, isShallow) {
      return function (...args) {
          const target = this["__v_raw" /* RAW */];
          const rawTarget = toRaw$1(target);
          const targetIsMap = isMap$1(rawTarget);
          const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
          const isKeyOnly = method === 'keys' && targetIsMap;
          const innerIterator = target[method](...args);
          const wrap = isReadonly ? toReadonly$1 : isShallow ? toShallow$1 : toReactive$1;
          !isReadonly &&
              track$1(rawTarget, "iterate" /* ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY$1 : ITERATE_KEY$1);
          // return a wrapped iterator which returns observed versions of the
          // values emitted from the real iterator
          return {
              // iterator protocol
              next() {
                  const { value, done } = innerIterator.next();
                  return done
                      ? { value, done }
                      : {
                          value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                          done
                      };
              },
              // iterable protocol
              [Symbol.iterator]() {
                  return this;
              }
          };
      };
  }
  function createReadonlyMethod$1(type) {
      return function (...args) {
          if ((process.env.NODE_ENV !== 'production')) {
              const key = args[0] ? `on key "${args[0]}" ` : ``;
              console.warn(`${capitalize$1(type)} operation ${key}failed: target is readonly.`, toRaw$1(this));
          }
          return type === "delete" /* DELETE */ ? false : this;
      };
  }
  const mutableInstrumentations$1 = {
      get(key) {
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
  const shallowInstrumentations$1 = {
      get(key) {
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
  const readonlyInstrumentations$1 = {
      get(key) {
          return get$1$1(this, key, true);
      },
      get size() {
          return size$1(this, true);
      },
      has(key) {
          return has$1$1.call(this, key, true);
      },
      add: createReadonlyMethod$1("add" /* ADD */),
      set: createReadonlyMethod$1("set" /* SET */),
      delete: createReadonlyMethod$1("delete" /* DELETE */),
      clear: createReadonlyMethod$1("clear" /* CLEAR */),
      forEach: createForEach$1(true, false)
  };
  const iteratorMethods$1 = ['keys', 'values', 'entries', Symbol.iterator];
  iteratorMethods$1.forEach(method => {
      mutableInstrumentations$1[method] = createIterableMethod$1(method, false, false);
      readonlyInstrumentations$1[method] = createIterableMethod$1(method, true, false);
      shallowInstrumentations$1[method] = createIterableMethod$1(method, false, true);
  });
  function createInstrumentationGetter$1(isReadonly, shallow) {
      const instrumentations = shallow
          ? shallowInstrumentations$1
          : isReadonly
              ? readonlyInstrumentations$1
              : mutableInstrumentations$1;
      return (target, key, receiver) => {
          if (key === "__v_isReactive" /* IS_REACTIVE */) {
              return !isReadonly;
          }
          else if (key === "__v_isReadonly" /* IS_READONLY */) {
              return isReadonly;
          }
          else if (key === "__v_raw" /* RAW */) {
              return target;
          }
          return Reflect.get(hasOwn$1(instrumentations, key) && key in target
              ? instrumentations
              : target, key, receiver);
      };
  }
  const mutableCollectionHandlers$1 = {
      get: createInstrumentationGetter$1(false, false)
  };
  const readonlyCollectionHandlers$1 = {
      get: createInstrumentationGetter$1(true, false)
  };
  function checkIdentityKeys$1(target, has, key) {
      const rawKey = toRaw$1(key);
      if (rawKey !== key && has.call(target, rawKey)) {
          const type = toRawType$1(target);
          console.warn(`Reactive ${type} contains both the raw and reactive ` +
              `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
              `which can lead to inconsistencies. ` +
              `Avoid differentiating between the raw and reactive versions ` +
              `of an object and only use the reactive version if possible.`);
      }
  }

  const reactiveMap$1 = new WeakMap();
  const readonlyMap$1 = new WeakMap();
  function targetTypeMap$1(rawType) {
      switch (rawType) {
          case 'Object':
          case 'Array':
              return 1 /* COMMON */;
          case 'Map':
          case 'Set':
          case 'WeakMap':
          case 'WeakSet':
              return 2 /* COLLECTION */;
          default:
              return 0 /* INVALID */;
      }
  }
  function getTargetType$1(value) {
      return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
          ? 0 /* INVALID */
          : targetTypeMap$1(toRawType$1(value));
  }
  function reactive$1(target) {
      // if trying to observe a readonly proxy, return the readonly version.
      if (target && target["__v_isReadonly" /* IS_READONLY */]) {
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
          if ((process.env.NODE_ENV !== 'production')) {
              console.warn(`value cannot be made reactive: ${String(target)}`);
          }
          return target;
      }
      // target is already a Proxy, return it.
      // exception: calling readonly() on a reactive object
      if (target["__v_raw" /* RAW */] &&
          !(isReadonly && target["__v_isReactive" /* IS_REACTIVE */])) {
          return target;
      }
      // target already has corresponding Proxy
      const proxyMap = isReadonly ? readonlyMap$1 : reactiveMap$1;
      const existingProxy = proxyMap.get(target);
      if (existingProxy) {
          return existingProxy;
      }
      // only a whitelist of value types can be observed.
      const targetType = getTargetType$1(target);
      if (targetType === 0 /* INVALID */) {
          return target;
      }
      const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
      proxyMap.set(target, proxy);
      return proxy;
  }
  function isReactive$1(value) {
      if (isReadonly$1(value)) {
          return isReactive$1(value["__v_raw" /* RAW */]);
      }
      return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
  }
  function isReadonly$1(value) {
      return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
  }
  function isProxy$1(value) {
      return isReactive$1(value) || isReadonly$1(value);
  }
  function toRaw$1(observed) {
      return ((observed && toRaw$1(observed["__v_raw" /* RAW */])) || observed);
  }
  function isRef$1(r) {
      return Boolean(r && r.__v_isRef === true);
  }

  const stack$1 = [];
  function pushWarningContext$1(vnode) {
      stack$1.push(vnode);
  }
  function popWarningContext$1() {
      stack$1.pop();
  }
  function warn$1(msg, ...args) {
      // avoid props formatting or warn handler tracking deps that might be mutated
      // during patch, leading to infinite recursion.
      pauseTracking$1();
      const instance = stack$1.length ? stack$1[stack$1.length - 1].component : null;
      const appWarnHandler = instance && instance.appContext.config.warnHandler;
      const trace = getComponentTrace$1();
      if (appWarnHandler) {
          callWithErrorHandling$1(appWarnHandler, instance, 11 /* APP_WARN_HANDLER */, [
              msg + args.join(''),
              instance && instance.proxy,
              trace
                  .map(({ vnode }) => `at <${formatComponentName$1(instance, vnode.type)}>`)
                  .join('\n'),
              trace
          ]);
      }
      else {
          const warnArgs = [`[Vue warn]: ${msg}`, ...args];
          /* istanbul ignore if */
          if (trace.length &&
              // avoid spamming console during tests
              !false) {
              warnArgs.push(`\n`, ...formatTrace$1(trace));
          }
          console.warn(...warnArgs);
      }
      resetTracking$1();
  }
  function getComponentTrace$1() {
      let currentVNode = stack$1[stack$1.length - 1];
      if (!currentVNode) {
          return [];
      }
      // we can't just use the stack because it will be incomplete during updates
      // that did not start from the root. Re-construct the parent chain using
      // instance parent pointers.
      const normalizedStack = [];
      while (currentVNode) {
          const last = normalizedStack[0];
          if (last && last.vnode === currentVNode) {
              last.recurseCount++;
          }
          else {
              normalizedStack.push({
                  vnode: currentVNode,
                  recurseCount: 0
              });
          }
          const parentInstance = currentVNode.component && currentVNode.component.parent;
          currentVNode = parentInstance && parentInstance.vnode;
      }
      return normalizedStack;
  }
  /* istanbul ignore next */
  function formatTrace$1(trace) {
      const logs = [];
      trace.forEach((entry, i) => {
          logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry$1(entry));
      });
      return logs;
  }
  function formatTraceEntry$1({ vnode, recurseCount }) {
      const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
      const isRoot = vnode.component ? vnode.component.parent == null : false;
      const open = ` at <${formatComponentName$1(vnode.component, vnode.type, isRoot)}`;
      const close = `>` + postfix;
      return vnode.props
          ? [open, ...formatProps$1(vnode.props), close]
          : [open + close];
  }
  /* istanbul ignore next */
  function formatProps$1(props) {
      const res = [];
      const keys = Object.keys(props);
      keys.slice(0, 3).forEach(key => {
          res.push(...formatProp$1(key, props[key]));
      });
      if (keys.length > 3) {
          res.push(` ...`);
      }
      return res;
  }
  /* istanbul ignore next */
  function formatProp$1(key, value, raw) {
      if (isString$1(value)) {
          value = JSON.stringify(value);
          return raw ? value : [`${key}=${value}`];
      }
      else if (typeof value === 'number' ||
          typeof value === 'boolean' ||
          value == null) {
          return raw ? value : [`${key}=${value}`];
      }
      else if (isRef$1(value)) {
          value = formatProp$1(key, toRaw$1(value.value), true);
          return raw ? value : [`${key}=Ref<`, value, `>`];
      }
      else if (isFunction$1(value)) {
          return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
      }
      else {
          value = toRaw$1(value);
          return raw ? value : [`${key}=`, value];
      }
  }

  const ErrorTypeStrings$1 = {
      ["bc" /* BEFORE_CREATE */]: 'beforeCreate hook',
      ["c" /* CREATED */]: 'created hook',
      ["bm" /* BEFORE_MOUNT */]: 'beforeMount hook',
      ["m" /* MOUNTED */]: 'mounted hook',
      ["bu" /* BEFORE_UPDATE */]: 'beforeUpdate hook',
      ["u" /* UPDATED */]: 'updated',
      ["bum" /* BEFORE_UNMOUNT */]: 'beforeUnmount hook',
      ["um" /* UNMOUNTED */]: 'unmounted hook',
      ["a" /* ACTIVATED */]: 'activated hook',
      ["da" /* DEACTIVATED */]: 'deactivated hook',
      ["ec" /* ERROR_CAPTURED */]: 'errorCaptured hook',
      ["rtc" /* RENDER_TRACKED */]: 'renderTracked hook',
      ["rtg" /* RENDER_TRIGGERED */]: 'renderTriggered hook',
      [0 /* SETUP_FUNCTION */]: 'setup function',
      [1 /* RENDER_FUNCTION */]: 'render function',
      [2 /* WATCH_GETTER */]: 'watcher getter',
      [3 /* WATCH_CALLBACK */]: 'watcher callback',
      [4 /* WATCH_CLEANUP */]: 'watcher cleanup function',
      [5 /* NATIVE_EVENT_HANDLER */]: 'native event handler',
      [6 /* COMPONENT_EVENT_HANDLER */]: 'component event handler',
      [7 /* VNODE_HOOK */]: 'vnode hook',
      [8 /* DIRECTIVE_HOOK */]: 'directive hook',
      [9 /* TRANSITION_HOOK */]: 'transition hook',
      [10 /* APP_ERROR_HANDLER */]: 'app errorHandler',
      [11 /* APP_WARN_HANDLER */]: 'app warnHandler',
      [12 /* FUNCTION_REF */]: 'ref function',
      [13 /* ASYNC_COMPONENT_LOADER */]: 'async component loader',
      [14 /* SCHEDULER */]: 'scheduler flush. This is likely a Vue internals bug. ' +
          'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/vue-next'
  };
  function callWithErrorHandling$1(fn, instance, type, args) {
      let res;
      try {
          res = args ? fn(...args) : fn();
      }
      catch (err) {
          handleError$1(err, instance, type);
      }
      return res;
  }
  function callWithAsyncErrorHandling$1(fn, instance, type, args) {
      if (isFunction$1(fn)) {
          const res = callWithErrorHandling$1(fn, instance, type, args);
          if (res && isPromise$1(res)) {
              res.catch(err => {
                  handleError$1(err, instance, type);
              });
          }
          return res;
      }
      const values = [];
      for (let i = 0; i < fn.length; i++) {
          values.push(callWithAsyncErrorHandling$1(fn[i], instance, type, args));
      }
      return values;
  }
  function handleError$1(err, instance, type, throwInDev = true) {
      const contextVNode = instance ? instance.vnode : null;
      if (instance) {
          let cur = instance.parent;
          // the exposed instance is the render proxy to keep it consistent with 2.x
          const exposedInstance = instance.proxy;
          // in production the hook receives only the error code
          const errorInfo = (process.env.NODE_ENV !== 'production') ? ErrorTypeStrings$1[type] : type;
          while (cur) {
              const errorCapturedHooks = cur.ec;
              if (errorCapturedHooks) {
                  for (let i = 0; i < errorCapturedHooks.length; i++) {
                      if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                          return;
                      }
                  }
              }
              cur = cur.parent;
          }
          // app-level handling
          const appErrorHandler = instance.appContext.config.errorHandler;
          if (appErrorHandler) {
              callWithErrorHandling$1(appErrorHandler, null, 10 /* APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
              return;
          }
      }
      logError$1(err, type, contextVNode, throwInDev);
  }
  function logError$1(err, type, contextVNode, throwInDev = true) {
      if ((process.env.NODE_ENV !== 'production')) {
          const info = ErrorTypeStrings$1[type];
          if (contextVNode) {
              pushWarningContext$1(contextVNode);
          }
          warn$1(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
          if (contextVNode) {
              popWarningContext$1();
          }
          // crash in dev by default so it's more noticeable
          if (throwInDev) {
              throw err;
          }
          else {
              console.error(err);
          }
      }
      else {
          // recover in prod to reduce the impact on end-user
          console.error(err);
      }
  }

  let isFlushing$1 = false;
  let isFlushPending$1 = false;
  const queue$1 = [];
  let flushIndex$1 = 0;
  const pendingPreFlushCbs$1 = [];
  let activePreFlushCbs$1 = null;
  let preFlushIndex$1 = 0;
  const pendingPostFlushCbs$1 = [];
  let activePostFlushCbs$1 = null;
  let postFlushIndex$1 = 0;
  const resolvedPromise$1 = Promise.resolve();
  let currentFlushPromise$1 = null;
  let currentPreFlushParentJob$1 = null;
  const RECURSION_LIMIT$1 = 100;
  function nextTick$1(fn) {
      const p = currentFlushPromise$1 || resolvedPromise$1;
      return fn ? p.then(this ? fn.bind(this) : fn) : p;
  }
  function queueJob$1(job) {
      // the dedupe search uses the startIndex argument of Array.includes()
      // by default the search index includes the current job that is being run
      // so it cannot recursively trigger itself again.
      // if the job is a watch() callback, the search will start with a +1 index to
      // allow it recursively trigger itself - it is the user's responsibility to
      // ensure it doesn't end up in an infinite loop.
      if ((!queue$1.length ||
          !queue$1.includes(job, isFlushing$1 && job.allowRecurse ? flushIndex$1 + 1 : flushIndex$1)) &&
          job !== currentPreFlushParentJob$1) {
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
          if (!activeQueue ||
              !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
              pendingQueue.push(cb);
          }
      }
      else {
          // if cb is an array, it is a component lifecycle hook which can only be
          // triggered by a job, which is already deduped in the main queue, so
          // we can skip duplicate check here to improve perf
          pendingQueue.push(...cb);
      }
      queueFlush$1();
  }
  function queuePreFlushCb$1(cb) {
      queueCb$1(cb, activePreFlushCbs$1, pendingPreFlushCbs$1, preFlushIndex$1);
  }
  function queuePostFlushCb$1(cb) {
      queueCb$1(cb, activePostFlushCbs$1, pendingPostFlushCbs$1, postFlushIndex$1);
  }
  function flushPreFlushCbs$1(seen, parentJob = null) {
      if (pendingPreFlushCbs$1.length) {
          currentPreFlushParentJob$1 = parentJob;
          activePreFlushCbs$1 = [...new Set(pendingPreFlushCbs$1)];
          pendingPreFlushCbs$1.length = 0;
          if ((process.env.NODE_ENV !== 'production')) {
              seen = seen || new Map();
          }
          for (preFlushIndex$1 = 0; preFlushIndex$1 < activePreFlushCbs$1.length; preFlushIndex$1++) {
              if ((process.env.NODE_ENV !== 'production')) {
                  checkRecursiveUpdates$1(seen, activePreFlushCbs$1[preFlushIndex$1]);
              }
              activePreFlushCbs$1[preFlushIndex$1]();
          }
          activePreFlushCbs$1 = null;
          preFlushIndex$1 = 0;
          currentPreFlushParentJob$1 = null;
          // recursively flush until it drains
          flushPreFlushCbs$1(seen, parentJob);
      }
  }
  function flushPostFlushCbs$1(seen) {
      if (pendingPostFlushCbs$1.length) {
          const deduped = [...new Set(pendingPostFlushCbs$1)];
          pendingPostFlushCbs$1.length = 0;
          // #1947 already has active queue, nested flushPostFlushCbs call
          if (activePostFlushCbs$1) {
              activePostFlushCbs$1.push(...deduped);
              return;
          }
          activePostFlushCbs$1 = deduped;
          if ((process.env.NODE_ENV !== 'production')) {
              seen = seen || new Map();
          }
          activePostFlushCbs$1.sort((a, b) => getId$1(a) - getId$1(b));
          for (postFlushIndex$1 = 0; postFlushIndex$1 < activePostFlushCbs$1.length; postFlushIndex$1++) {
              if ((process.env.NODE_ENV !== 'production')) {
                  checkRecursiveUpdates$1(seen, activePostFlushCbs$1[postFlushIndex$1]);
              }
              activePostFlushCbs$1[postFlushIndex$1]();
          }
          activePostFlushCbs$1 = null;
          postFlushIndex$1 = 0;
      }
  }
  const getId$1 = (job) => job.id == null ? Infinity : job.id;
  function flushJobs$1(seen) {
      isFlushPending$1 = false;
      isFlushing$1 = true;
      if ((process.env.NODE_ENV !== 'production')) {
          seen = seen || new Map();
      }
      flushPreFlushCbs$1(seen);
      // Sort queue before flush.
      // This ensures that:
      // 1. Components are updated from parent to child. (because parent is always
      //    created before the child so its render effect will have smaller
      //    priority number)
      // 2. If a component is unmounted during a parent component's update,
      //    its update can be skipped.
      queue$1.sort((a, b) => getId$1(a) - getId$1(b));
      try {
          for (flushIndex$1 = 0; flushIndex$1 < queue$1.length; flushIndex$1++) {
              const job = queue$1[flushIndex$1];
              if (job) {
                  if ((process.env.NODE_ENV !== 'production')) {
                      checkRecursiveUpdates$1(seen, job);
                  }
                  callWithErrorHandling$1(job, null, 14 /* SCHEDULER */);
              }
          }
      }
      finally {
          flushIndex$1 = 0;
          queue$1.length = 0;
          flushPostFlushCbs$1(seen);
          isFlushing$1 = false;
          currentFlushPromise$1 = null;
          // some postFlushCb queued jobs!
          // keep flushing until it drains.
          if (queue$1.length || pendingPostFlushCbs$1.length) {
              flushJobs$1(seen);
          }
      }
  }
  function checkRecursiveUpdates$1(seen, fn) {
      if (!seen.has(fn)) {
          seen.set(fn, 1);
      }
      else {
          const count = seen.get(fn);
          if (count > RECURSION_LIMIT$1) {
              throw new Error(`Maximum recursive updates exceeded. ` +
                  `This means you have a reactive effect that is mutating its own ` +
                  `dependencies and thus recursively triggering itself. Possible sources ` +
                  `include component template, render function, updated hook or ` +
                  `watcher source function.`);
          }
          else {
              seen.set(fn, count + 1);
          }
      }
  }
  const hmrDirtyComponents$1 = new Set();
  // Expose the HMR runtime on the global object
  // This makes it entirely tree-shakable without polluting the exports and makes
  // it easier to be used in toolings like vue-loader
  // Note: for a component to be eligible for HMR it also needs the __hmrId option
  // to be set so that its instances can be registered / removed.
  if ((process.env.NODE_ENV !== 'production')) {
      const globalObject = typeof global !== 'undefined'
          ? global
          : typeof self !== 'undefined'
              ? self
              : typeof window !== 'undefined'
                  ? window
                  : {};
      globalObject.__VUE_HMR_RUNTIME__ = {
          createRecord: tryWrap$1(createRecord$1),
          rerender: tryWrap$1(rerender$1),
          reload: tryWrap$1(reload$1)
      };
  }
  const map$1 = new Map();
  function createRecord$1(id, component) {
      if (!component) {
          warn$1(`HMR API usage is out of date.\n` +
              `Please upgrade vue-loader/vite/rollup-plugin-vue or other relevant ` +
              `depdendency that handles Vue SFC compilation.`);
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
      const record = map$1.get(id);
      if (!record)
          return;
      if (newRender)
          record.component.render = newRender;
      // Array.from creates a snapshot which avoids the set being mutated during
      // updates
      Array.from(record.instances).forEach(instance => {
          if (newRender) {
              instance.render = newRender;
          }
          instance.renderCache = [];
          instance.update();
      });
  }
  function reload$1(id, newComp) {
      const record = map$1.get(id);
      if (!record)
          return;
      // Array.from creates a snapshot which avoids the set being mutated during
      // updates
      const { component, instances } = record;
      if (!hmrDirtyComponents$1.has(component)) {
          // 1. Update existing comp definition to match new one
          newComp = isClassComponent$1(newComp) ? newComp.__vccOpts : newComp;
          extend$1(component, newComp);
          for (const key in component) {
              if (!(key in newComp)) {
                  delete component[key];
              }
          }
          // 2. Mark component dirty. This forces the renderer to replace the component
          // on patch.
          hmrDirtyComponents$1.add(component);
          // 3. Make sure to unmark the component after the reload.
          queuePostFlushCb$1(() => {
              hmrDirtyComponents$1.delete(component);
          });
      }
      Array.from(instances).forEach(instance => {
          if (instance.parent) {
              // 4. Force the parent instance to re-render. This will cause all updated
              // components to be unmounted and re-mounted. Queue the update so that we
              // don't end up forcing the same parent to re-render multiple times.
              queueJob$1(instance.parent.update);
          }
          else if (instance.appContext.reload) {
              // root instance mounted via createApp() has a reload method
              instance.appContext.reload();
          }
          else if (typeof window !== 'undefined') {
              // root instance inside tree created via raw render(). Force reload.
              window.location.reload();
          }
          else {
              console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
          }
      });
  }
  function tryWrap$1(fn) {
      return (id, arg) => {
          try {
              return fn(id, arg);
          }
          catch (e) {
              console.error(e);
              console.warn(`[HMR] Something went wrong during Vue component hot-reload. ` +
                  `Full reload required.`);
          }
      };
  }
  function setDevtoolsHook$1(hook) {
  }

  /**
   * mark the current rendering instance for asset resolution (e.g.
   * resolveComponent, resolveDirective) during render
   */
  let currentRenderingInstance$1 = null;
  function markAttrsAccessed$1() {
  }
  function filterSingleRoot$1(children) {
      let singleRoot;
      for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (isVNode$1(child)) {
              // ignore user comment
              if (child.type !== Comment$1 || child.children === 'v-if') {
                  if (singleRoot) {
                      // has more than 1 non-comment child, return now
                      return;
                  }
                  else {
                      singleRoot = child;
                  }
              }
          }
          else {
              return;
          }
      }
      return singleRoot;
  }

  const isSuspense$1 = (type) => type.__isSuspense;
  function normalizeSuspenseChildren$1(vnode) {
      const { shapeFlag, children } = vnode;
      let content;
      let fallback;
      if (shapeFlag & 32 /* SLOTS_CHILDREN */) {
          content = normalizeSuspenseSlot$1(children.default);
          fallback = normalizeSuspenseSlot$1(children.fallback);
      }
      else {
          content = normalizeSuspenseSlot$1(children);
          fallback = normalizeVNode$1(null);
      }
      return {
          content,
          fallback
      };
  }
  function normalizeSuspenseSlot$1(s) {
      if (isFunction$1(s)) {
          s = s();
      }
      if (isArray$1(s)) {
          const singleChild = filterSingleRoot$1(s);
          if ((process.env.NODE_ENV !== 'production') && !singleChild) {
              warn$1(`<Suspense> slots expect a single root node.`);
          }
          s = singleChild;
      }
      return normalizeVNode$1(s);
  }
  function queueEffectWithSuspense$1(fn, suspense) {
      if (suspense && suspense.pendingBranch) {
          if (isArray$1(fn)) {
              suspense.effects.push(...fn);
          }
          else {
              suspense.effects.push(fn);
          }
      }
      else {
          queuePostFlushCb$1(fn);
      }
  }

  let isRenderingCompiledSlot$1 = 0;
  const setCompiledSlotRendering$1 = (n) => (isRenderingCompiledSlot$1 += n);

  // SFC scoped style ID management.
  let currentScopeId$1 = null;
  // initial value for watchers to trigger on undefined initial values
  const INITIAL_WATCHER_VALUE$1 = {};
  function doWatch$1(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ$1, instance = currentInstance$1) {
      if ((process.env.NODE_ENV !== 'production') && !cb) {
          if (immediate !== undefined) {
              warn$1(`watch() "immediate" option is only respected when using the ` +
                  `watch(source, callback, options?) signature.`);
          }
          if (deep !== undefined) {
              warn$1(`watch() "deep" option is only respected when using the ` +
                  `watch(source, callback, options?) signature.`);
          }
      }
      const warnInvalidSource = (s) => {
          warn$1(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, ` +
              `a reactive object, or an array of these types.`);
      };
      let getter;
      let forceTrigger = false;
      if (isRef$1(source)) {
          getter = () => source.value;
          forceTrigger = !!source._shallow;
      }
      else if (isReactive$1(source)) {
          getter = () => source;
          deep = true;
      }
      else if (isArray$1(source)) {
          getter = () => source.map(s => {
              if (isRef$1(s)) {
                  return s.value;
              }
              else if (isReactive$1(s)) {
                  return traverse$1(s);
              }
              else if (isFunction$1(s)) {
                  return callWithErrorHandling$1(s, instance, 2 /* WATCH_GETTER */);
              }
              else {
                  (process.env.NODE_ENV !== 'production') && warnInvalidSource(s);
              }
          });
      }
      else if (isFunction$1(source)) {
          if (cb) {
              // getter with cb
              getter = () => callWithErrorHandling$1(source, instance, 2 /* WATCH_GETTER */);
          }
          else {
              // no cb -> simple effect
              getter = () => {
                  if (instance && instance.isUnmounted) {
                      return;
                  }
                  if (cleanup) {
                      cleanup();
                  }
                  return callWithErrorHandling$1(source, instance, 3 /* WATCH_CALLBACK */, [onInvalidate]);
              };
          }
      }
      else {
          getter = NOOP$1;
          (process.env.NODE_ENV !== 'production') && warnInvalidSource(source);
      }
      if (cb && deep) {
          const baseGetter = getter;
          getter = () => traverse$1(baseGetter());
      }
      let cleanup;
      const onInvalidate = (fn) => {
          cleanup = runner.options.onStop = () => {
              callWithErrorHandling$1(fn, instance, 4 /* WATCH_CLEANUP */);
          };
      };
      let oldValue = isArray$1(source) ? [] : INITIAL_WATCHER_VALUE$1;
      const job = () => {
          if (!runner.active) {
              return;
          }
          if (cb) {
              // watch(source, cb)
              const newValue = runner();
              if (deep || forceTrigger || hasChanged$1(newValue, oldValue)) {
                  // cleanup before running cb again
                  if (cleanup) {
                      cleanup();
                  }
                  callWithAsyncErrorHandling$1(cb, instance, 3 /* WATCH_CALLBACK */, [
                      newValue,
                      // pass undefined as the old value when it's changed for the first time
                      oldValue === INITIAL_WATCHER_VALUE$1 ? undefined : oldValue,
                      onInvalidate
                  ]);
                  oldValue = newValue;
              }
          }
          else {
              // watchEffect
              runner();
          }
      };
      // important: mark the job as a watcher callback so that scheduler knows
      // it is allowed to self-trigger (#1727)
      job.allowRecurse = !!cb;
      let scheduler;
      if (flush === 'sync') {
          scheduler = job;
      }
      else if (flush === 'post') {
          scheduler = () => queuePostRenderEffect$1(job, instance && instance.suspense);
      }
      else {
          // default: 'pre'
          scheduler = () => {
              if (!instance || instance.isMounted) {
                  queuePreFlushCb$1(job);
              }
              else {
                  // with 'pre' option, the first call must happen before
                  // the component is mounted so it is called synchronously.
                  job();
              }
          };
      }
      const runner = effect$1(getter, {
          lazy: true,
          onTrack,
          onTrigger,
          scheduler
      });
      recordInstanceBoundEffect$1(runner, instance);
      // initial run
      if (cb) {
          if (immediate) {
              job();
          }
          else {
              oldValue = runner();
          }
      }
      else if (flush === 'post') {
          queuePostRenderEffect$1(runner, instance && instance.suspense);
      }
      else {
          runner();
      }
      return () => {
          stop$1(runner);
          if (instance) {
              remove$1(instance.effects, runner);
          }
      };
  }
  // this.$watch
  function instanceWatch$1(source, cb, options) {
      const publicThis = this.proxy;
      const getter = isString$1(source)
          ? () => publicThis[source]
          : source.bind(publicThis);
      return doWatch$1(getter, cb.bind(publicThis), options, this);
  }
  function traverse$1(value, seen = new Set()) {
      if (!isObject$1(value) || seen.has(value)) {
          return value;
      }
      seen.add(value);
      if (isRef$1(value)) {
          traverse$1(value.value, seen);
      }
      else if (isArray$1(value)) {
          for (let i = 0; i < value.length; i++) {
              traverse$1(value[i], seen);
          }
      }
      else if (isSet$1(value) || isMap$1(value)) {
          value.forEach((v) => {
              traverse$1(v, seen);
          });
      }
      else {
          for (const key in value) {
              traverse$1(value[key], seen);
          }
      }
      return value;
  }
  const queuePostRenderEffect$1 =  queueEffectWithSuspense$1
      ;

  const isTeleport$1 = (type) => type.__isTeleport;
  const NULL_DYNAMIC_COMPONENT$1 = Symbol();

  const Fragment$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'Fragment' : undefined);
  const Text$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'Text' : undefined);
  const Comment$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'Comment' : undefined);
  const Static$1 = Symbol((process.env.NODE_ENV !== 'production') ? 'Static' : undefined);
  let currentBlock$1 = null;
  function isVNode$1(value) {
      return value ? value.__v_isVNode === true : false;
  }
  const createVNodeWithArgsTransform$1 = (...args) => {
      return _createVNode$1(...( args));
  };
  const InternalObjectKey$1 = `__vInternal`;
  const normalizeKey$1 = ({ key }) => key != null ? key : null;
  const normalizeRef$1 = ({ ref }) => {
      return (ref != null
          ? isString$1(ref) || isRef$1(ref) || isFunction$1(ref)
              ? { i: currentRenderingInstance$1, r: ref }
              : ref
          : null);
  };
  const createVNode$1 = ((process.env.NODE_ENV !== 'production')
      ? createVNodeWithArgsTransform$1
      : _createVNode$1);
  function _createVNode$1(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
      if (!type || type === NULL_DYNAMIC_COMPONENT$1) {
          if ((process.env.NODE_ENV !== 'production') && !type) {
              warn$1(`Invalid vnode type when creating vnode: ${type}.`);
          }
          type = Comment$1;
      }
      if (isVNode$1(type)) {
          // createVNode receiving an existing vnode. This happens in cases like
          // <component :is="vnode"/>
          // #2078 make sure to merge refs during the clone instead of overwriting it
          const cloned = cloneVNode$1(type, props, true /* mergeRef: true */);
          if (children) {
              normalizeChildren$1(cloned, children);
          }
          return cloned;
      }
      // class component normalization.
      if (isClassComponent$1(type)) {
          type = type.__vccOpts;
      }
      // class & style normalization.
      if (props) {
          // for reactive or proxy objects, we need to clone it to enable mutation.
          if (isProxy$1(props) || InternalObjectKey$1 in props) {
              props = extend$1({}, props);
          }
          let { class: klass, style } = props;
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
      }
      // encode the vnode type information into a bitmap
      const shapeFlag = isString$1(type)
          ? 1 /* ELEMENT */
          :  isSuspense$1(type)
              ? 128 /* SUSPENSE */
              : isTeleport$1(type)
                  ? 64 /* TELEPORT */
                  : isObject$1(type)
                      ? 4 /* STATEFUL_COMPONENT */
                      : isFunction$1(type)
                          ? 2 /* FUNCTIONAL_COMPONENT */
                          : 0;
      if ((process.env.NODE_ENV !== 'production') && shapeFlag & 4 /* STATEFUL_COMPONENT */ && isProxy$1(type)) {
          type = toRaw$1(type);
          warn$1(`Vue received a Component which was made a reactive object. This can ` +
              `lead to unnecessary performance overhead, and should be avoided by ` +
              `marking the component with \`markRaw\` or using \`shallowRef\` ` +
              `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
      }
      const vnode = {
          __v_isVNode: true,
          ["__v_skip" /* SKIP */]: true,
          type,
          props,
          key: props && normalizeKey$1(props),
          ref: props && normalizeRef$1(props),
          scopeId: currentScopeId$1,
          children: null,
          component: null,
          suspense: null,
          ssContent: null,
          ssFallback: null,
          dirs: null,
          transition: null,
          el: null,
          anchor: null,
          target: null,
          targetAnchor: null,
          staticCount: 0,
          shapeFlag,
          patchFlag,
          dynamicProps,
          dynamicChildren: null,
          appContext: null
      };
      // validate key
      if ((process.env.NODE_ENV !== 'production') && vnode.key !== vnode.key) {
          warn$1(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
      }
      normalizeChildren$1(vnode, children);
      // normalize suspense children
      if ( shapeFlag & 128 /* SUSPENSE */) {
          const { content, fallback } = normalizeSuspenseChildren$1(vnode);
          vnode.ssContent = content;
          vnode.ssFallback = fallback;
      }
      if (
          // avoid a block node from tracking itself
          !isBlockNode &&
          // has current parent block
          currentBlock$1 &&
          // presence of a patch flag indicates this node needs patching on updates.
          // component nodes also should always be patched, because even if the
          // component doesn't need to update, it needs to persist the instance on to
          // the next vnode so that it can be properly unmounted later.
          (patchFlag > 0 || shapeFlag & 6 /* COMPONENT */) &&
          // the EVENTS flag is only for hydration and if it is the only flag, the
          // vnode should not be considered dynamic due to handler caching.
          patchFlag !== 32 /* HYDRATE_EVENTS */) {
          currentBlock$1.push(vnode);
      }
      return vnode;
  }
  function cloneVNode$1(vnode, extraProps, mergeRef = false) {
      // This is intentionally NOT using spread or extend to avoid the runtime
      // key enumeration cost.
      const { props, ref, patchFlag } = vnode;
      const mergedProps = extraProps ? mergeProps$1(props || {}, extraProps) : props;
      return {
          __v_isVNode: true,
          ["__v_skip" /* SKIP */]: true,
          type: vnode.type,
          props: mergedProps,
          key: mergedProps && normalizeKey$1(mergedProps),
          ref: extraProps && extraProps.ref
              ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                  // if the vnode itself already has a ref, cloneVNode will need to merge
                  // the refs so the single vnode can be set on multiple refs
                  mergeRef && ref
                      ? isArray$1(ref)
                          ? ref.concat(normalizeRef$1(extraProps))
                          : [ref, normalizeRef$1(extraProps)]
                      : normalizeRef$1(extraProps)
              : ref,
          scopeId: vnode.scopeId,
          children: vnode.children,
          target: vnode.target,
          targetAnchor: vnode.targetAnchor,
          staticCount: vnode.staticCount,
          shapeFlag: vnode.shapeFlag,
          // if the vnode is cloned with extra props, we can no longer assume its
          // existing patch flag to be reliable and need to add the FULL_PROPS flag.
          // note: perserve flag for fragments since they use the flag for children
          // fast paths only.
          patchFlag: extraProps && vnode.type !== Fragment$1
              ? patchFlag === -1 // hoisted node
                  ? 16 /* FULL_PROPS */
                  : patchFlag | 16 /* FULL_PROPS */
              : patchFlag,
          dynamicProps: vnode.dynamicProps,
          dynamicChildren: vnode.dynamicChildren,
          appContext: vnode.appContext,
          dirs: vnode.dirs,
          transition: vnode.transition,
          // These should technically only be non-null on mounted VNodes. However,
          // they *should* be copied for kept-alive vnodes. So we just always copy
          // them since them being non-null during a mount doesn't affect the logic as
          // they will simply be overwritten.
          component: vnode.component,
          suspense: vnode.suspense,
          ssContent: vnode.ssContent && cloneVNode$1(vnode.ssContent),
          ssFallback: vnode.ssFallback && cloneVNode$1(vnode.ssFallback),
          el: vnode.el,
          anchor: vnode.anchor
      };
  }
  /**
   * @private
   */
  function createTextVNode$1(text = ' ', flag = 0) {
      return createVNode$1(Text$1, null, text, flag);
  }
  function normalizeVNode$1(child) {
      if (child == null || typeof child === 'boolean') {
          // empty placeholder
          return createVNode$1(Comment$1);
      }
      else if (isArray$1(child)) {
          // fragment
          return createVNode$1(Fragment$1, null, child);
      }
      else if (typeof child === 'object') {
          // already vnode, this should be the most common since compiled templates
          // always produce all-vnode children arrays
          return child.el === null ? child : cloneVNode$1(child);
      }
      else {
          // strings and numbers
          return createVNode$1(Text$1, null, String(child));
      }
  }
  function normalizeChildren$1(vnode, children) {
      let type = 0;
      const { shapeFlag } = vnode;
      if (children == null) {
          children = null;
      }
      else if (isArray$1(children)) {
          type = 16 /* ARRAY_CHILDREN */;
      }
      else if (typeof children === 'object') {
          if (shapeFlag & 1 /* ELEMENT */ || shapeFlag & 64 /* TELEPORT */) {
              // Normalize slot to plain children for plain element and Teleport
              const slot = children.default;
              if (slot) {
                  // _c marker is added by withCtx() indicating this is a compiled slot
                  slot._c && setCompiledSlotRendering$1(1);
                  normalizeChildren$1(vnode, slot());
                  slot._c && setCompiledSlotRendering$1(-1);
              }
              return;
          }
          else {
              type = 32 /* SLOTS_CHILDREN */;
              const slotFlag = children._;
              if (!slotFlag && !(InternalObjectKey$1 in children)) {
                  children._ctx = currentRenderingInstance$1;
              }
              else if (slotFlag === 3 /* FORWARDED */ && currentRenderingInstance$1) {
                  // a child component receives forwarded slots from the parent.
                  // its slot type is determined by its parent's slot type.
                  if (currentRenderingInstance$1.vnode.patchFlag & 1024 /* DYNAMIC_SLOTS */) {
                      children._ = 2 /* DYNAMIC */;
                      vnode.patchFlag |= 1024 /* DYNAMIC_SLOTS */;
                  }
                  else {
                      children._ = 1 /* STABLE */;
                  }
              }
          }
      }
      else if (isFunction$1(children)) {
          children = { default: children, _ctx: currentRenderingInstance$1 };
          type = 32 /* SLOTS_CHILDREN */;
      }
      else {
          children = String(children);
          // force teleport children to array so it can be moved around
          if (shapeFlag & 64 /* TELEPORT */) {
              type = 16 /* ARRAY_CHILDREN */;
              children = [createTextVNode$1(children)];
          }
          else {
              type = 8 /* TEXT_CHILDREN */;
          }
      }
      vnode.children = children;
      vnode.shapeFlag |= type;
  }
  function mergeProps$1(...args) {
      const ret = extend$1({}, args[0]);
      for (let i = 1; i < args.length; i++) {
          const toMerge = args[i];
          for (const key in toMerge) {
              if (key === 'class') {
                  if (ret.class !== toMerge.class) {
                      ret.class = normalizeClass$1([ret.class, toMerge.class]);
                  }
              }
              else if (key === 'style') {
                  ret.style = normalizeStyle$1([ret.style, toMerge.style]);
              }
              else if (isOn$1(key)) {
                  const existing = ret[key];
                  const incoming = toMerge[key];
                  if (existing !== incoming) {
                      ret[key] = existing
                          ? [].concat(existing, toMerge[key])
                          : incoming;
                  }
              }
              else if (key !== '') {
                  ret[key] = toMerge[key];
              }
          }
      }
      return ret;
  }
  let isInBeforeCreate$1 = false;
  function resolveMergedOptions$1(instance) {
      const raw = instance.type;
      const { __merged, mixins, extends: extendsOptions } = raw;
      if (__merged)
          return __merged;
      const globalMixins = instance.appContext.mixins;
      if (!globalMixins.length && !mixins && !extendsOptions)
          return raw;
      const options = {};
      globalMixins.forEach(m => mergeOptions$1(options, m, instance));
      mergeOptions$1(options, raw, instance);
      return (raw.__merged = options);
  }
  function mergeOptions$1(to, from, instance) {
      const strats = instance.appContext.config.optionMergeStrategies;
      const { mixins, extends: extendsOptions } = from;
      extendsOptions && mergeOptions$1(to, extendsOptions, instance);
      mixins &&
          mixins.forEach((m) => mergeOptions$1(to, m, instance));
      for (const key in from) {
          if (strats && hasOwn$1(strats, key)) {
              to[key] = strats[key](to[key], from[key], instance.proxy, key);
          }
          else {
              to[key] = from[key];
          }
      }
  }

  /**
   * #2437 In Vue 3, functional components do not have a public instance proxy but
   * they exist in the internal parent chain. For code that relies on traversing
   * public $parent chains, skip functional ones and go to the parent instead.
   */
  const getPublicInstance$1 = (i) => i && (i.proxy ? i.proxy : getPublicInstance$1(i.parent));
  const publicPropertiesMap$1 = extend$1(Object.create(null), {
      $: i => i,
      $el: i => i.vnode.el,
      $data: i => i.data,
      $props: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly$1(i.props) : i.props),
      $attrs: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly$1(i.attrs) : i.attrs),
      $slots: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly$1(i.slots) : i.slots),
      $refs: i => ((process.env.NODE_ENV !== 'production') ? shallowReadonly$1(i.refs) : i.refs),
      $parent: i => getPublicInstance$1(i.parent),
      $root: i => i.root && i.root.proxy,
      $emit: i => i.emit,
      $options: i => (__VUE_OPTIONS_API__ ? resolveMergedOptions$1(i) : i.type),
      $forceUpdate: i => () => queueJob$1(i.update),
      $nextTick: i => nextTick$1.bind(i.proxy),
      $watch: i => (__VUE_OPTIONS_API__ ? instanceWatch$1.bind(i) : NOOP$1)
  });
  const PublicInstanceProxyHandlers$1 = {
      get({ _: instance }, key) {
          const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
          // let @vue/reactivity know it should never observe Vue public instances.
          if (key === "__v_skip" /* SKIP */) {
              return true;
          }
          // for internal formatters to know that this is a Vue instance
          if ((process.env.NODE_ENV !== 'production') && key === '__isVue') {
              return true;
          }
          // data / props / ctx
          // This getter gets called for every property access on the render context
          // during render and is a major hotspot. The most expensive part of this
          // is the multiple hasOwn() calls. It's much faster to do a simple property
          // access on a plain object, so we use an accessCache object (with null
          // prototype) to memoize what access type a key corresponds to.
          let normalizedProps;
          if (key[0] !== '$') {
              const n = accessCache[key];
              if (n !== undefined) {
                  switch (n) {
                      case 0 /* SETUP */:
                          return setupState[key];
                      case 1 /* DATA */:
                          return data[key];
                      case 3 /* CONTEXT */:
                          return ctx[key];
                      case 2 /* PROPS */:
                          return props[key];
                      // default: just fallthrough
                  }
              }
              else if (setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key)) {
                  accessCache[key] = 0 /* SETUP */;
                  return setupState[key];
              }
              else if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
                  accessCache[key] = 1 /* DATA */;
                  return data[key];
              }
              else if (
              // only cache other properties when instance has declared (thus stable)
              // props
              (normalizedProps = instance.propsOptions[0]) &&
                  hasOwn$1(normalizedProps, key)) {
                  accessCache[key] = 2 /* PROPS */;
                  return props[key];
              }
              else if (ctx !== EMPTY_OBJ$1 && hasOwn$1(ctx, key)) {
                  accessCache[key] = 3 /* CONTEXT */;
                  return ctx[key];
              }
              else if (!__VUE_OPTIONS_API__ || !isInBeforeCreate$1) {
                  accessCache[key] = 4 /* OTHER */;
              }
          }
          const publicGetter = publicPropertiesMap$1[key];
          let cssModule, globalProperties;
          // public $xxx properties
          if (publicGetter) {
              if (key === '$attrs') {
                  track$1(instance, "get" /* GET */, key);
                  (process.env.NODE_ENV !== 'production') && markAttrsAccessed$1();
              }
              return publicGetter(instance);
          }
          else if (
          // css module (injected by vue-loader)
          (cssModule = type.__cssModules) &&
              (cssModule = cssModule[key])) {
              return cssModule;
          }
          else if (ctx !== EMPTY_OBJ$1 && hasOwn$1(ctx, key)) {
              // user may set custom properties to `this` that start with `$`
              accessCache[key] = 3 /* CONTEXT */;
              return ctx[key];
          }
          else if (
          // global properties
          ((globalProperties = appContext.config.globalProperties),
              hasOwn$1(globalProperties, key))) {
              return globalProperties[key];
          }
          else if ((process.env.NODE_ENV !== 'production') &&
              currentRenderingInstance$1 &&
              (!isString$1(key) ||
                  // #1091 avoid internal isRef/isVNode checks on component instance leading
                  // to infinite warning loop
                  key.indexOf('__v') !== 0)) {
              if (data !== EMPTY_OBJ$1 &&
                  (key[0] === '$' || key[0] === '_') &&
                  hasOwn$1(data, key)) {
                  warn$1(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved ` +
                      `character ("$" or "_") and is not proxied on the render context.`);
              }
              else {
                  warn$1(`Property ${JSON.stringify(key)} was accessed during render ` +
                      `but is not defined on instance.`);
              }
          }
      },
      set({ _: instance }, key, value) {
          const { data, setupState, ctx } = instance;
          if (setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key)) {
              setupState[key] = value;
          }
          else if (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) {
              data[key] = value;
          }
          else if (key in instance.props) {
              (process.env.NODE_ENV !== 'production') &&
                  warn$1(`Attempting to mutate prop "${key}". Props are readonly.`, instance);
              return false;
          }
          if (key[0] === '$' && key.slice(1) in instance) {
              (process.env.NODE_ENV !== 'production') &&
                  warn$1(`Attempting to mutate public property "${key}". ` +
                      `Properties starting with $ are reserved and readonly.`, instance);
              return false;
          }
          else {
              if ((process.env.NODE_ENV !== 'production') && key in instance.appContext.config.globalProperties) {
                  Object.defineProperty(ctx, key, {
                      enumerable: true,
                      configurable: true,
                      value
                  });
              }
              else {
                  ctx[key] = value;
              }
          }
          return true;
      },
      has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
          let normalizedProps;
          return (accessCache[key] !== undefined ||
              (data !== EMPTY_OBJ$1 && hasOwn$1(data, key)) ||
              (setupState !== EMPTY_OBJ$1 && hasOwn$1(setupState, key)) ||
              ((normalizedProps = propsOptions[0]) && hasOwn$1(normalizedProps, key)) ||
              hasOwn$1(ctx, key) ||
              hasOwn$1(publicPropertiesMap$1, key) ||
              hasOwn$1(appContext.config.globalProperties, key));
      }
  };
  if ((process.env.NODE_ENV !== 'production') && !false) {
      PublicInstanceProxyHandlers$1.ownKeys = (target) => {
          warn$1(`Avoid app logic that relies on enumerating keys on a component instance. ` +
              `The keys will be empty in production mode to avoid performance overhead.`);
          return Reflect.ownKeys(target);
      };
  }
  const RuntimeCompiledPublicInstanceProxyHandlers$1 = extend$1({}, PublicInstanceProxyHandlers$1, {
      get(target, key) {
          // fast path for unscopables when using `with` block
          if (key === Symbol.unscopables) {
              return;
          }
          return PublicInstanceProxyHandlers$1.get(target, key, target);
      },
      has(_, key) {
          const has = key[0] !== '_' && !isGloballyWhitelisted$1(key);
          if ((process.env.NODE_ENV !== 'production') && !has && PublicInstanceProxyHandlers$1.has(_, key)) {
              warn$1(`Property ${JSON.stringify(key)} should not start with _ which is a reserved prefix for Vue internals.`);
          }
          return has;
      }
  });
  let currentInstance$1 = null;
  // record effects created during a component's setup() so that they can be
  // stopped when the component unmounts
  function recordInstanceBoundEffect$1(effect, instance = currentInstance$1) {
      if (instance) {
          (instance.effects || (instance.effects = [])).push(effect);
      }
  }
  const classifyRE$1 = /(?:^|[-_])(\w)/g;
  const classify$1 = (str) => str.replace(classifyRE$1, c => c.toUpperCase()).replace(/[-_]/g, '');
  /* istanbul ignore next */
  function formatComponentName$1(instance, Component, isRoot = false) {
      let name = isFunction$1(Component)
          ? Component.displayName || Component.name
          : Component.name;
      if (!name && Component.__file) {
          const match = Component.__file.match(/([^/\\]+)\.\w+$/);
          if (match) {
              name = match[1];
          }
      }
      if (!name && instance && instance.parent) {
          // try to infer the name based on reverse resolution
          const inferFromRegistry = (registry) => {
              for (const key in registry) {
                  if (registry[key] === Component) {
                      return key;
                  }
              }
          };
          name =
              inferFromRegistry(instance.components ||
                  instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
      }
      return name ? classify$1(name) : isRoot ? `App` : `Anonymous`;
  }
  function isClassComponent$1(value) {
      return isFunction$1(value) && '__vccOpts' in value;
  }

  const ssrContextKey$1 = Symbol((process.env.NODE_ENV !== 'production') ? `ssrContext` : ``);

  function initCustomFormatter$1() {
      /* eslint-disable no-restricted-globals */
      if (!(process.env.NODE_ENV !== 'production') || typeof window === 'undefined') {
          return;
      }
      const vueStyle = { style: 'color:#3ba776' };
      const numberStyle = { style: 'color:#0b1bc9' };
      const stringStyle = { style: 'color:#b62e24' };
      const keywordStyle = { style: 'color:#9d288c' };
      // custom formatter for Chrome
      // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html
      const formatter = {
          header(obj) {
              // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
              if (!isObject$1(obj)) {
                  return null;
              }
              if (obj.__isVue) {
                  return ['div', vueStyle, `VueInstance`];
              }
              else if (isRef$1(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, genRefFlag(obj)],
                      '<',
                      formatValue(obj.value),
                      `>`
                  ];
              }
              else if (isReactive$1(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, 'Reactive'],
                      '<',
                      formatValue(obj),
                      `>${isReadonly$1(obj) ? ` (readonly)` : ``}`
                  ];
              }
              else if (isReadonly$1(obj)) {
                  return [
                      'div',
                      {},
                      ['span', vueStyle, 'Readonly'],
                      '<',
                      formatValue(obj),
                      '>'
                  ];
              }
              return null;
          },
          hasBody(obj) {
              return obj && obj.__isVue;
          },
          body(obj) {
              if (obj && obj.__isVue) {
                  return [
                      'div',
                      {},
                      ...formatInstance(obj.$)
                  ];
              }
          }
      };
      function formatInstance(instance) {
          const blocks = [];
          if (instance.type.props && instance.props) {
              blocks.push(createInstanceBlock('props', toRaw$1(instance.props)));
          }
          if (instance.setupState !== EMPTY_OBJ$1) {
              blocks.push(createInstanceBlock('setup', instance.setupState));
          }
          if (instance.data !== EMPTY_OBJ$1) {
              blocks.push(createInstanceBlock('data', toRaw$1(instance.data)));
          }
          const computed = extractKeys(instance, 'computed');
          if (computed) {
              blocks.push(createInstanceBlock('computed', computed));
          }
          const injected = extractKeys(instance, 'inject');
          if (injected) {
              blocks.push(createInstanceBlock('injected', injected));
          }
          blocks.push([
              'div',
              {},
              [
                  'span',
                  {
                      style: keywordStyle.style + ';opacity:0.66'
                  },
                  '$ (internal): '
              ],
              ['object', { object: instance }]
          ]);
          return blocks;
      }
      function createInstanceBlock(type, target) {
          target = extend$1({}, target);
          if (!Object.keys(target).length) {
              return ['span', {}];
          }
          return [
              'div',
              { style: 'line-height:1.25em;margin-bottom:0.6em' },
              [
                  'div',
                  {
                      style: 'color:#476582'
                  },
                  type
              ],
              [
                  'div',
                  {
                      style: 'padding-left:1.25em'
                  },
                  ...Object.keys(target).map(key => {
                      return [
                          'div',
                          {},
                          ['span', keywordStyle, key + ': '],
                          formatValue(target[key], false)
                      ];
                  })
              ]
          ];
      }
      function formatValue(v, asRaw = true) {
          if (typeof v === 'number') {
              return ['span', numberStyle, v];
          }
          else if (typeof v === 'string') {
              return ['span', stringStyle, JSON.stringify(v)];
          }
          else if (typeof v === 'boolean') {
              return ['span', keywordStyle, v];
          }
          else if (isObject$1(v)) {
              return ['object', { object: asRaw ? toRaw$1(v) : v }];
          }
          else {
              return ['span', stringStyle, String(v)];
          }
      }
      function extractKeys(instance, type) {
          const Comp = instance.type;
          if (isFunction$1(Comp)) {
              return;
          }
          const extracted = {};
          for (const key in instance.ctx) {
              if (isKeyOfType(Comp, key, type)) {
                  extracted[key] = instance.ctx[key];
              }
          }
          return extracted;
      }
      function isKeyOfType(Comp, key, type) {
          const opts = Comp[type];
          if ((isArray$1(opts) && opts.includes(key)) ||
              (isObject$1(opts) && key in opts)) {
              return true;
          }
          if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
              return true;
          }
          if (Comp.mixins && Comp.mixins.some(m => isKeyOfType(m, key, type))) {
              return true;
          }
      }
      function genRefFlag(v) {
          if (v._shallow) {
              return `ShallowRef`;
          }
          if (v.effect) {
              return `ComputedRef`;
          }
          return `Ref`;
      }
      if (window.devtoolsFormatters) {
          window.devtoolsFormatters.push(formatter);
      }
      else {
          window.devtoolsFormatters = [formatter];
      }
  }

  const svgNS = 'http://www.w3.org/2000/svg';
  const doc = (typeof document !== 'undefined' ? document : null);
  let tempContainer;
  let tempSVGContainer;
  const nodeOps = {
      insert: (child, parent, anchor) => {
          parent.insertBefore(child, anchor || null);
      },
      remove: child => {
          const parent = child.parentNode;
          if (parent) {
              parent.removeChild(child);
          }
      },
      createElement: (tag, isSVG, is) => isSVG
          ? doc.createElementNS(svgNS, tag)
          : doc.createElement(tag, is ? { is } : undefined),
      createText: text => doc.createTextNode(text),
      createComment: text => doc.createComment(text),
      setText: (node, text) => {
          node.nodeValue = text;
      },
      setElementText: (el, text) => {
          el.textContent = text;
      },
      parentNode: node => node.parentNode,
      nextSibling: node => node.nextSibling,
      querySelector: selector => doc.querySelector(selector),
      setScopeId(el, id) {
          el.setAttribute(id, '');
      },
      cloneNode(el) {
          return el.cloneNode(true);
      },
      // __UNSAFE__
      // Reason: innerHTML.
      // Static content here can only come from compiled templates.
      // As long as the user only uses trusted templates, this is safe.
      insertStaticContent(content, parent, anchor, isSVG) {
          const temp = isSVG
              ? tempSVGContainer ||
                  (tempSVGContainer = doc.createElementNS(svgNS, 'svg'))
              : tempContainer || (tempContainer = doc.createElement('div'));
          temp.innerHTML = content;
          const first = temp.firstChild;
          let node = first;
          let last = node;
          while (node) {
              last = node;
              nodeOps.insert(node, parent, anchor);
              node = temp.firstChild;
          }
          return [first, last];
      }
  };

  // compiler should normalize class + :class bindings on the same element
  // into a single binding ['staticClass', dynamic]
  function patchClass(el, value, isSVG) {
      if (value == null) {
          value = '';
      }
      if (isSVG) {
          el.setAttribute('class', value);
      }
      else {
          // directly setting className should be faster than setAttribute in theory
          // if this is an element during a transition, take the temporary transition
          // classes into account.
          const transitionClasses = el._vtc;
          if (transitionClasses) {
              value = (value
                  ? [value, ...transitionClasses]
                  : [...transitionClasses]).join(' ');
          }
          el.className = value;
      }
  }

  function patchStyle(el, prev, next) {
      const style = el.style;
      if (!next) {
          el.removeAttribute('style');
      }
      else if (isString$1(next)) {
          if (prev !== next) {
              style.cssText = next;
          }
      }
      else {
          for (const key in next) {
              setStyle(style, key, next[key]);
          }
          if (prev && !isString$1(prev)) {
              for (const key in prev) {
                  if (next[key] == null) {
                      setStyle(style, key, '');
                  }
              }
          }
      }
  }
  const importantRE = /\s*!important$/;
  function setStyle(style, name, val) {
      if (isArray$1(val)) {
          val.forEach(v => setStyle(style, name, v));
      }
      else {
          if (name.startsWith('--')) {
              // custom property definition
              style.setProperty(name, val);
          }
          else {
              const prefixed = autoPrefix(style, name);
              if (importantRE.test(val)) {
                  // !important
                  style.setProperty(hyphenate(prefixed), val.replace(importantRE, ''), 'important');
              }
              else {
                  style[prefixed] = val;
              }
          }
      }
  }
  const prefixes = ['Webkit', 'Moz', 'ms'];
  const prefixCache = {};
  function autoPrefix(style, rawName) {
      const cached = prefixCache[rawName];
      if (cached) {
          return cached;
      }
      let name = camelize(rawName);
      if (name !== 'filter' && name in style) {
          return (prefixCache[rawName] = name);
      }
      name = capitalize$1(name);
      for (let i = 0; i < prefixes.length; i++) {
          const prefixed = prefixes[i] + name;
          if (prefixed in style) {
              return (prefixCache[rawName] = prefixed);
          }
      }
      return rawName;
  }

  const xlinkNS = 'http://www.w3.org/1999/xlink';
  function patchAttr(el, key, value, isSVG) {
      if (isSVG && key.startsWith('xlink:')) {
          if (value == null) {
              el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
          }
          else {
              el.setAttributeNS(xlinkNS, key, value);
          }
      }
      else {
          // note we are only checking boolean attributes that don't have a
          // corresponding dom prop of the same name here.
          const isBoolean = isSpecialBooleanAttr(key);
          if (value == null || (isBoolean && value === false)) {
              el.removeAttribute(key);
          }
          else {
              el.setAttribute(key, isBoolean ? '' : value);
          }
      }
  }

  // __UNSAFE__
  // functions. The user is responsible for using them with only trusted content.
  function patchDOMProp(el, key, value, 
  // the following args are passed only due to potential innerHTML/textContent
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
          const newValue = value == null ? '' : value;
          if (el.value !== newValue) {
              el.value = newValue;
          }
          return;
      }
      if (value === '' || value == null) {
          const type = typeof el[key];
          if (value === '' && type === 'boolean') {
              // e.g. <select multiple> compiles to { multiple: '' }
              el[key] = true;
              return;
          }
          else if (value == null && type === 'string') {
              // e.g. <div :id="null">
              el[key] = '';
              el.removeAttribute(key);
              return;
          }
          else if (type === 'number') {
              // e.g. <img :width="null">
              el[key] = 0;
              el.removeAttribute(key);
              return;
          }
      }
      // some properties perform value validation and throw
      try {
          el[key] = value;
      }
      catch (e) {
          if ((process.env.NODE_ENV !== 'production')) {
              warn$1(`Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: ` +
                  `value ${value} is invalid.`, e);
          }
      }
  }

  // Async edge case fix requires storing an event listener's attach timestamp.
  let _getNow = Date.now;
  // Determine what event timestamp the browser is using. Annoyingly, the
  // timestamp can either be hi-res (relative to page load) or low-res
  // (relative to UNIX epoch), so in order to compare time we have to use the
  // same timestamp type when saving the flush timestamp.
  if (typeof document !== 'undefined' &&
      _getNow() > document.createEvent('Event').timeStamp) {
      // if the low-res timestamp which is bigger than the event timestamp
      // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
      // and we need to use the hi-res version for event listeners as well.
      _getNow = () => performance.now();
  }
  // To avoid the overhead of repeatedly calling performance.now(), we cache
  // and use the same timestamp for all event listeners attached in the same tick.
  let cachedNow = 0;
  const p = Promise.resolve();
  const reset = () => {
      cachedNow = 0;
  };
  const getNow = () => cachedNow || (p.then(reset), (cachedNow = _getNow()));
  function addEventListener(el, event, handler, options) {
      el.addEventListener(event, handler, options);
  }
  function removeEventListener(el, event, handler, options) {
      el.removeEventListener(event, handler, options);
  }
  function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
      // vei = vue event invokers
      const invokers = el._vei || (el._vei = {});
      const existingInvoker = invokers[rawName];
      if (nextValue && existingInvoker) {
          // patch
          existingInvoker.value = nextValue;
      }
      else {
          const [name, options] = parseName(rawName);
          if (nextValue) {
              // add
              const invoker = (invokers[rawName] = createInvoker(nextValue, instance));
              addEventListener(el, name, invoker, options);
          }
          else if (existingInvoker) {
              // remove
              removeEventListener(el, name, existingInvoker, options);
              invokers[rawName] = undefined;
          }
      }
  }
  const optionsModifierRE = /(?:Once|Passive|Capture)$/;
  function parseName(name) {
      let options;
      if (optionsModifierRE.test(name)) {
          options = {};
          let m;
          while ((m = name.match(optionsModifierRE))) {
              name = name.slice(0, name.length - m[0].length);
              options[m[0].toLowerCase()] = true;
          }
      }
      return [name.slice(2).toLowerCase(), options];
  }
  function createInvoker(initialValue, instance) {
      const invoker = (e) => {
          // async edge case #6566: inner click event triggers patch, event handler
          // attached to outer element during patch, and triggered again. This
          // happens because browsers fire microtask ticks between event propagation.
          // the solution is simple: we save the timestamp when a handler is attached,
          // and the handler would only fire if the event passed to it was fired
          // AFTER it was attached.
          const timeStamp = e.timeStamp || _getNow();
          if (timeStamp >= invoker.attached - 1) {
              callWithAsyncErrorHandling$1(patchStopImmediatePropagation(e, invoker.value), instance, 5 /* NATIVE_EVENT_HANDLER */, [e]);
          }
      };
      invoker.value = initialValue;
      invoker.attached = getNow();
      return invoker;
  }
  function patchStopImmediatePropagation(e, value) {
      if (isArray$1(value)) {
          const originalStop = e.stopImmediatePropagation;
          e.stopImmediatePropagation = () => {
              originalStop.call(e);
              e._stopped = true;
          };
          return value.map(fn => (e) => !e._stopped && fn(e));
      }
      else {
          return value;
      }
  }

  const nativeOnRE = /^on[a-z]/;
  const forcePatchProp = (_, key) => key === 'value';
  const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
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
              }
              else if (shouldSetAsProp(el, key, nextValue, isSVG)) {
                  patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
              }
              else {
                  // special case for <input v-model type="checkbox"> with
                  // :true-value & :false-value
                  // store value as dom properties since non-string values will be
                  // stringified.
                  if (key === 'true-value') {
                      el._trueValue = nextValue;
                  }
                  else if (key === 'false-value') {
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
          }
          // or native onclick with function values
          if (key in el && nativeOnRE.test(key) && isFunction$1(value)) {
              return true;
          }
          return false;
      }
      // spellcheck and draggable are numerated attrs, however their
      // corresponding DOM properties are actually booleans - this leads to
      // setting it with a string "false" value leading it to be coerced to
      // `true`, so we need to always treat them as attributes.
      // Note that `contentEditable` doesn't have this problem: its DOM
      // property is also enumerated string values.
      if (key === 'spellcheck' || key === 'draggable') {
          return false;
      }
      // #1787 form as an attribute must be a string, while it accepts an Element as
      // a prop
      if (key === 'form' && typeof value === 'string') {
          return false;
      }
      // #1526 <input list> must be set as attribute
      if (key === 'list' && el.tagName === 'INPUT') {
          return false;
      }
      // native onclick with string value, must be set as attribute
      if (nativeOnRE.test(key) && isString$1(value)) {
          return false;
      }
      return key in el;
  }

  const rendererOptions = extend$1({ patchProp, forcePatchProp }, nodeOps);

  function initDev$1() {
      const target = getGlobalThis$1();
      target.__VUE__ = true;
      setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__);
      {
          initCustomFormatter$1();
      }
  }

  // This entry exports the runtime only, and is built as
  (process.env.NODE_ENV !== 'production') && initDev$1();

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
        callback.apply(void 0, [state].concat(_toConsumableArray(currentArgs)));
      }

      lastState = state;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        callback.apply(void 0, [state].concat(_toConsumableArray(currentArgs)));
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

  var VisibilityState =
  /*#__PURE__*/
  function () {
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
    version: "0.9.0-ropez.1",
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
    emits: ['update', 'resize', 'visible', 'hidden'],
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
    emits: ['resize', 'visible', 'vscroll:update'],
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
      default: vue.withCtx(function (_ref) {
        var itemWithSize = _ref.item,
            index = _ref.index,
            active = _ref.active;
        return [vue.renderSlot(_ctx.$slots, "default", {
          item: itemWithSize.item,
          index: index,
          active: active,
          itemWithSize: itemWithSize
        })];
      }),
      before: vue.withCtx(function () {
        return [vue.renderSlot(_ctx.$slots, "before")];
      }),
      after: vue.withCtx(function () {
        return [vue.renderSlot(_ctx.$slots, "after")];
      }),
      _: 1
      /* STABLE */

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
    version: "1.0.99-ropez.2",
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
