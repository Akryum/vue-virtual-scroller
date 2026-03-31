import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vue Virtual Scroller',
  description: 'Virtual scrolling for large Vue lists and dynamic layouts.',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Demos', link: '/demos/' },
      {
        text: 'Links',
        items: [
          { text: 'Live Demo', link: 'https://vue-virtual-scroller-demo.netlify.app/' },
          { text: 'GitHub', link: 'https://github.com/Akryum/vue-virtual-scroller' },
          { text: 'Changelog', link: 'https://github.com/Akryum/vue-virtual-scroller/blob/master/CHANGELOG.md' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
          ],
        },
        {
          text: 'Components',
          items: [
            { text: 'RecycleScroller', link: '/guide/recycle-scroller' },
            { text: 'DynamicScroller', link: '/guide/dynamic-scroller' },
            { text: 'DynamicScrollerItem', link: '/guide/dynamic-scroller-item' },
            { text: 'WindowScroller', link: '/guide/window-scroller' },
          ],
        },
        {
          text: 'Headless Composables',
          items: [
            { text: 'useRecycleScroller', link: '/guide/use-recycle-scroller' },
            { text: 'useDynamicScroller', link: '/guide/use-dynamic-scroller' },
            { text: 'useWindowScroller', link: '/guide/use-window-scroller' },
          ],
        },
        {
          text: 'Utilities',
          items: [
            { text: 'IdState', link: '/guide/id-state' },
          ],
        },
        { text: 'AI & Skills', link: '/guide/ai-skills' },
      ],
      '/demos/': [
        {
          text: 'Demos',
          items: [
            { text: 'Overview', link: '/demos/' },
            { text: 'RecycleScroller', link: '/demos/recycle-scroller' },
            { text: 'DynamicScroller', link: '/demos/dynamic-scroller' },
            { text: 'WindowScroller', link: '/demos/window-scroller' },
            { text: 'Chat Stream', link: '/demos/chat' },
            { text: 'Shift', link: '/demos/shift' },
            { text: 'Simple List', link: '/demos/simple-list' },
            { text: 'Headless Table', link: '/demos/headless-table' },
            { text: 'Horizontal', link: '/demos/horizontal' },
            { text: 'Grid', link: '/demos/grid' },
            { text: 'Test Chat', link: '/demos/test-chat' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Akryum/vue-virtual-scroller' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright Akryum',
    },

    search: {
      provider: 'local',
    },
  },
})
