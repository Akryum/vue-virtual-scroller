# [2.0.0-beta.1](https://github.com/Akryum/vue-virtual-scroller/compare/v1.1.0...v2.0.0-beta.1) (2022-10-15)


### Bug Fixes

* Account for the height of the leading and trailing slots when calculating visible items, fix [#685](https://github.com/Akryum/vue-virtual-scroller/issues/685) ([24ab3ba](https://github.com/Akryum/vue-virtual-scroller/commit/24ab3ba773d5819fcbe29f13eab663d48bce73ca))
* avoid jumping scroll position when upper item size is calculated ([#374](https://github.com/Akryum/vue-virtual-scroller/issues/374)) ([fd58a95](https://github.com/Akryum/vue-virtual-scroller/commit/fd58a95392c98b8e67da66235fcf4cac78ea2fd4))
* clamp endIndex if less items than prerender ([#473](https://github.com/Akryum/vue-virtual-scroller/issues/473)) ([f9124aa](https://github.com/Akryum/vue-virtual-scroller/commit/f9124aa81c36b46df339a5f18e0e832ab6e5a580))
* DynamicScroller should pass its own keyField prop to child RecycleScroller ([#732](https://github.com/Akryum/vue-virtual-scroller/issues/732)) ([9673679](https://github.com/Akryum/vue-virtual-scroller/commit/9673679fc174cd6236fae4e19a9b1a3b625e900e))
* **DynamicScrollerItem:** watch item prop ([#700](https://github.com/Akryum/vue-virtual-scroller/issues/700)) ([4d3b956](https://github.com/Akryum/vue-virtual-scroller/commit/4d3b95651610b8396c8dff66af9267407eab8e72))
* issue with beforeDestroy hook ([#748](https://github.com/Akryum/vue-virtual-scroller/issues/748)) ([59f3f1b](https://github.com/Akryum/vue-virtual-scroller/commit/59f3f1b0aee9ab8ea276fee60e204b6dcc0baceb))
* merge ([c8363b1](https://github.com/Akryum/vue-virtual-scroller/commit/c8363b114f691042dbced3b5b79d2ebd7812f481))
* restore scroll in keep-alive ([#724](https://github.com/Akryum/vue-virtual-scroller/issues/724)) ([5011e06](https://github.com/Akryum/vue-virtual-scroller/commit/5011e06f2aa6ef8afa6ecaad804413e56a542c8d))
* scrollToItem works with pageMode ([#396](https://github.com/Akryum/vue-virtual-scroller/issues/396)) ([c9772bf](https://github.com/Akryum/vue-virtual-scroller/commit/c9772bfb9e87672de1480072c4d5dc8024d1e5d1))
* wrap the callback in requestAnimationFrame, fix [#516](https://github.com/Akryum/vue-virtual-scroller/issues/516) ([#517](https://github.com/Akryum/vue-virtual-scroller/issues/517)) ([6f359ab](https://github.com/Akryum/vue-virtual-scroller/commit/6f359abed6cf5d81a05d3760d6b622153f331f01))


### Features

* add an empty slot ([#398](https://github.com/Akryum/vue-virtual-scroller/issues/398)) ([5c2715c](https://github.com/Akryum/vue-virtual-scroller/commit/5c2715c0a2c52b0c27436baabbf982fcb9861131))
* add skipHover prop to deactive the hover detection ([#752](https://github.com/Akryum/vue-virtual-scroller/issues/752)) ([b613318](https://github.com/Akryum/vue-virtual-scroller/commit/b613318a52d4d8f84bda69f0189f27dd51d0aaff))
* adds configurable list/item tags for semantic html ([#203](https://github.com/Akryum/vue-virtual-scroller/issues/203)) ([3d24dc3](https://github.com/Akryum/vue-virtual-scroller/commit/3d24dc31928ec9eabe74294e5d5b3466109e1bc2))
* custom classes for list wrapper and list items. ([#397](https://github.com/Akryum/vue-virtual-scroller/issues/397)) ([32b285d](https://github.com/Akryum/vue-virtual-scroller/commit/32b285d40667870b65c71dc59b02627f97c67ea4))
* Emit events for scroll to begin and end of list ([#364](https://github.com/Akryum/vue-virtual-scroller/issues/364)) ([2a7bfd4](https://github.com/Akryum/vue-virtual-scroller/commit/2a7bfd45e1ee56e82426a67d9f3f3ba5a7839185))
* gridItems prop ([#27](https://github.com/Akryum/vue-virtual-scroller/issues/27)) ([6339e72](https://github.com/Akryum/vue-virtual-scroller/commit/6339e72693c982805648ae3001b7c2957d8aa39e))
* itemSecondarySize ([43d311c](https://github.com/Akryum/vue-virtual-scroller/commit/43d311c2f336de74da4d0ec705b0a3546eeda153))
* throw error when key field does not exist in item ([#265](https://github.com/Akryum/vue-virtual-scroller/issues/265)) ([c63129f](https://github.com/Akryum/vue-virtual-scroller/commit/c63129fdc8264d25c737db1c2ce2891a9b804705))
* update event provide range of the visible items ([#115](https://github.com/Akryum/vue-virtual-scroller/issues/115)) ([f19af6c](https://github.com/Akryum/vue-virtual-scroller/commit/f19af6c15346ff33e5d3c4b9729b02a73d5fe4df))


### Performance Improvements

* skipHover: don't add event listeners ([6b623b5](https://github.com/Akryum/vue-virtual-scroller/commit/6b623b56e4ab481b1e0cde883682df2cc81edf19))



