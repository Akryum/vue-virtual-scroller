(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global['vue-virtual-scroller'] = {})));
}(this, (function (exports) { 'use strict';

  var config = {
    itemsLimit: 1000
  };

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

  var ResizeObserver = { render: function render() {
  		var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "resize-observer", attrs: { "tabindex": "-1" } });
  	}, staticRenderFns: [], _scopeId: 'data-v-b329ee4c',
  	name: 'resize-observer',

  	methods: {
  		notify: function notify() {
  			this.$emit('notify');
  		},
  		addResizeHandlers: function addResizeHandlers() {
  			this._resizeObject.contentDocument.defaultView.addEventListener('resize', this.notify);
  			if (this._w !== this.$el.offsetWidth || this._h !== this.$el.offsetHeight) {
  				this.notify();
  			}
  		},
  		removeResizeHandlers: function removeResizeHandlers() {
  			if (this._resizeObject && this._resizeObject.onload) {
  				if (!isIE && this._resizeObject.contentDocument) {
  					this._resizeObject.contentDocument.defaultView.removeEventListener('resize', this.notify);
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
  		object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
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
  	Vue.component('resize-observer', ResizeObserver);
  	/* -- Add more components here -- */
  }

  /* -- Plugin definition & Auto-install -- */
  /* You shouldn't have to modify the code below */

  // Plugin
  var plugin = {
  	// eslint-disable-next-line no-undef
  	version: "0.4.4",
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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };





  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();









































  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  function processOptions(value) {
  	var options = void 0;
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
  	var timeout = void 0;
  	var lastState = void 0;
  	var currentArgs = void 0;
  	var throttled = function throttled(state) {
  		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
  			args[_key - 1] = arguments[_key];
  		}

  		currentArgs = args;
  		if (timeout && state === lastState) return;
  		lastState = state;
  		clearTimeout(timeout);
  		timeout = setTimeout(function () {
  			callback.apply(undefined, [state].concat(toConsumableArray(currentArgs)));
  			timeout = 0;
  		}, delay);
  	};
  	throttled._clear = function () {
  		clearTimeout(timeout);
  	};
  	return throttled;
  }

  function deepEqual(val1, val2) {
  	if (val1 === val2) return true;
  	if ((typeof val1 === 'undefined' ? 'undefined' : _typeof(val1)) === 'object') {
  		for (var key in val1) {
  			if (!deepEqual(val1[key], val2[key])) {
  				return false;
  			}
  		}
  		return true;
  	}
  	return false;
  }

  var VisibilityState = function () {
  	function VisibilityState(el, options, vnode) {
  		classCallCheck(this, VisibilityState);

  		this.el = el;
  		this.observer = null;
  		this.frozen = false;
  		this.createObserver(options, vnode);
  	}

  	createClass(VisibilityState, [{
  		key: 'createObserver',
  		value: function createObserver(options, vnode) {
  			var _this = this;

  			if (this.observer) {
  				this.destroyObserver();
  			}

  			if (this.frozen) return;

  			this.options = processOptions(options);

  			this.callback = this.options.callback;
  			// Throttle
  			if (this.callback && this.options.throttle) {
  				this.callback = throttle(this.callback, this.options.throttle);
  			}

  			this.oldResult = undefined;

  			this.observer = new IntersectionObserver(function (entries) {
  				var entry = entries[0];
  				if (_this.callback) {
  					// Use isIntersecting if possible because browsers can report isIntersecting as true, but intersectionRatio as 0, when something very slowly enters the viewport.
  					var result = entry.isIntersecting && entry.intersectionRatio >= _this.threshold;
  					if (result === _this.oldResult) return;
  					_this.oldResult = result;
  					_this.callback(result, entry);
  					if (result && _this.options.once) {
  						_this.frozen = true;
  						_this.destroyObserver();
  					}
  				}
  			}, this.options.intersection);

  			// Wait for the element to be in document
  			vnode.context.$nextTick(function () {
  				_this.observer.observe(_this.el);
  			});
  		}
  	}, {
  		key: 'destroyObserver',
  		value: function destroyObserver() {
  			if (this.observer) {
  				this.observer.disconnect();
  				this.observer = null;
  			}

  			// Cancel throttled call
  			if (this.callback && this.callback._clear) {
  				this.callback._clear();
  				this.callback = null;
  			}
  		}
  	}, {
  		key: 'threshold',
  		get: function get$$1() {
  			return this.options.intersection && this.options.intersection.threshold || 0;
  		}
  	}]);
  	return VisibilityState;
  }();

  function bind(el, _ref, vnode) {
  	var value = _ref.value;

  	if (typeof IntersectionObserver === 'undefined') {
  		console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/w3c/IntersectionObserver/tree/master/polyfill');
  	} else {
  		var state = new VisibilityState(el, value, vnode);
  		el._vue_visibilityState = state;
  	}
  }

  function update(el, _ref2, vnode) {
  	var value = _ref2.value,
  	    oldValue = _ref2.oldValue;

  	if (deepEqual(value, oldValue)) return;
  	var state = el._vue_visibilityState;
  	if (state) {
  		state.createObserver(value, vnode);
  	} else {
  		bind(el, { value: value }, vnode);
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

  // Install the components
  function install$1(Vue) {
  	Vue.directive('observe-visibility', ObserveVisibility);
  	/* -- Add more components here -- */
  }

  /* -- Plugin definition & Auto-install -- */
  /* You shouldn't have to modify the code below */

  // Plugin
  var plugin$1 = {
  	// eslint-disable-next-line no-undef
  	version: "0.4.3",
  	install: install$1
  };

  // Auto-install
  var GlobalVue$1 = null;
  if (typeof window !== 'undefined') {
  	GlobalVue$1 = window.Vue;
  } else if (typeof global !== 'undefined') {
  	GlobalVue$1 = global.Vue;
  }
  if (GlobalVue$1) {
  	GlobalVue$1.use(plugin$1);
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var scrollparent = createCommonjsModule(function (module) {
  (function (root, factory) {
    if (typeof undefined === "function" && undefined.amd) {
      undefined([], factory);
    } else if (module.exports) {
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

  // @vue/component
  var Scroller = {
    components: {
      ResizeObserver: ResizeObserver
    },

    directives: {
      ObserveVisibility: ObserveVisibility
    },

    props: {
      items: {
        type: Array,
        required: true
      },
      itemHeight: {
        type: [Number, String],
        default: null
      },
      minItemHeight: {
        type: [Number, String],
        default: null
      },
      heightField: {
        type: String,
        default: 'height'
      },
      typeField: {
        type: String,
        default: 'type'
      },
      buffer: {
        type: [Number, String],
        default: 200
      },
      pageMode: {
        type: Boolean,
        default: false
      },
      prerender: {
        type: [Number, String],
        default: 0
      },
      emitUpdate: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      cssClass: function cssClass() {
        return {
          'page-mode': this.pageMode
        };
      },
      heights: function heights() {
        if (this.itemHeight === null) {
          var heights = {
            '-1': { accumulator: 0 }
          };
          var items = this.items;
          var field = this.heightField;
          var minItemHeight = this.minItemHeight;
          var accumulator = 0;
          var current = void 0;
          for (var i = 0, l = items.length; i < l; i++) {
            current = items[i][field] || minItemHeight;
            accumulator += current;
            heights[i] = { accumulator: accumulator, height: current };
          }
          return heights;
        }
      }
    },

    beforeDestroy: function beforeDestroy() {
      this.removeListeners();
    },


    methods: {
      getListenerTarget: function getListenerTarget() {
        var target = scrollparent(this.$el);
        // Fix global scroll target for Chrome and Safari
        if (target === window.document.documentElement || target === window.document.body) {
          target = window;
        }
        return target;
      },
      getScroll: function getScroll() {
        var el = this.$el;
        var scrollState = void 0;

        if (this.pageMode) {
          var rect = el.getBoundingClientRect();
          var top = -rect.top;
          var height = window.innerHeight;
          if (top < 0) {
            height += top;
            top = 0;
          }
          if (top + height > rect.height) {
            height = rect.height - top;
          }
          scrollState = {
            top: top,
            bottom: top + height
          };
        } else {
          scrollState = {
            top: el.scrollTop,
            bottom: el.scrollTop + el.clientHeight
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
        var scrollTop = void 0;
        if (this.itemHeight === null) {
          scrollTop = index > 0 ? this.heights[index - 1].accumulator : 0;
        } else {
          scrollTop = index * this.itemHeight;
        }
        this.scrollToPosition(scrollTop);
      },
      scrollToPosition: function scrollToPosition(position) {
        this.$el.scrollTop = position;
      },
      itemsLimitError: function itemsLimitError() {
        var _this = this;

        setTimeout(function () {
          console.log('It seems the scroller element isn\'t scrolling, so it tries to render all the items at once.', 'Scroller:', _this.$el);
          console.log('Make sure the scroller has a fixed height and \'overflow-y\' set to \'auto\' so it can scroll correctly and only render the items visible in the scroll viewport.');
        });
        throw new Error('Rendered items limit reached');
      }
    }
  };

  //

  var script = {
    name: 'VirtualScroller',

    mixins: [Scroller],

    props: {
      renderers: {
        type: Object,
        default: null
      },
      keyField: {
        type: String,
        default: 'id'
      },
      mainTag: {
        type: String,
        default: 'div'
      },
      containerTag: {
        type: String,
        default: 'div'
      },
      containerClass: {
        type: [String, Array, Object],
        default: null
      },
      contentTag: {
        type: String,
        default: 'div'
      },
      contentClass: {
        type: [String, Array, Object],
        default: null
      },
      poolSize: {
        type: [Number, String],
        default: 2000
      },
      delayPreviousItems: {
        type: Boolean,
        default: false
      }
    },

    data: function data() {
      return {
        visibleItems: [],
        itemContainerStyle: null,
        itemsStyle: null,
        keysEnabled: true
      };
    },


    watch: {
      items: {
        handler: function handler() {
          this.updateVisibleItems(true);
        },

        deep: true
      },
      pageMode: function pageMode() {
        this.applyPageMode();
        this.updateVisibleItems(true);
      },

      itemHeight: 'setDirty'
    },

    created: function created() {
      this.$_ready = false;
      this.$_startIndex = 0;
      this.$_oldScrollTop = null;
      this.$_oldScrollBottom = null;
      this.$_offsetTop = 0;
      this.$_height = 0;
      this.$_scrollDirty = false;
      this.$_updateDirty = false;

      var prerender = parseInt(this.prerender);
      if (prerender > 0) {
        this.visibleItems = this.items.slice(0, prerender);
        this.$_length = this.visibleItems.length;
        this.$_endIndex = this.$_length - 1;
        this.$_skip = true;
      } else {
        this.$_endIndex = 0;
        this.$_length = 0;
        this.$_skip = false;
      }
    },
    mounted: function mounted() {
      var _this = this;

      this.applyPageMode();
      this.$nextTick(function () {
        _this.updateVisibleItems(true);
        _this.$_ready = true;
      });
    },


    methods: {
      updateVisibleItems: function updateVisibleItems() {
        var _this2 = this;

        var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (!this.$_updateDirty) {
          this.$_updateDirty = true;
          this.$nextTick(function () {
            _this2.$_updateDirty = false;

            var l = _this2.items.length;
            var scroll = _this2.getScroll();
            var items = _this2.items;
            var itemHeight = _this2.itemHeight;
            var containerHeight = void 0,
                offsetTop = void 0;
            if (scroll) {
              var startIndex = -1;
              var endIndex = -1;

              var buffer = parseInt(_this2.buffer);
              var poolSize = parseInt(_this2.poolSize);
              var scrollTop = ~~(scroll.top / poolSize) * poolSize - buffer;
              var scrollBottom = Math.ceil(scroll.bottom / poolSize) * poolSize + buffer;

              if (!force && (scrollTop === _this2.$_oldScrollTop && scrollBottom === _this2.$_oldScrollBottom || _this2.$_skip)) {
                _this2.$_skip = false;
                return;
              } else {
                _this2.$_oldScrollTop = scrollTop;
                _this2.$_oldScrollBottom = scrollBottom;
              }

              // Variable height mode
              if (itemHeight === null) {
                var heights = _this2.heights;
                var h = void 0;
                var a = 0;
                var b = l - 1;
                var i = ~~(l / 2);
                var oldI = void 0;

                // Searching for startIndex
                do {
                  oldI = i;
                  h = heights[i].accumulator;
                  if (h < scrollTop) {
                    a = i;
                  } else if (i < l - 1 && heights[i + 1].accumulator > scrollTop) {
                    b = i;
                  }
                  i = ~~((a + b) / 2);
                } while (i !== oldI);
                i < 0 && (i = 0);
                startIndex = i;

                // For containers style
                offsetTop = i > 0 ? heights[i - 1].accumulator : 0;
                containerHeight = heights[l - 1].accumulator;

                // Searching for endIndex
                for (endIndex = i; endIndex < l && heights[endIndex].accumulator < scrollBottom; endIndex++) {}
                if (endIndex === -1) {
                  endIndex = items.length - 1;
                } else {
                  endIndex++;
                  // Bounds
                  endIndex > l && (endIndex = l);
                }
              } else {
                // Fixed height mode
                startIndex = ~~(scrollTop / itemHeight);
                endIndex = Math.ceil(scrollBottom / itemHeight);

                // Bounds
                startIndex < 0 && (startIndex = 0);
                endIndex > l && (endIndex = l);

                offsetTop = startIndex * itemHeight;
                containerHeight = l * itemHeight;
              }

              if (endIndex - startIndex > config.itemsLimit) {
                _this2.itemsLimitError();
              }

              if (force || _this2.$_startIndex !== startIndex || _this2.$_endIndex !== endIndex || _this2.$_offsetTop !== offsetTop || _this2.$_height !== containerHeight || _this2.$_length !== l) {
                _this2.keysEnabled = !(startIndex > _this2.$_endIndex || endIndex < _this2.$_startIndex);

                _this2.itemContainerStyle = {
                  height: containerHeight + 'px'
                };
                _this2.itemsStyle = {
                  marginTop: offsetTop + 'px'
                };

                if (_this2.delayPreviousItems) {
                  // Add next items
                  _this2.visibleItems = items.slice(_this2.$_startIndex, endIndex);
                  // Remove previous items
                  _this2.$nextTick(function () {
                    _this2.visibleItems = items.slice(startIndex, endIndex);
                  });
                } else {
                  _this2.visibleItems = items.slice(startIndex, endIndex);
                }

                _this2.emitUpdate && _this2.$emit('update', startIndex, endIndex);

                _this2.$_startIndex = startIndex;
                _this2.$_endIndex = endIndex;
                _this2.$_length = l;
                _this2.$_offsetTop = offsetTop;
                _this2.$_height = containerHeight;
              }
            }
          });
        }
      },
      setDirty: function setDirty() {
        this.$_oldScrollTop = null;
        this.$_oldScrollBottom = null;
      },
      handleScroll: function handleScroll() {
        var _this3 = this;

        if (!this.$_scrollDirty) {
          this.$_scrollDirty = true;
          requestAnimationFrame(function () {
            _this3.$_scrollDirty = false;
            _this3.updateVisibleItems();
          });
        }
      },
      handleResize: function handleResize() {
        this.$emit('resize');
        this.$_ready && this.updateVisibleItems();
      },
      handleVisibilityChange: function handleVisibilityChange(isVisible, entry) {
        var _this4 = this;

        if (this.$_ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {
          this.$emit('visible');
          this.$nextTick(function () {
            _this4.updateVisibleItems();
          });
        }
      }
    }
  };

  /* script */
  var __vue_script__ = script;

  /* template */
  var __vue_render__ = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c(_vm.mainTag, {
      directives: [{
        name: "observe-visibility",
        rawName: "v-observe-visibility",
        value: _vm.handleVisibilityChange,
        expression: "handleVisibilityChange"
      }],
      tag: "component",
      staticClass: "virtual-scroller",
      class: _vm.cssClass,
      on: {
        "&scroll": function scroll($event) {
          return _vm.handleScroll($event);
        }
      }
    }, [_vm._t("before-container"), _vm._v(" "), _c(_vm.containerTag, {
      ref: "itemContainer",
      tag: "component",
      staticClass: "item-container",
      class: _vm.containerClass,
      style: _vm.itemContainerStyle
    }, [_vm._t("before-content"), _vm._v(" "), _c(_vm.contentTag, {
      ref: "items",
      tag: "component",
      staticClass: "items",
      class: _vm.contentClass,
      style: _vm.itemsStyle
    }, [_vm.renderers ? _vm._l(_vm.visibleItems, function (item, index) {
      return _c(_vm.renderers[item[_vm.typeField]], {
        key: _vm.keysEnabled && item[_vm.keyField] || undefined,
        tag: "component",
        staticClass: "item",
        attrs: {
          item: item,
          "item-index": _vm.$_startIndex + index
        }
      });
    }) : [_vm._l(_vm.visibleItems, function (item, index) {
      return _vm._t("default", null, {
        item: item,
        itemIndex: _vm.$_startIndex + index,
        itemKey: _vm.keysEnabled && item[_vm.keyField] || undefined
      });
    })]], 2), _vm._v(" "), _vm._t("after-content")], 2), _vm._v(" "), _vm._t("after-container"), _vm._v(" "), _c("resize-observer", { on: { notify: _vm.handleResize } })], 2);
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

  /* style */
  var __vue_inject_styles__ = function __vue_inject_styles__(inject) {
    if (!inject) return;
    inject("data-v-3eef485a_0", { source: "\n.virtual-scroller[data-v-3eef485a]:not(.page-mode) {\n  overflow-y: auto;\n}\n.item-container[data-v-3eef485a] {\n  box-sizing: border-box;\n  width: 100%;\n  overflow: hidden;\n}\n.items[data-v-3eef485a] {\n  width: 100%;\n}\n", map: { "version": 3, "sources": ["/home/akryum/Projects/vue-virtual-scroller/src/components/VirtualScroller.vue"], "names": [], "mappings": ";AA+TA;EACA,iBAAA;CACA;AAEA;EACA,uBAAA;EACA,YAAA;EACA,iBAAA;CACA;AAEA;EACA,YAAA;CACA", "file": "VirtualScroller.vue", "sourcesContent": ["<template>\n  <component\n    v-observe-visibility=\"handleVisibilityChange\"\n    :is=\"mainTag\"\n    :class=\"cssClass\"\n    class=\"virtual-scroller\"\n    @scroll.passive=\"handleScroll\"\n  >\n    <slot\n      name=\"before-container\"\n    />\n    <component\n      ref=\"itemContainer\"\n      :is=\"containerTag\"\n      :class=\"containerClass\"\n      :style=\"itemContainerStyle\"\n      class=\"item-container\"\n    >\n      <slot\n        name=\"before-content\"\n      />\n      <component\n        ref=\"items\"\n        :is=\"contentTag\"\n        :class=\"contentClass\"\n        :style=\"itemsStyle\"\n        class=\"items\"\n      >\n        <template v-if=\"renderers\">\n          <component\n            v-for=\"(item, index) in visibleItems\"\n            :key=\"keysEnabled && item[keyField] || undefined\"\n            :is=\"renderers[item[typeField]]\"\n            :item=\"item\"\n            :item-index=\"$_startIndex + index\"\n            class=\"item\"\n          />\n        </template>\n        <template v-else>\n          <slot\n            v-for=\"(item, index) in visibleItems\"\n            :item=\"item\"\n            :item-index=\"$_startIndex + index\"\n            :item-key=\"keysEnabled && item[keyField] || undefined\"\n            class=\"item\"\n          />\n        </template>\n      </component>\n      <slot\n        name=\"after-content\"\n      />\n    </component>\n    <slot\n      name=\"after-container\"\n    />\n    <resize-observer @notify=\"handleResize\" />\n  </component>\n</template>\n\n<script>\nimport Scroller from '../mixins/scroller'\nimport config from '../config'\n\nexport default {\n  name: 'VirtualScroller',\n\n  mixins: [\n    Scroller,\n  ],\n\n  props: {\n    renderers: {\n      type: Object,\n      default: null,\n    },\n    keyField: {\n      type: String,\n      default: 'id',\n    },\n    mainTag: {\n      type: String,\n      default: 'div',\n    },\n    containerTag: {\n      type: String,\n      default: 'div',\n    },\n    containerClass: {\n      type: [String, Array, Object],\n      default: null,\n    },\n    contentTag: {\n      type: String,\n      default: 'div',\n    },\n    contentClass: {\n      type: [String, Array, Object],\n      default: null,\n    },\n    poolSize: {\n      type: [Number, String],\n      default: 2000,\n    },\n    delayPreviousItems: {\n      type: Boolean,\n      default: false,\n    },\n  },\n\n  data () {\n    return {\n      visibleItems: [],\n      itemContainerStyle: null,\n      itemsStyle: null,\n      keysEnabled: true,\n    }\n  },\n\n  watch: {\n    items: {\n      handler () {\n        this.updateVisibleItems(true)\n      },\n      deep: true,\n    },\n    pageMode () {\n      this.applyPageMode()\n      this.updateVisibleItems(true)\n    },\n    itemHeight: 'setDirty',\n  },\n\n  created () {\n    this.$_ready = false\n    this.$_startIndex = 0\n    this.$_oldScrollTop = null\n    this.$_oldScrollBottom = null\n    this.$_offsetTop = 0\n    this.$_height = 0\n    this.$_scrollDirty = false\n    this.$_updateDirty = false\n\n    const prerender = parseInt(this.prerender)\n    if (prerender > 0) {\n      this.visibleItems = this.items.slice(0, prerender)\n      this.$_length = this.visibleItems.length\n      this.$_endIndex = this.$_length - 1\n      this.$_skip = true\n    } else {\n      this.$_endIndex = 0\n      this.$_length = 0\n      this.$_skip = false\n    }\n  },\n\n  mounted () {\n    this.applyPageMode()\n    this.$nextTick(() => {\n      this.updateVisibleItems(true)\n      this.$_ready = true\n    })\n  },\n\n  methods: {\n    updateVisibleItems (force = false) {\n      if (!this.$_updateDirty) {\n        this.$_updateDirty = true\n        this.$nextTick(() => {\n          this.$_updateDirty = false\n\n          const l = this.items.length\n          const scroll = this.getScroll()\n          const items = this.items\n          const itemHeight = this.itemHeight\n          let containerHeight, offsetTop\n          if (scroll) {\n            let startIndex = -1\n            let endIndex = -1\n\n            const buffer = parseInt(this.buffer)\n            const poolSize = parseInt(this.poolSize)\n            const scrollTop = ~~(scroll.top / poolSize) * poolSize - buffer\n            const scrollBottom = Math.ceil(scroll.bottom / poolSize) * poolSize + buffer\n\n            if (!force && ((scrollTop === this.$_oldScrollTop && scrollBottom === this.$_oldScrollBottom) || this.$_skip)) {\n              this.$_skip = false\n              return\n            } else {\n              this.$_oldScrollTop = scrollTop\n              this.$_oldScrollBottom = scrollBottom\n            }\n\n            // Variable height mode\n            if (itemHeight === null) {\n              const heights = this.heights\n              let h\n              let a = 0\n              let b = l - 1\n              let i = ~~(l / 2)\n              let oldI\n\n              // Searching for startIndex\n              do {\n                oldI = i\n                h = heights[i].accumulator\n                if (h < scrollTop) {\n                  a = i\n                } else if (i < l - 1 && heights[i + 1].accumulator > scrollTop) {\n                  b = i\n                }\n                i = ~~((a + b) / 2)\n              } while (i !== oldI)\n              i < 0 && (i = 0)\n              startIndex = i\n\n              // For containers style\n              offsetTop = i > 0 ? heights[i - 1].accumulator : 0\n              containerHeight = heights[l - 1].accumulator\n\n              // Searching for endIndex\n              for (endIndex = i; endIndex < l && heights[endIndex].accumulator < scrollBottom; endIndex++);\n              if (endIndex === -1) {\n                endIndex = items.length - 1\n              } else {\n                endIndex++\n                // Bounds\n                endIndex > l && (endIndex = l)\n              }\n            } else {\n              // Fixed height mode\n              startIndex = ~~(scrollTop / itemHeight)\n              endIndex = Math.ceil(scrollBottom / itemHeight)\n\n              // Bounds\n              startIndex < 0 && (startIndex = 0)\n              endIndex > l && (endIndex = l)\n\n              offsetTop = startIndex * itemHeight\n              containerHeight = l * itemHeight\n            }\n\n            if (endIndex - startIndex > config.itemsLimit) {\n              this.itemsLimitError()\n            }\n\n            if (\n              force ||\n              this.$_startIndex !== startIndex ||\n              this.$_endIndex !== endIndex ||\n              this.$_offsetTop !== offsetTop ||\n              this.$_height !== containerHeight ||\n              this.$_length !== l\n            ) {\n              this.keysEnabled = !(startIndex > this.$_endIndex || endIndex < this.$_startIndex)\n\n              this.itemContainerStyle = {\n                height: containerHeight + 'px',\n              }\n              this.itemsStyle = {\n                marginTop: offsetTop + 'px',\n              }\n\n              if (this.delayPreviousItems) {\n                // Add next items\n                this.visibleItems = items.slice(this.$_startIndex, endIndex)\n                // Remove previous items\n                this.$nextTick(() => {\n                  this.visibleItems = items.slice(startIndex, endIndex)\n                })\n              } else {\n                this.visibleItems = items.slice(startIndex, endIndex)\n              }\n\n              this.emitUpdate && this.$emit('update', startIndex, endIndex)\n\n              this.$_startIndex = startIndex\n              this.$_endIndex = endIndex\n              this.$_length = l\n              this.$_offsetTop = offsetTop\n              this.$_height = containerHeight\n            }\n          }\n        })\n      }\n    },\n\n    setDirty () {\n      this.$_oldScrollTop = null\n      this.$_oldScrollBottom = null\n    },\n\n    handleScroll () {\n      if (!this.$_scrollDirty) {\n        this.$_scrollDirty = true\n        requestAnimationFrame(() => {\n          this.$_scrollDirty = false\n          this.updateVisibleItems()\n        })\n      }\n    },\n\n    handleResize () {\n      this.$emit('resize')\n      this.$_ready && this.updateVisibleItems()\n    },\n\n    handleVisibilityChange (isVisible, entry) {\n      if (this.$_ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {\n        this.$emit('visible')\n        this.$nextTick(() => {\n          this.updateVisibleItems()\n        })\n      }\n    },\n  },\n}\n</script>\n\n<style scoped>\n.virtual-scroller:not(.page-mode) {\n  overflow-y: auto;\n}\n\n.item-container {\n  box-sizing: border-box;\n  width: 100%;\n  overflow: hidden;\n}\n\n.items {\n  width: 100%;\n}\n</style>\n"] }, media: undefined });
  };
  /* scoped */
  var __vue_scope_id__ = "data-v-3eef485a";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(template, style, script$$1, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "/home/akryum/Projects/vue-virtual-scroller/src/components/VirtualScroller.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    {
      var hook = void 0;
      if (style) {
        hook = function hook(context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook !== undefined) {
        if (component.functional) {
          // register for functional component in vue file
          var originalRender = component.render;
          component.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = component.beforeCreate;
          component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }
    }

    return component;
  }
  /* style inject */
  function __vue_create_injector__() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
    var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) el.setAttribute('media', css.media);
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) style.element.removeChild(nodes[index]);
          if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
        }
      }
    };
  }
  /* style inject SSR */

  var VirtualScroller = __vue_normalize__({ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, __vue_create_injector__, undefined);

  //

  var uid = 0;

  var script$1 = {
    name: 'RecycleList',

    mixins: [Scroller],

    props: {
      itemHeight: {
        type: Number,
        default: null
      },
      keyField: {
        type: String,
        default: null
      }
    },

    data: function data() {
      return {
        pool: [],
        totalHeight: 0
      };
    },


    watch: {
      items: function items() {
        this.updateVisibleItems(true);
      },
      pageMode: function pageMode() {
        this.applyPageMode();
        this.updateVisibleItems(false);
      },

      heights: {
        handler: function handler() {
          this.updateVisibleItems(false);
        },

        deep: true
      }
    },

    created: function created() {
      this.$_ready = false;
      this.$_startIndex = 0;
      this.$_endIndex = 0;
      this.$_views = new Map();
      this.$_unusedViews = new Map();
      this.$_scrollDirty = false;

      // TODO prerender
    },
    mounted: function mounted() {
      var _this = this;

      this.applyPageMode();
      this.$nextTick(function () {
        _this.updateVisibleItems(true);
        _this.$_ready = true;
      });
    },


    methods: {
      addView: function addView(pool, index, item, key, type) {
        var view = {
          item: item,
          top: 0
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
          view.top = -9999;
          this.$_views.delete(view.nr.key);
        }
      },
      handleResize: function handleResize() {
        this.$emit('resize');
        if (this.$_ready) this.updateVisibleItems(false);
      },
      handleScroll: function handleScroll(event) {
        var _this2 = this;

        if (!this.$_scrollDirty) {
          this.$_scrollDirty = true;
          requestAnimationFrame(function () {
            _this2.$_scrollDirty = false;

            var _updateVisibleItems = _this2.updateVisibleItems(false),
                continuous = _updateVisibleItems.continuous;

            // It seems sometimes chrome doesn't fire scroll event :/
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

        if (this.$_ready) {
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
        var scroll = this.getScroll();
        var buffer = parseInt(this.buffer);
        scroll.top -= buffer;
        scroll.bottom += buffer;

        var itemHeight = this.itemHeight;
        var typeField = this.typeField;
        var keyField = this.keyField;
        var items = this.items;
        var count = items.length;
        var heights = this.heights;
        var views = this.$_views;
        var unusedViews = this.$_unusedViews;
        var pool = this.pool;
        var startIndex = void 0,
            endIndex = void 0;
        var totalHeight = void 0;

        if (!count) {
          startIndex = endIndex = totalHeight = 0;
        } else {
          // Variable height mode
          if (itemHeight === null) {
            var h = void 0;
            var a = 0;
            var b = count - 1;
            var i = ~~(count / 2);
            var oldI = void 0;

            // Searching for startIndex
            do {
              oldI = i;
              h = heights[i].accumulator;
              if (h < scroll.top) {
                a = i;
              } else if (i < count - 1 && heights[i + 1].accumulator > scroll.top) {
                b = i;
              }
              i = ~~((a + b) / 2);
            } while (i !== oldI);
            i < 0 && (i = 0);
            startIndex = i;

            // For container style
            totalHeight = heights[count - 1].accumulator;

            // Searching for endIndex
            for (endIndex = i; endIndex < count && heights[endIndex].accumulator < scroll.bottom; endIndex++) {}
            if (endIndex === -1) {
              endIndex = items.length - 1;
            } else {
              endIndex++;
              // Bounds
              endIndex > count && (endIndex = count);
            }
          } else {
            // Fixed height mode
            startIndex = ~~(scroll.top / itemHeight);
            endIndex = Math.ceil(scroll.bottom / itemHeight);

            // Bounds
            startIndex < 0 && (startIndex = 0);
            endIndex > count && (endIndex = count);

            totalHeight = count * itemHeight;
          }
        }

        if (endIndex - startIndex > config.itemsLimit) {
          this.itemsLimitError();
        }

        this.totalHeight = totalHeight;

        var view = void 0;

        var continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex;
        var unusedIndex = void 0;

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
              }

              // Check if index is still in visible range
              if (view.nr.index === -1 || view.nr.index < startIndex || view.nr.index > endIndex) {
                this.unuseView(view);
              }
            }
          }
        }

        if (!continuous) {
          unusedIndex = new Map();
        }

        var item = void 0,
            type = void 0,
            unusedPool = void 0;
        var v = void 0;
        for (var _i3 = startIndex; _i3 < endIndex; _i3++) {
          item = items[_i3];
          var key = keyField ? item[keyField] : item;
          view = views.get(key);

          if (!itemHeight && !heights[_i3].height) {
            if (view) this.unuseView(view);
            continue;
          }

          // No view assigned to item
          if (!view) {
            type = item[typeField];

            if (continuous) {
              unusedPool = unusedViews.get(type);
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
              unusedPool = unusedViews.get(type);
              v = unusedIndex.get(type) || 0;
              // Use existing view
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
          }

          // Update position
          if (itemHeight === null) {
            view.top = heights[_i3 - 1].accumulator;
          } else {
            view.top = _i3 * itemHeight;
          }
        }

        this.$_startIndex = startIndex;
        this.$_endIndex = endIndex;

        this.emitUpdate && this.$emit('update', startIndex, endIndex);

        return {
          continuous: continuous
        };
      }
    }
  };

  /* script */
  var __vue_script__$1 = script$1;

  /* template */
  var __vue_render__$1 = function __vue_render__() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", {
      directives: [{
        name: "observe-visibility",
        rawName: "v-observe-visibility",
        value: _vm.handleVisibilityChange,
        expression: "handleVisibilityChange"
      }],
      staticClass: "recycle-list",
      class: _vm.cssClass,
      on: {
        "&scroll": function scroll($event) {
          return _vm.handleScroll($event);
        }
      }
    }, [_vm._t("before-container"), _vm._v(" "), _c("div", {
      ref: "wrapper",
      staticClass: "item-wrapper",
      style: { height: _vm.totalHeight + "px" }
    }, _vm._l(_vm.pool, function (view) {
      return _c("div", {
        key: view.nr.id,
        staticClass: "item-view",
        style: { transform: "translateY(" + view.top + "px)" }
      }, [_vm._t("default", null, {
        item: view.item,
        index: view.nr.index,
        active: view.nr.used
      })], 2);
    })), _vm._v(" "), _vm._t("after-container"), _vm._v(" "), _c("resize-observer", { on: { notify: _vm.handleResize } })], 2);
  };
  var __vue_staticRenderFns__$1 = [];
  __vue_render__$1._withStripped = true;

  /* style */
  var __vue_inject_styles__$1 = function __vue_inject_styles__(inject) {
    if (!inject) return;
    inject("data-v-e814ad22_0", { source: "\n.recycle-list[data-v-e814ad22]:not(.page-mode) {\n  overflow-y: auto;\n}\n.item-wrapper[data-v-e814ad22] {\n  box-sizing: border-box;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n}\n.item-view[data-v-e814ad22] {\n  width: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n  will-change: transform;\n}\n", map: { "version": 3, "sources": ["/home/akryum/Projects/vue-virtual-scroller/src/components/RecycleList.vue"], "names": [], "mappings": ";AAgXA;EACA,iBAAA;CACA;AAEA;EACA,uBAAA;EACA,YAAA;EACA,iBAAA;EACA,mBAAA;CACA;AAEA;EACA,YAAA;EACA,mBAAA;EACA,OAAA;EACA,QAAA;EACA,uBAAA;CACA", "file": "RecycleList.vue", "sourcesContent": ["<template>\n  <div\n    v-observe-visibility=\"handleVisibilityChange\"\n    :class=\"cssClass\"\n    class=\"recycle-list\"\n    @scroll.passive=\"handleScroll\"\n  >\n    <slot\n      name=\"before-container\"\n    />\n\n    <div\n      ref=\"wrapper\"\n      :style=\"{ height: totalHeight + 'px' }\"\n      class=\"item-wrapper\"\n    >\n      <div\n        v-for=\"view of pool\"\n        :key=\"view.nr.id\"\n        :style=\"{ transform: 'translateY(' + view.top + 'px)' }\"\n        class=\"item-view\"\n      >\n        <slot\n          :item=\"view.item\"\n          :index=\"view.nr.index\"\n          :active=\"view.nr.used\"\n        />\n      </div>\n    </div>\n\n    <slot\n      name=\"after-container\"\n    />\n\n    <resize-observer @notify=\"handleResize\" />\n  </div>\n</template>\n\n<script>\nimport Scroller from '../mixins/scroller'\nimport config from '../config'\n\nlet uid = 0\n\nexport default {\n  name: 'RecycleList',\n\n  mixins: [\n    Scroller,\n  ],\n\n  props: {\n    itemHeight: {\n      type: Number,\n      default: null,\n    },\n    keyField: {\n      type: String,\n      default: null,\n    },\n  },\n\n  data () {\n    return {\n      pool: [],\n      totalHeight: 0,\n    }\n  },\n\n  watch: {\n    items () {\n      this.updateVisibleItems(true)\n    },\n    pageMode () {\n      this.applyPageMode()\n      this.updateVisibleItems(false)\n    },\n    heights: {\n      handler () {\n        this.updateVisibleItems(false)\n      },\n      deep: true,\n    },\n  },\n\n  created () {\n    this.$_ready = false\n    this.$_startIndex = 0\n    this.$_endIndex = 0\n    this.$_views = new Map()\n    this.$_unusedViews = new Map()\n    this.$_scrollDirty = false\n\n    // TODO prerender\n  },\n\n  mounted () {\n    this.applyPageMode()\n    this.$nextTick(() => {\n      this.updateVisibleItems(true)\n      this.$_ready = true\n    })\n  },\n\n  methods: {\n    addView (pool, index, item, key, type) {\n      const view = {\n        item,\n        top: 0,\n      }\n      const nonReactive = {\n        id: uid++,\n        index,\n        used: true,\n        key,\n        type,\n      }\n      Object.defineProperty(view, 'nr', {\n        configurable: false,\n        value: nonReactive,\n      })\n      pool.push(view)\n      return view\n    },\n\n    unuseView (view, fake = false) {\n      const unusedViews = this.$_unusedViews\n      const type = view.nr.type\n      let unusedPool = unusedViews.get(type)\n      if (!unusedPool) {\n        unusedPool = []\n        unusedViews.set(type, unusedPool)\n      }\n      unusedPool.push(view)\n      if (!fake) {\n        view.nr.used = false\n        view.top = -9999\n        this.$_views.delete(view.nr.key)\n      }\n    },\n\n    handleResize () {\n      this.$emit('resize')\n      if (this.$_ready) this.updateVisibleItems(false)\n    },\n\n    handleScroll (event) {\n      if (!this.$_scrollDirty) {\n        this.$_scrollDirty = true\n        requestAnimationFrame(() => {\n          this.$_scrollDirty = false\n          const { continuous } = this.updateVisibleItems(false)\n\n          // It seems sometimes chrome doesn't fire scroll event :/\n          // When non continous scrolling is ending, we force a refresh\n          if (!continuous) {\n            clearTimeout(this.$_refreshTimout)\n            this.$_refreshTimout = setTimeout(this.handleScroll, 100)\n          }\n        })\n      }\n    },\n\n    handleVisibilityChange (isVisible, entry) {\n      if (this.$_ready) {\n        if (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0) {\n          this.$emit('visible')\n          requestAnimationFrame(() => {\n            this.updateVisibleItems(false)\n          })\n        } else {\n          this.$emit('hidden')\n        }\n      }\n    },\n\n    updateVisibleItems (checkItem) {\n      const scroll = this.getScroll()\n      const buffer = parseInt(this.buffer)\n      scroll.top -= buffer\n      scroll.bottom += buffer\n\n      const itemHeight = this.itemHeight\n      const typeField = this.typeField\n      const keyField = this.keyField\n      const items = this.items\n      const count = items.length\n      const heights = this.heights\n      const views = this.$_views\n      let unusedViews = this.$_unusedViews\n      const pool = this.pool\n      let startIndex, endIndex\n      let totalHeight\n\n      if (!count) {\n        startIndex = endIndex = totalHeight = 0\n      } else {\n        // Variable height mode\n        if (itemHeight === null) {\n          let h\n          let a = 0\n          let b = count - 1\n          let i = ~~(count / 2)\n          let oldI\n\n          // Searching for startIndex\n          do {\n            oldI = i\n            h = heights[i].accumulator\n            if (h < scroll.top) {\n              a = i\n            } else if (i < count - 1 && heights[i + 1].accumulator > scroll.top) {\n              b = i\n            }\n            i = ~~((a + b) / 2)\n          } while (i !== oldI)\n          i < 0 && (i = 0)\n          startIndex = i\n\n          // For container style\n          totalHeight = heights[count - 1].accumulator\n\n          // Searching for endIndex\n          for (endIndex = i; endIndex < count && heights[endIndex].accumulator < scroll.bottom; endIndex++);\n          if (endIndex === -1) {\n            endIndex = items.length - 1\n          } else {\n            endIndex++\n            // Bounds\n            endIndex > count && (endIndex = count)\n          }\n        } else {\n          // Fixed height mode\n          startIndex = ~~(scroll.top / itemHeight)\n          endIndex = Math.ceil(scroll.bottom / itemHeight)\n\n          // Bounds\n          startIndex < 0 && (startIndex = 0)\n          endIndex > count && (endIndex = count)\n\n          totalHeight = count * itemHeight\n        }\n      }\n\n      if (endIndex - startIndex > config.itemsLimit) {\n        this.itemsLimitError()\n      }\n\n      this.totalHeight = totalHeight\n\n      let view\n\n      const continuous = startIndex <= this.$_endIndex && endIndex >= this.$_startIndex\n      let unusedIndex\n\n      if (this.$_continuous !== continuous) {\n        if (continuous) {\n          views.clear()\n          unusedViews.clear()\n          for (let i = 0, l = pool.length; i < l; i++) {\n            view = pool[i]\n            this.unuseView(view)\n          }\n        }\n        this.$_continuous = continuous\n      } else if (continuous) {\n        for (let i = 0, l = pool.length; i < l; i++) {\n          view = pool[i]\n          if (view.nr.used) {\n            // Update view item index\n            if (checkItem) {\n              view.nr.index = items.findIndex(\n                item => keyField ? item[keyField] === view.item[keyField] : item === view.item\n              )\n            }\n\n            // Check if index is still in visible range\n            if (\n              view.nr.index === -1 ||\n              view.nr.index < startIndex ||\n              view.nr.index > endIndex\n            ) {\n              this.unuseView(view)\n            }\n          }\n        }\n      }\n\n      if (!continuous) {\n        unusedIndex = new Map()\n      }\n\n      let item, type, unusedPool\n      let v\n      for (let i = startIndex; i < endIndex; i++) {\n        item = items[i]\n        const key = keyField ? item[keyField] : item\n        view = views.get(key)\n\n        if (!itemHeight && !heights[i].height) {\n          if (view) this.unuseView(view)\n          continue\n        }\n\n        // No view assigned to item\n        if (!view) {\n          type = item[typeField]\n\n          if (continuous) {\n            unusedPool = unusedViews.get(type)\n            // Reuse existing view\n            if (unusedPool && unusedPool.length) {\n              view = unusedPool.pop()\n              view.item = item\n              view.nr.used = true\n              view.nr.index = i\n              view.nr.key = key\n              view.nr.type = type\n            } else {\n              view = this.addView(pool, i, item, key, type)\n            }\n          } else {\n            unusedPool = unusedViews.get(type)\n            v = unusedIndex.get(type) || 0\n            // Use existing view\n            // We don't care if they are already used\n            // because we are not in continous scrolling\n            if (unusedPool && v < unusedPool.length) {\n              view = unusedPool[v]\n              view.item = item\n              view.nr.used = true\n              view.nr.index = i\n              view.nr.key = key\n              view.nr.type = type\n              unusedIndex.set(type, v + 1)\n            } else {\n              view = this.addView(pool, i, item, key, type)\n              this.unuseView(view, true)\n            }\n            v++\n          }\n          views.set(key, view)\n        } else {\n          view.nr.used = true\n        }\n\n        // Update position\n        if (itemHeight === null) {\n          view.top = heights[i - 1].accumulator\n        } else {\n          view.top = i * itemHeight\n        }\n      }\n\n      this.$_startIndex = startIndex\n      this.$_endIndex = endIndex\n\n      this.emitUpdate && this.$emit('update', startIndex, endIndex)\n\n      return {\n        continuous,\n      }\n    },\n  },\n}\n</script>\n\n<style scoped>\n.recycle-list:not(.page-mode) {\n  overflow-y: auto;\n}\n\n.item-wrapper {\n  box-sizing: border-box;\n  width: 100%;\n  overflow: hidden;\n  position: relative;\n}\n\n.item-view {\n  width: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n  will-change: transform;\n}\n</style>\n"] }, media: undefined });
  };
  /* scoped */
  var __vue_scope_id__$1 = "data-v-e814ad22";
  /* module identifier */
  var __vue_module_identifier__$1 = undefined;
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* component normalizer */
  function __vue_normalize__$1(template, style, script, scope, functional, moduleIdentifier, createInjector, createInjectorSSR) {
    var component = (typeof script === 'function' ? script.options : script) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "/home/akryum/Projects/vue-virtual-scroller/src/components/RecycleList.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    {
      var hook = void 0;
      if (style) {
        hook = function hook(context) {
          style.call(this, createInjector(context));
        };
      }

      if (hook !== undefined) {
        if (component.functional) {
          // register for functional component in vue file
          var originalRender = component.render;
          component.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context);
          };
        } else {
          // inject component registration as beforeCreate hook
          var existing = component.beforeCreate;
          component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }
    }

    return component;
  }
  /* style inject */
  function __vue_create_injector__$1() {
    var head = document.head || document.getElementsByTagName('head')[0];
    var styles = __vue_create_injector__$1.styles || (__vue_create_injector__$1.styles = {});
    var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

    return function addStyle(id, css) {
      if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return; // SSR styles are present.

      var group = isOldIE ? css.media || 'default' : id;
      var style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

      if (!style.ids.includes(id)) {
        var code = css.source;
        var index = style.ids.length;

        style.ids.push(id);

        if (isOldIE) {
          style.element = style.element || document.querySelector('style[data-group=' + group + ']');
        }

        if (!style.element) {
          var el = style.element = document.createElement('style');
          el.type = 'text/css';

          if (css.media) el.setAttribute('media', css.media);
          if (isOldIE) {
            el.setAttribute('data-group', group);
            el.setAttribute('data-next-index', '0');
          }

          head.appendChild(el);
        }

        if (isOldIE) {
          index = parseInt(style.element.getAttribute('data-next-index'));
          style.element.setAttribute('data-next-index', index + 1);
        }

        if (style.element.styleSheet) {
          style.parts.push(code);
          style.element.styleSheet.cssText = style.parts.filter(Boolean).join('\n');
        } else {
          var textNode = document.createTextNode(code);
          var nodes = style.element.childNodes;
          if (nodes[index]) style.element.removeChild(nodes[index]);
          if (nodes.length) style.element.insertBefore(textNode, nodes[index]);else style.element.appendChild(textNode);
        }
      }
    };
  }
  /* style inject SSR */

  var RecycleList = __vue_normalize__$1({ render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 }, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, __vue_create_injector__$1, undefined);

  function registerComponents(Vue, prefix) {
    Vue.component(prefix + 'virtual-scroller', VirtualScroller);
    Vue.component(prefix + 'recycle-list', RecycleList);
  }

  var plugin$2 = {
    // eslint-disable-next-line no-undef
    version: "0.12.2",
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

  // Auto-install
  var GlobalVue$2 = null;
  if (typeof window !== 'undefined') {
    GlobalVue$2 = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue$2 = global.Vue;
  }
  if (GlobalVue$2) {
    GlobalVue$2.use(plugin$2);
  }

  exports.VirtualScroller = VirtualScroller;
  exports.RecycleList = RecycleList;
  exports.default = plugin$2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
