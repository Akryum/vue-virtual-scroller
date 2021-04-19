<template>
  <div class="home">
    <h1>Virtual scrolling solutions</h1>

    <section>
      <router-link
        :to="{ name: 'recycle' }"
        class="route"
      >
        Recycle Scroller
      </router-link>
      <div class="description">
        The Recycle Scroller is a component that only renders the visible item in your list. It also re-use components and dom elements to be the most efficient and performant possible.
      </div>
    </section>

    <section>
      <router-link
        :to="{ name: 'dynamic' }"
        class="route"
      >
        Dynamic Scroller
      </router-link>
      <div class="description">
        This component is using Recycle Scroller under-the-hood and adds a dynamic height management feature on top of it. The main use case for this is <b>not knowing the height of the items</b> in advance: the Dynamic Scroller will automatically "discover" it when it renders new item as the user scrolls.<br>
        The items need to be wrapped in a special Dynamic Scroller Item component.
      </div>
    </section>

    <section>
      <a
        href="https://github.com/Akryum/vue-virtual-scroller"
        class="route"
      >Documentation</a>
      <div class="description">
        Read the full documentation on the repository.
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  margin: 24px;
}

section {
  margin-top: 24px;
}

section .route {
  font-size: 24px;
  color: #42b983;
  display: block;
  margin-bottom: 6px;
}

section .description {
  max-width: 500px;
}
</style>
