<template>
  <div id="app">
    <nav class="menu">
      <span class="package">
        <span class="package-name">vue-virtual-scroller</span>
      </span>

      <router-link :to="{ name: 'home' }" exact>Home</router-link>
      <router-link :to="{ name: 'recycle' }">Recycle scroller</router-link>
      <router-link :to="{ name: 'dynamic' }">Dynamic scroller</router-link>
      <router-link :to="{ name: 'horizontal' }">Horizontal</router-link>
      <router-link :to="{ name: 'test-chat' }">Scroll to bottom</router-link>
      <router-link :to="{ name: 'simple-list' }">Simple array</router-link>
    </nav>
    <router-view class="page"/>
  </div>
</template>

<style>
html,
body,
#app {
  box-sizing: border-box;
  height: 100%;
}

body {
  font-size: 16px;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
}

#app,
.page {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.menu {
  flex: auto 0 0;
}

.menu,
.page {
  padding: 12px;
  box-sizing: border-box;
}

.package {
  margin-right: 12px;
}

.package-name {
  font-family: monospace;
  color: #2c3e50;
  background: #eee;
  padding: 5px 12px 3px;
}

.package-name,
.menu a {
  display: inline-block;
  border-radius: 3px;
}

.menu a {
  padding: 4px 12px;
  text-decoration: none;
  color: white;
  background: #2c3e50;
}

.menu a.router-link-active {
  background: #42b983;
}

.vue-recycle-scroller {
  -webkit-overflow-scrolling: touch;
}

.vue-recycle-scroller__item-container,
.vue-recycle-scroller__item-wrapper {
  box-sizing: border-box;
}

.vue-recycle-scroller__item-view {
  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
}

.tr, .td {
  box-sizing: border-box;
}

.vue-recycle-scroller__item-view .tr {
  display: flex;
  align-items: center;
}

.vue-recycle-scroller__item-view .td {
  display: block;
}

.vue-recycle-scroller__item-view.hover {
  background: #4fc08d;
  color: white;
}

.toolbar {
  flex: auto 0 0;
  text-align: center;
  margin-bottom: 12px;
  line-height: 32px;
  position: sticky;
  top: 0;
  z-index: 9999;
  background: white;
}

.recycle-scroller-demo.page-mode .toolbar {
  border-bottom: solid 1px #e0edfa;
}

.toolbar > *:not(:last-child) {
  margin-right: 24px;
}

.avatar {
  background: grey;
}
</style>
