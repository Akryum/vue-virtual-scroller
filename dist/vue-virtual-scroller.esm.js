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
	version: "0.4.3",
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

function throwValueError(value) {
	if (value !== null && typeof value !== 'function') {
		throw new Error('observe-visibility directive expects a function as the value');
	}
}

var ObserveVisibility = {
	bind: function bind(el, _ref, vnode) {
		var value = _ref.value;

		if (typeof IntersectionObserver === 'undefined') {
			console.warn('[vue-observe-visibility] IntersectionObserver API is not available in your browser. Please install this polyfill: https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill');
		} else {
			throwValueError(value);
			el._vue_visibilityCallback = value;
			var observer = el._vue_intersectionObserver = new IntersectionObserver(function (entries) {
				var entry = entries[0];
				if (el._vue_visibilityCallback) {
					el._vue_visibilityCallback.call(null, entry.intersectionRatio > 0, entry);
				}
			});
			// Wait for the element to be in document
			vnode.context.$nextTick(function () {
				observer.observe(el);
			});
		}
	},
	update: function update(el, _ref2) {
		var value = _ref2.value;

		throwValueError(value);
		el._vue_visibilityCallback = value;
	},
	unbind: function unbind(el) {
		if (el._vue_intersectionObserver) {
			el._vue_intersectionObserver.disconnect();
			delete el._vue_intersectionObserver;
			delete el._vue_visibilityCallback;
		}
	}
};

// Install the components
function install$1(Vue) {
	Vue.directive('observe-visibility', ObserveVisibility);
	/* -- Add more components here -- */
}

/* -- Plugin definition & Auto-install -- */
/* You shouldn't have to modify the code below */

// Plugin
var plugin$2 = {
	// eslint-disable-next-line no-undef
	version: "0.3.1",
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
	GlobalVue$1.use(plugin$2);
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
    this.removeWindowScroll();
  },


  methods: {
    getScroll: function getScroll() {
      var el = this.$el;
      var scroll = void 0;

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
        scroll = {
          top: top,
          bottom: top + height
        };
      } else {
        scroll = {
          top: el.scrollTop,
          bottom: el.scrollTop + el.clientHeight
        };
      }

      if (scroll.bottom >= 0 && scroll.top <= scroll.bottom) {
        return scroll;
      } else {
        return null;
      }
    },
    applyPageMode: function applyPageMode() {
      if (this.pageMode) {
        this.addWindowScroll();
      } else {
        this.removeWindowScroll();
      }
    },
    addWindowScroll: function addWindowScroll() {
      window.addEventListener('scroll', this.handleScroll, supportsPassive ? {
        passive: true
      } : false);
      window.addEventListener('resize', this.handleResize);
    },
    removeWindowScroll: function removeWindowScroll() {
      window.removeEventListener('scroll', this.handleScroll);
      window.removeEventListener('resize', this.handleResize);
    },
    scrollToItem: function scrollToItem(index) {
      var scrollTop = void 0;
      if (this.itemHeight === null) {
        scrollTop = index > 0 ? this.heights[index - 1].accumulator : 0;
      } else {
        scrollTop = index * this.itemHeight;
      }
      this.$el.scrollTop = scrollTop;
    }
  }
};

var VirtualScroller = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c(_vm.mainTag, { directives: [{ name: "observe-visibility", rawName: "v-observe-visibility", value: _vm.handleVisibilityChange, expression: "handleVisibilityChange" }], tag: "component", staticClass: "virtual-scroller", class: _vm.cssClass, on: { "&scroll": function scroll($event) {
          _vm.handleScroll($event);
        } } }, [_vm._t("before-container"), _vm._v(" "), _c(_vm.containerTag, { ref: "itemContainer", tag: "component", staticClass: "item-container", class: _vm.containerClass, style: _vm.itemContainerStyle }, [_vm._t("before-content"), _vm._v(" "), _c(_vm.contentTag, { ref: "items", tag: "component", staticClass: "items", class: _vm.contentClass, style: _vm.itemsStyle }, [_vm.renderers ? _vm._l(_vm.visibleItems, function (item, index) {
      return _c(_vm.renderers[item[_vm.typeField]], { key: _vm.keysEnabled && item[_vm.keyField] || undefined, tag: "component", staticClass: "item", attrs: { "item": item, "item-index": _vm._startIndex + index } });
    }) : [_vm._l(_vm.visibleItems, function (item, index) {
      return _vm._t("default", null, { item: item, itemIndex: _vm._startIndex + index, itemKey: _vm.keysEnabled && item[_vm.keyField] || undefined });
    })]], 2), _vm._v(" "), _vm._t("after-content")], 2), _vm._v(" "), _vm._t("after-container"), _vm._v(" "), _c('resize-observer', { on: { "notify": _vm.handleResize } })], 2);
  }, staticRenderFns: [], _scopeId: 'data-v-2b1f2e05',
  name: 'virtual-scroller',

  mixins: [Scroller],

  props: {
    renderers: {
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
      default: null
    },
    contentTag: {
      type: String,
      default: 'div'
    },
    contentClass: {
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

var uid = 0;

var RecycleList = { render: function render() {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { directives: [{ name: "observe-visibility", rawName: "v-observe-visibility", value: _vm.handleVisibilityChange, expression: "handleVisibilityChange" }], staticClass: "recycle-list", class: _vm.cssClass, on: { "&scroll": function scroll($event) {
          _vm.handleScroll($event);
        } } }, [_c('div', { ref: "wrapper", staticClass: "item-wrapper", style: { height: _vm.totalHeight + 'px' } }, _vm._l(_vm.pool, function (view) {
      return _c('div', { key: view.nr.id, staticClass: "item-view", style: { transform: 'translateY(' + view.top + 'px)' } }, [_vm._t("default", null, { item: view.item, active: view.nr.used })], 2);
    })), _vm._v(" "), _vm._t("after-container"), _vm._v(" "), _c('resize-observer', { on: { "notify": _vm.handleResize } })], 2);
  }, staticRenderFns: [], _scopeId: 'data-v-2277f571',
  name: 'RecycleList',

  mixins: [Scroller],

  props: {
    itemHeight: {
      type: Number,
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
    items: {
      handler: function handler() {
        this.updateVisibleItems({
          checkItem: true
        });
      }
    },
    pageMode: function pageMode() {
      this.applyPageMode();
      this.updateVisibleItems({
        checkItem: false
      });
    },

    heights: {
      handler: function handler() {
        this.updateVisibleItems({
          checkItem: false
        });
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
      _this.updateVisibleItems({
        checkItem: true
      });
      _this.$_ready = true;
    });
  },


  methods: {
    addView: function addView(index, item) {
      var view = {
        item: item,
        top: 0
      };
      var nonReactive = {
        id: uid++,
        index: index,
        used: true
      };
      Object.defineProperty(view, 'nr', {
        configurable: false,
        value: nonReactive
      });
      this.pool.push(view);
      return view;
    },
    unuseView: function unuseView(view) {
      var fake = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var unusedViews = this.$_unusedViews;
      var type = view.item[this.typeField];
      var unusedPool = unusedViews.get(type);
      if (!unusedPool) {
        unusedPool = [];
        unusedViews.set(type, unusedPool);
      }
      unusedPool.push(view);
      if (!fake) {
        view.nr.used = false;
        view.top = -9999;
        this.$_views.delete(view.item);
      }
    },
    handleResize: function handleResize() {
      this.$emit('resize');
      this.$_ready && this.updateVisibleItems({
        checkItem: false
      });
    },
    handleScroll: function handleScroll(event) {
      var _this2 = this;

      if (!this.$_scrollDirty) {
        this.$_scrollDirty = true;
        requestAnimationFrame(function () {
          _this2.$_scrollDirty = false;

          var _updateVisibleItems = _this2.updateVisibleItems({
            checkItem: false
          }),
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

      if (this.$_ready && (isVisible || entry.boundingClientRect.width !== 0 || entry.boundingClientRect.height !== 0)) {
        this.$emit('visible');
        requestAnimationFrame(function () {
          _this3.updateVisibleItems({
            checkItem: false
          });
        });
      }
    },
    updateVisibleItems: function updateVisibleItems(_ref) {
      var checkItem = _ref.checkItem;

      var scroll = this.getScroll();
      var buffer = parseInt(this.buffer);
      scroll.top -= buffer;
      scroll.bottom += buffer;

      var itemHeight = this.itemHeight;
      var typeField = this.typeField;
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

      this.totalHeight = totalHeight;

      var view = void 0;

      var continuous = startIndex < this.$_endIndex && endIndex > this.$_startIndex;
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
            if (checkItem) view.nr.index = items.indexOf(view.item);

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
        view = views.get(item);

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
            } else {
              view = this.addView(_i3, item, type);
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
              unusedIndex.set(type, v + 1);
            } else {
              view = this.addView(_i3, item, type);
              this.unuseView(view, true);
            }
            v++;
          }
          views.set(item, view);
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

function registerComponents(Vue, prefix) {
  Vue.component(prefix + 'virtual-scroller', VirtualScroller);
  Vue.component(prefix + 'recycle-list', RecycleList);
}

var plugin$4 = {
  // eslint-disable-next-line no-undef
  version: "0.11.4",
  install: function install(Vue, options) {
    var finalOptions = Object.assign({}, {
      installComponents: true,
      componentsPrefix: ''
    }, options);

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
  GlobalVue$2.use(plugin$4);
}

export default plugin$4;
export { VirtualScroller, RecycleList };
