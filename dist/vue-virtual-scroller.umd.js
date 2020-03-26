(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('vue')) :
  typeof define === 'function' && define.amd ? define(['exports', 'vue'], factory) :
  (global = global || self, factory(global['vue-virtual-scroller'] = {}, global.Vue));
}(this, (function (exports, Vue) { 'use strict';

  Vue = Vue && Object.prototype.hasOwnProperty.call(Vue, 'default') ? Vue['default'] : Vue;

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
  	}

  	// other browser
  	return -1;
  }

  var isIE = void 0;

  function initCompat() {
  	if (!initCompat.init) {
  		initCompat.init = true;
  		isIE = getInternetExplorerVersion() !== -1;
  	}
  }

  var ResizeObserver$1 = { render: function render() {
  		var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "resize-observer", attrs: { "tabindex": "-1" } });
  	}, staticRenderFns: [], _scopeId: 'data-v-b329ee4c',
  	name: 'resize-observer',

  	methods: {
  		compareAndNotify: function compareAndNotify() {
  			if (this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight) {
  				this._w = this.$el.offsetWidth;
  				this._h = this.$el.offsetHeight;
  				this.$emit('notify');
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
  				delete this._resizeObject.onload;
  			}
  		}
  	},

  	mounted: function mounted() {
  		var _this = this;

  		initCompat();
  		this.$nextTick(function () {
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
  	beforeDestroy: function beforeDestroy() {
  		this.removeResizeHandlers();
  	}
  };

  // Install the components
  function install(Vue) {
  	Vue.component('resize-observer', ResizeObserver$1);
  	Vue.component('ResizeObserver', ResizeObserver$1);
  }

  // Plugin
  var plugin = {
  	// eslint-disable-next-line no-undef
  	version: "0.4.5",
  	install: install
  };

  // Auto-install
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

        vnode.context.$nextTick(function () {
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
    bind: bind,
    update: update,
    unbind: unbind
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

  var uid = 0;
  var script = {
    name: 'RecycleScroller',
    components: {
      ResizeObserver: ResizeObserver$1
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
          var accumulator = 0;
          var current;

          for (var i = 0, l = items.length; i < l; i++) {
            current = items[i][field] || minItemSize;
            accumulator += current;
            sizes[i] = {
              accumulator: accumulator,
              size: current
            };
          }

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

      if (this.$isServer) {
        this.updateVisibleItems(false);
      }
    },
    mounted: function mounted() {
      var _this = this;

      this.applyPageMode();
      this.$nextTick(function () {
        _this.updateVisibleItems(true);

        _this.ready = true;
      });
    },
    beforeDestroy: function beforeDestroy() {
      this.removeListeners();
    },
    methods: {
      addView: function addView(pool, index, item, key, type) {
        var view = {
          item: item,
          position: 0
        };
        var nonReactive = {
          id: uid++,
          index: index,
          used: true,
          key: key,
          type: type
        };
        Object.defineProperty(view, 'nr', {
          configurable: false,
          value: nonReactive
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

            var _this2$updateVisibleI = _this2.updateVisibleItems(false),
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
        var itemSize = this.itemSize;
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
        } else if (this.$isServer) {
          startIndex = 0;
          endIndex = this.prerender;
          totalSize = null;
        } else {
          var scroll = this.getScroll();
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
        var unusedIndex;

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

        if (!continuous) {
          unusedIndex = new Map();
        }

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

            if (continuous) {
              unusedPool = unusedViews.get(type); // Reuse existing view

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
              unusedPool = unusedViews.get(type);
              v = unusedIndex.get(type) || 0; // Use existing view
              // We don't care if they are already used
              // because we are not in continous scrolling

              if (unusedPool && v < unusedPool.length) {
                view = unusedPool[v];
                view.item = item;
                view.nr.used = true;
                view.nr.index = _i3;
                view.nr.key = key;
                view.nr.type = type;
                unusedIndex.set(type, v + 1);
              } else {
                view = this.addView(pool, _i3, item, key, type);
                this.unuseView(view, true);
              }

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
        if (this.emitUpdate) this.$emit('update', startIndex, endIndex);
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
      }
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
      if (typeof shadowMode !== 'boolean') {
          createInjectorSSR = createInjector;
          createInjector = shadowMode;
          shadowMode = false;
      }
      // Vue.extend constructor export interop.
      const options = typeof script === 'function' ? script.options : script;
      // render functions
      if (template && template.render) {
          options.render = template.render;
          options.staticRenderFns = template.staticRenderFns;
          options._compiled = true;
          // functional template
          if (isFunctionalTemplate) {
              options.functional = true;
          }
      }
      // scopedId
      if (scopeId) {
          options._scopeId = scopeId;
      }
      let hook;
      if (moduleIdentifier) {
          // server build
          hook = function (context) {
              // 2.3 injection
              context =
                  context || // cached call
                      (this.$vnode && this.$vnode.ssrContext) || // stateful
                      (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
              // 2.2 with runInNewContext: true
              if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                  context = __VUE_SSR_CONTEXT__;
              }
              // inject component styles
              if (style) {
                  style.call(this, createInjectorSSR(context));
              }
              // register component module identifier for async chunk inference
              if (context && context._registeredComponents) {
                  context._registeredComponents.add(moduleIdentifier);
              }
          };
          // used by ssr in case component is cached and beforeCreate
          // never gets called
          options._ssrRegister = hook;
      }
      else if (style) {
          hook = shadowMode
              ? function (context) {
                  style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
              }
              : function (context) {
                  style.call(this, createInjector(context));
              };
      }
      if (hook) {
          if (options.functional) {
              // register for functional component in vue file
              const originalRender = options.render;
              options.render = function renderWithStyleInjection(h, context) {
                  hook.call(context);
                  return originalRender(h, context);
              };
          }
          else {
              // inject component registration as beforeCreate hook
              const existing = options.beforeCreate;
              options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
          }
      }
      return script;
  }

  const isOldIE = typeof navigator !== 'undefined' &&
      /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
  function createInjector(context) {
      return (id, style) => addStyle(id, style);
  }
  let HEAD;
  const styles = {};
  function addStyle(id, css) {
      const group = isOldIE ? css.media || 'default' : id;
      const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
      if (!style.ids.has(id)) {
          style.ids.add(id);
          let code = css.source;
          if (css.map) {
              // https://developer.chrome.com/devtools/docs/javascript-debugging
              // this makes source maps inside style tags work properly in Chrome
              code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
              // http://stackoverflow.com/a/26603875
              code +=
                  '\n/*# sourceMappingURL=data:application/json;base64,' +
                      btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                      ' */';
          }
          if (!style.element) {
              style.element = document.createElement('style');
              style.element.type = 'text/css';
              if (css.media)
                  style.element.setAttribute('media', css.media);
              if (HEAD === undefined) {
                  HEAD = document.head || document.getElementsByTagName('head')[0];
              }
              HEAD.appendChild(style.element);
          }
          if ('styleSheet' in style.element) {
              style.styles.push(code);
              style.element.styleSheet.cssText = style.styles
                  .filter(Boolean)
                  .join('\n');
          }
          else {
              const index = style.ids.size - 1;
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index])
                  style.element.removeChild(nodes[index]);
              if (nodes.length)
                  style.element.insertBefore(textNode, nodes[index]);
              else
                  style.element.appendChild(textNode);
          }
      }
  }

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _obj, _obj$1;
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "div",
      {
        directives: [
          {
            name: "observe-visibility",
            rawName: "v-observe-visibility",
            value: _vm.handleVisibilityChange,
            expression: "handleVisibilityChange"
          }
        ],
        staticClass: "vue-recycle-scroller",
        class:
          ((_obj = {
            ready: _vm.ready,
            "page-mode": _vm.pageMode
          }),
          (_obj["direction-" + _vm.direction] = true),
          _obj),
        on: {
          "&scroll": function($event) {
            return _vm.handleScroll($event)
          }
        }
      },
      [
        _vm.$slots.before
          ? _c(
              "div",
              { staticClass: "vue-recycle-scroller__slot" },
              [_vm._t("before")],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _c(
          "div",
          {
            ref: "wrapper",
            staticClass: "vue-recycle-scroller__item-wrapper",
            style:
              ((_obj$1 = {}),
              (_obj$1[_vm.direction === "vertical" ? "minHeight" : "minWidth"] =
                _vm.totalSize + "px"),
              _obj$1)
          },
          _vm._l(_vm.pool, function(view) {
            return _c(
              "div",
              {
                key: view.nr.id,
                staticClass: "vue-recycle-scroller__item-view",
                class: { hover: _vm.hoverKey === view.nr.key },
                style: _vm.ready
                  ? {
                      transform:
                        "translate" +
                        (_vm.direction === "vertical" ? "Y" : "X") +
                        "(" +
                        view.position +
                        "px)"
                    }
                  : null,
                on: {
                  mouseenter: function($event) {
                    _vm.hoverKey = view.nr.key;
                  },
                  mouseleave: function($event) {
                    _vm.hoverKey = null;
                  }
                }
              },
              [
                _vm._t("default", null, {
                  item: view.item,
                  index: view.nr.index,
                  active: view.nr.used
                })
              ],
              2
            )
          }),
          0
        ),
        _vm._v(" "),
        _vm.$slots.after
          ? _c(
              "div",
              { staticClass: "vue-recycle-scroller__slot" },
              [_vm._t("after")],
              2
            )
          : _vm._e(),
        _vm._v(" "),
        _c("ResizeObserver", { on: { notify: _vm.handleResize } })
      ],
      1
    )
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = function (inject) {
      if (!inject) return
      inject("data-v-5c61d14b_0", { source: "\n.vue-recycle-scroller {\n  position: relative;\n}\n.vue-recycle-scroller.direction-vertical:not(.page-mode) {\n  overflow-y: auto;\n}\n.vue-recycle-scroller.direction-horizontal:not(.page-mode) {\n  overflow-x: auto;\n}\n.vue-recycle-scroller.direction-horizontal {\n  display: flex;\n}\n.vue-recycle-scroller__slot {\n  flex: auto 0 0;\n}\n.vue-recycle-scroller__item-wrapper {\n  flex: 1;\n  box-sizing: border-box;\n  overflow: hidden;\n  position: relative;\n}\n.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {\n  position: absolute;\n  top: 0;\n  left: 0;\n  will-change: transform;\n}\n.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {\n  width: 100%;\n}\n.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {\n  height: 100%;\n}\n.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {\n  width: 100%;\n}\n.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {\n  height: 100%;\n}\n", map: {"version":3,"sources":["/home/akryum/Projects/vue-virtual-scroller/src/components/RecycleScroller.vue"],"names":[],"mappings":";AAqjBA;EACA,kBAAA;AACA;AAEA;EACA,gBAAA;AACA;AAEA;EACA,gBAAA;AACA;AAEA;EACA,aAAA;AACA;AAEA;EACA,cAAA;AACA;AAEA;EACA,OAAA;EACA,sBAAA;EACA,gBAAA;EACA,kBAAA;AACA;AAEA;EACA,kBAAA;EACA,MAAA;EACA,OAAA;EACA,sBAAA;AACA;AAEA;EACA,WAAA;AACA;AAEA;EACA,YAAA;AACA;AAEA;EACA,WAAA;AACA;AAEA;EACA,YAAA;AACA","file":"RecycleScroller.vue","sourcesContent":["<template>\n  <div\n    v-observe-visibility=\"handleVisibilityChange\"\n    class=\"vue-recycle-scroller\"\n    :class=\"{\n      ready,\n      'page-mode': pageMode,\n      [`direction-${direction}`]: true,\n    }\"\n    @scroll.passive=\"handleScroll\"\n  >\n    <div\n      v-if=\"$slots.before\"\n      class=\"vue-recycle-scroller__slot\"\n    >\n      <slot\n        name=\"before\"\n      />\n    </div>\n\n    <div\n      ref=\"wrapper\"\n      :style=\"{ [direction === 'vertical' ? 'minHeight' : 'minWidth']: totalSize + 'px' }\"\n      class=\"vue-recycle-scroller__item-wrapper\"\n    >\n      <div\n        v-for=\"view of pool\"\n        :key=\"view.nr.id\"\n        :style=\"ready ? { transform: `translate${direction === 'vertical' ? 'Y' : 'X'}(${view.position}px)` } : null\"\n        class=\"vue-recycle-scroller__item-view\"\n        :class=\"{ hover: hoverKey === view.nr.key }\"\n        @mouseenter=\"hoverKey = view.nr.key\"\n        @mouseleave=\"hoverKey = null\"\n      >\n        <slot\n          :item=\"view.item\"\n          :index=\"view.nr.index\"\n          :active=\"view.nr.used\"\n        />\n      </div>\n    </div>\n\n    <div\n      v-if=\"$slots.after\"\n      class=\"vue-recycle-scroller__slot\"\n    >\n      <slot\n        name=\"after\"\n      />\n    </div>\n\n    <ResizeObserver @notify=\"handleResize\" />\n  </div>\n</template>\n\n<script>\nimport { ResizeObserver } from 'vue-resize'\nimport { ObserveVisibility } from 'vue-observe-visibility'\nimport ScrollParent from 'scrollparent'\nimport config from '../config'\nimport { props, simpleArray } from './common'\nimport { supportsPassive } from '../utils'\n\nlet uid = 0\n\nexport default {\n  name: 'RecycleScroller',\n\n  components: {\n    ResizeObserver,\n  },\n\n  directives: {\n    ObserveVisibility,\n  },\n\n  props: {\n    ...props,\n\n    itemSize: {\n      type: Number,\n      default: null,\n    },\n\n    minItemSize: {\n      type: [Number, String],\n      default: null,\n    },\n\n    sizeField: {\n      type: String,\n      default: 'size',\n    },\n\n    typeField: {\n      type: String,\n      default: 'type',\n    },\n\n    buffer: {\n      type: Number,\n      default: 200,\n    },\n\n    pageMode: {\n      type: Boolean,\n      default: false,\n    },\n\n    prerender: {\n      type: Number,\n      default: 0,\n    },\n\n    emitUpdate: {\n      type: Boolean,\n      default: false,\n    },\n  },\n\n  data () {\n    return {\n      pool: [],\n      totalSize: 0,\n      ready: false,\n      hoverKey: null,\n    }\n  },\n\n  computed: {\n    sizes () {\n      if (this.itemSize === null) {\n        const sizes = {\n          '-1': { accumulator: 0 },\n        }\n        const items = this.items\n        const field = this.sizeField\n        const minItemSize = this.minItemSize\n        let accumulator = 0\n        let current\n        for (let i = 0, l = items.length; i < l; i++) {\n          current = items[i][field] || minItemSize\n          accumulator += current\n          sizes[i] = { accumulator, size: current }\n        }\n        return sizes\n      }\n      return []\n    },\n\n    simpleArray,\n  },\n\n  watch: {\n    items () {\n      this.updateVisibleItems(true)\n    },\n\n    pageMode () {\n      this.applyPageMode()\n      this.updateVisibleItems(false)\n    },\n\n    sizes: {\n      handler () {\n        this.updateVisibleItems(false)\n      },\n      deep: true,\n    },\n  },\n\n  created () {\n    this.$_startIndex = 0\n    this.$_endIndex = 0\n    this.$_views = new Map()\n    this.$_unusedViews = new Map()\n    this.$_scrollDirty = false\n\n    if (this.$isServer) {\n      this.updateVisibleItems(false)\n    }\n  },\n\n  mounted () {\n    this.applyPageMode()\n    this.$nextTick(() => {\n      this.updateVisibleItems(true)\n      this.ready = true\n    })\n  },\n\n  beforeDestroy () {\n    this.removeListeners()\n  },\n\n  methods: {\n    addView (pool, index, item, key, type) {\n      const view = {\n        item,\n        position: 0,\n      }\n      const nonReactive = {\n        id: uid++,\n        index,\n        used: true,\n        key,\n        type,\n      }\n      Object.defineProperty(view, 'nr', {\n        configurable: false,\n        value: nonReactive,\n      })\n      pool.push(view)\n      return view\n    },\n\n    unuseView (view, fake = false) {\n      const unusedViews = this.$_unusedViews\n      const type = view.nr.type\n      let unusedPool = unusedViews.get(type)\n      if (!unusedPool) {\n        unusedPool = []\n        unusedViews.set(type, unusedPool)\n      }\n      unusedPool.push(view)\n      if (!fake) {\n        view.nr.used = false\n        view.position = -9999\n        this.$_views.delete(view.nr.key)\n      }\n    },\n\n    handleResize () {\n      this.$emit('resize')\n      if (this.ready) this.updateVisibleItems(false)\n    },\n\n    handleScroll (event) {\n      if (!this.$_scrollDirty) {\n        this.$_scrollDirty = true\n        requestAnimationFrame(() => {\n          this.$_scrollDirty = false\n          const { continuous } = this.updateVisibleItems(false)\n\n          // It seems sometimes chrome doesn't fire scroll event :/\n          // When non continous scrolling is ending, we force a refresh\n          if (!continuous) {\n            clearTimeout(this.$_refreshTimout)\n            this.$_refreshTimout = setTimeout(this.handleScroll, 100)\n          }\n        })\n      }\n    },\n\n    handleVisibilityChange (isVisible, entry) {\n      if (this.ready) {\n        if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {\n          this.$emit('visible')\n          requestAnimationFrame(() => {\n            this.updateVisibleItems(false)\n          })\n        } else {\n          this.$emit('hidden')\n        }\n      }\n    },\n\n    updateVisibleItems (checkItem) {\n      const itemSize = this.itemSize\n      const typeField = this.typeField\n      const keyField = this.simpleArray ? null : this.keyField\n      const items = this.items\n      const count = items.length\n      const sizes = this.sizes\n      const views = this.$_views\n      const unusedViews = this.$_unusedViews\n      const pool = this.pool\n      let startIndex, endIndex\n      let totalSize\n\n      if (!count) {\n        startIndex = endIndex = totalSize = 0\n      } else if (this.$isServer) {\n        startIndex = 0\n        endIndex = this.prerender\n        totalSize = null\n      } else {\n        const scroll = this.getScroll()\n        const buffer = this.buffer\n        scroll.start -= buffer\n        scroll.end += buffer\n\n        // Variable size mode\n        if (itemSize === null) {\n          let h\n          let a = 0\n          let b = count - 1\n          let i = ~~(count / 2)\n          let oldI\n\n          // Searching for startIndex\n          do {\n            oldI = i\n            h = sizes[i].accumulator\n            if (h < scroll.start) {\n              a = i\n            } else if (i < count - 1 && sizes[i + 1].accumulator > scroll.start) {\n              b = i\n            }\n            i = ~~((a + b) / 2)\n          } while (i !== oldI)\n          i < 0 && (i = 0)\n          startIndex = i\n\n          // For container style\n          totalSize = sizes[count - 1].accumulator\n\n          // Searching for endIndex\n          for (endIndex = i; endIndex < count && sizes[endIndex].accumulator < scroll.end; endIndex++);\n          if (endIndex === -1) {\n            endIndex = items.length - 1\n          } else {\n            endIndex++\n            // Bounds\n            endIndex > count && (endIndex = count)\n          }\n        } else {\n          // Fixed size mode\n          startIndex = ~~(scroll.start / itemSize)\n          endIndex = Math.ceil(scroll.end / itemSize)\n\n          // Bounds\n          startIndex < 0 && (startIndex = 0)\n          endIndex > count && (endIndex = count)\n\n          totalSize = count * itemSize\n        }\n      }\n\n      if (endIndex - startIndex > config.itemsLimit) {\n        this.itemsLimitError()\n      }\n\n      this.totalSize = totalSize\n\n      let view\n\n      const continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex\n      let unusedIndex\n\n      if (this.$_continuous !== continuous) {\n        if (continuous) {\n          views.clear()\n          unusedViews.clear()\n          for (let i = 0, l = pool.length; i < l; i++) {\n            view = pool[i]\n            this.unuseView(view)\n          }\n        }\n        this.$_continuous = continuous\n      } else if (continuous) {\n        for (let i = 0, l = pool.length; i < l; i++) {\n          view = pool[i]\n          if (view.nr.used) {\n            // Update view item index\n            if (checkItem) {\n              view.nr.index = items.findIndex(\n                item => keyField ? item[keyField] === view.item[keyField] : item === view.item,\n              )\n            }\n\n            // Check if index is still in visible range\n            if (\n              view.nr.index === -1 ||\n              view.nr.index < startIndex ||\n              view.nr.index >= endIndex\n            ) {\n              this.unuseView(view)\n            }\n          }\n        }\n      }\n\n      if (!continuous) {\n        unusedIndex = new Map()\n      }\n\n      let item, type, unusedPool\n      let v\n      for (let i = startIndex; i < endIndex; i++) {\n        item = items[i]\n        const key = keyField ? item[keyField] : item\n        if (key == null) {\n          throw new Error(`Key is ${key} on item (keyField is '${keyField}')`)\n        }\n        view = views.get(key)\n\n        if (!itemSize && !sizes[i].size) {\n          if (view) this.unuseView(view)\n          continue\n        }\n\n        // No view assigned to item\n        if (!view) {\n          type = item[typeField]\n\n          if (continuous) {\n            unusedPool = unusedViews.get(type)\n            // Reuse existing view\n            if (unusedPool && unusedPool.length) {\n              view = unusedPool.pop()\n              view.item = item\n              view.nr.used = true\n              view.nr.index = i\n              view.nr.key = key\n              view.nr.type = type\n            } else {\n              view = this.addView(pool, i, item, key, type)\n            }\n          } else {\n            unusedPool = unusedViews.get(type)\n            v = unusedIndex.get(type) || 0\n            // Use existing view\n            // We don't care if they are already used\n            // because we are not in continous scrolling\n            if (unusedPool && v < unusedPool.length) {\n              view = unusedPool[v]\n              view.item = item\n              view.nr.used = true\n              view.nr.index = i\n              view.nr.key = key\n              view.nr.type = type\n              unusedIndex.set(type, v + 1)\n            } else {\n              view = this.addView(pool, i, item, key, type)\n              this.unuseView(view, true)\n            }\n            v++\n          }\n          views.set(key, view)\n        } else {\n          view.nr.used = true\n          view.item = item\n        }\n\n        // Update position\n        if (itemSize === null) {\n          view.position = sizes[i - 1].accumulator\n        } else {\n          view.position = i * itemSize\n        }\n      }\n\n      this.$_startIndex = startIndex\n      this.$_endIndex = endIndex\n\n      if (this.emitUpdate) this.$emit('update', startIndex, endIndex)\n\n      return {\n        continuous,\n      }\n    },\n\n    getListenerTarget () {\n      let target = ScrollParent(this.$el)\n      // Fix global scroll target for Chrome and Safari\n      if (window.document && (target === window.document.documentElement || target === window.document.body)) {\n        target = window\n      }\n      return target\n    },\n\n    getScroll () {\n      const { $el: el, direction } = this\n      const isVertical = direction === 'vertical'\n      let scrollState\n\n      if (this.pageMode) {\n        const bounds = el.getBoundingClientRect()\n        const boundsSize = isVertical ? bounds.height : bounds.width\n        let start = -(isVertical ? bounds.top : bounds.left)\n        let size = isVertical ? window.innerHeight : window.innerWidth\n        if (start < 0) {\n          size += start\n          start = 0\n        }\n        if (start + size > boundsSize) {\n          size = boundsSize - start\n        }\n        scrollState = {\n          start,\n          end: start + size,\n        }\n      } else if (isVertical) {\n        scrollState = {\n          start: el.scrollTop,\n          end: el.scrollTop + el.clientHeight,\n        }\n      } else {\n        scrollState = {\n          start: el.scrollLeft,\n          end: el.scrollLeft + el.clientWidth,\n        }\n      }\n\n      return scrollState\n    },\n\n    applyPageMode () {\n      if (this.pageMode) {\n        this.addListeners()\n      } else {\n        this.removeListeners()\n      }\n    },\n\n    addListeners () {\n      this.listenerTarget = this.getListenerTarget()\n      this.listenerTarget.addEventListener('scroll', this.handleScroll, supportsPassive ? {\n        passive: true,\n      } : false)\n      this.listenerTarget.addEventListener('resize', this.handleResize)\n    },\n\n    removeListeners () {\n      if (!this.listenerTarget) {\n        return\n      }\n\n      this.listenerTarget.removeEventListener('scroll', this.handleScroll)\n      this.listenerTarget.removeEventListener('resize', this.handleResize)\n\n      this.listenerTarget = null\n    },\n\n    scrollToItem (index) {\n      let scroll\n      if (this.itemSize === null) {\n        scroll = index > 0 ? this.sizes[index - 1].accumulator : 0\n      } else {\n        scroll = index * this.itemSize\n      }\n      this.scrollToPosition(scroll)\n    },\n\n    scrollToPosition (position) {\n      if (this.direction === 'vertical') {\n        this.$el.scrollTop = position\n      } else {\n        this.$el.scrollLeft = position\n      }\n    },\n\n    itemsLimitError () {\n      setTimeout(() => {\n        console.log('It seems the scroller element isn\\'t scrolling, so it tries to render all the items at once.', 'Scroller:', this.$el)\n        console.log('Make sure the scroller has a fixed height (or width) and \\'overflow-y\\' (or \\'overflow-x\\') set to \\'auto\\' so it can scroll correctly and only render the items visible in the scroll viewport.')\n      })\n      throw new Error('Rendered items limit reached')\n    },\n  },\n}\n</script>\n\n<style>\n.vue-recycle-scroller {\n  position: relative;\n}\n\n.vue-recycle-scroller.direction-vertical:not(.page-mode) {\n  overflow-y: auto;\n}\n\n.vue-recycle-scroller.direction-horizontal:not(.page-mode) {\n  overflow-x: auto;\n}\n\n.vue-recycle-scroller.direction-horizontal {\n  display: flex;\n}\n\n.vue-recycle-scroller__slot {\n  flex: auto 0 0;\n}\n\n.vue-recycle-scroller__item-wrapper {\n  flex: 1;\n  box-sizing: border-box;\n  overflow: hidden;\n  position: relative;\n}\n\n.vue-recycle-scroller.ready .vue-recycle-scroller__item-view {\n  position: absolute;\n  top: 0;\n  left: 0;\n  will-change: transform;\n}\n\n.vue-recycle-scroller.direction-vertical .vue-recycle-scroller__item-wrapper {\n  width: 100%;\n}\n\n.vue-recycle-scroller.direction-horizontal .vue-recycle-scroller__item-wrapper {\n  height: 100%;\n}\n\n.vue-recycle-scroller.ready.direction-vertical .vue-recycle-scroller__item-view {\n  width: 100%;\n}\n\n.vue-recycle-scroller.ready.direction-horizontal .vue-recycle-scroller__item-view {\n  height: 100%;\n}\n</style>\n"]}, media: undefined });

    };
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__ = normalizeComponent(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      false,
      createInjector,
      undefined,
      undefined
    );

  var MAX_SCROLL = 9999999999;
  var script$1 = {
    name: 'DynamicScroller',
    components: {
      RecycleScroller: __vue_component__
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
          el.scrollTop = MAX_SCROLL; // Item sizes are computed

          var cb = function cb() {
            el.scrollTop = MAX_SCROLL;
            requestAnimationFrame(function () {
              el.scrollTop = MAX_SCROLL;

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

  /* script */
  const __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(
      "RecycleScroller",
      _vm._g(
        _vm._b(
          {
            ref: "scroller",
            attrs: {
              items: _vm.itemsWithSize,
              "min-item-size": _vm.minItemSize,
              direction: _vm.direction,
              "key-field": "id"
            },
            on: { resize: _vm.onScrollerResize, visible: _vm.onScrollerVisible },
            scopedSlots: _vm._u(
              [
                {
                  key: "default",
                  fn: function(ref) {
                    var itemWithSize = ref.item;
                    var index = ref.index;
                    var active = ref.active;
                    return [
                      _vm._t("default", null, null, {
                        item: itemWithSize.item,
                        index: index,
                        active: active,
                        itemWithSize: itemWithSize
                      })
                    ]
                  }
                }
              ],
              null,
              true
            )
          },
          "RecycleScroller",
          _vm.$attrs,
          false
        ),
        _vm.listeners
      ),
      [
        _vm._v(" "),
        _c("template", { slot: "before" }, [_vm._t("before")], 2),
        _vm._v(" "),
        _c("template", { slot: "after" }, [_vm._t("after")], 2)
      ],
      2
    )
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

    /* style */
    const __vue_inject_styles__$1 = undefined;
    /* scoped */
    const __vue_scope_id__$1 = undefined;
    /* module identifier */
    const __vue_module_identifier__$1 = undefined;
    /* functional template */
    const __vue_is_functional_template__$1 = false;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$1 = normalizeComponent(
      { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
      __vue_inject_styles__$1,
      __vue_script__$1,
      __vue_scope_id__$1,
      __vue_is_functional_template__$1,
      __vue_module_identifier__$1,
      false,
      undefined,
      undefined,
      undefined
    );

  var script$2 = {
    name: 'DynamicScrollerItem',
    inject: ['vscrollData', 'vscrollParent', 'vscrollResizeObserver'],
    props: {
      item: {
        required: true
      },
      watchData: {
        type: Boolean,
        default: false
      },
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
      }
    },
    watch: {
      watchData: 'updateWatchData',
      id: function id() {
        if (!this.size) {
          this.onDataUpdate();
        }
      },
      active: function active(value) {
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
    beforeDestroy: function beforeDestroy() {
      this.vscrollParent.$off('vscroll:update', this.onVscrollUpdate);
      this.vscrollParent.$off('vscroll:update-size', this.onVscrollUpdateSize);
      this.unobserveSize();
    },
    methods: {
      updateSize: function updateSize() {
        if (this.active && this.vscrollData.active) {
          if (this.$_pendingSizeUpdate !== this.id) {
            this.$_pendingSizeUpdate = this.id;
            this.$_forceNextVScrollUpdate = null;
            this.$_pendingVScrollUpdate = null;

            if (this.active && this.vscrollData.active) {
              this.computeSize(this.id);
            }
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

        if (!this.active && force) {
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
        this.vscrollResizeObserver.observe(this.$el.parentNode);
        this.$el.parentNode.addEventListener('resize', this.onResize);
      },
      unobserveSize: function unobserveSize() {
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

  /* script */
  const __vue_script__$2 = script$2;

  /* template */

    /* style */
    const __vue_inject_styles__$2 = undefined;
    /* scoped */
    const __vue_scope_id__$2 = undefined;
    /* module identifier */
    const __vue_module_identifier__$2 = undefined;
    /* functional template */
    const __vue_is_functional_template__$2 = undefined;
    /* style inject */
    
    /* style inject SSR */
    
    /* style inject shadow dom */
    

    
    const __vue_component__$2 = normalizeComponent(
      {},
      __vue_inject_styles__$2,
      __vue_script__$2,
      __vue_scope_id__$2,
      __vue_is_functional_template__$2,
      __vue_module_identifier__$2,
      false,
      undefined,
      undefined,
      undefined
    );

  function IdState () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$idProp = _ref.idProp,
        idProp = _ref$idProp === void 0 ? function (vm) {
      return vm.item.id;
    } : _ref$idProp;

    var store = {};
    var vm = new Vue({
      data: function data() {
        return {
          store: store
        };
      }
    }); // @vue/component

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
            vm.$set(store, id, data);
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
    Vue.component("".concat(prefix, "recycle-scroller"), __vue_component__);
    Vue.component("".concat(prefix, "RecycleScroller"), __vue_component__);
    Vue.component("".concat(prefix, "dynamic-scroller"), __vue_component__$1);
    Vue.component("".concat(prefix, "DynamicScroller"), __vue_component__$1);
    Vue.component("".concat(prefix, "dynamic-scroller-item"), __vue_component__$2);
    Vue.component("".concat(prefix, "DynamicScrollerItem"), __vue_component__$2);
  }

  var plugin$2 = {
    // eslint-disable-next-line no-undef
    version: "1.0.1",
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

  exports.DynamicScroller = __vue_component__$1;
  exports.DynamicScrollerItem = __vue_component__$2;
  exports.IdState = IdState;
  exports.RecycleScroller = __vue_component__;
  exports.default = plugin$2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
