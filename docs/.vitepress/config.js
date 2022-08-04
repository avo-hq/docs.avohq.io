/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: "VitePress",
  description: "Just playing around.",
  themeConfig: {
    nav: [{text: "2.0", link: "/2.0/index.html"}],
    sidebar: {
      "/2.0/": [
        {
          text: "Getting started",
          items: [
            {text: "Installation", link: "/2.0/installation"},
            {text: "Authentication", link: "/2.0/authentication"},
            {text: "Authorization", link: "/2.0/authorization"},
            {text: "Licensing", link: "/2.0/licensing"},
            {text: "Upgrade", link: "/2.0/upgrade"},
            {text: "Grid", link: "/2.0/grid-view"},
            {text: "Recipes", link: "/2.0/recipes"},
            {text: "Faq", link: "/2.0/faq"},
          ],
        },
        {
          text: "CRUD UI",
          items: [
            {text: "Resources", link: '/2.0/resources'},
            {text: "Field options", link: '/2.0/field-options'},
            {text: "Fields", link: '/2.0/fields'},
            {text: "Associations", link: '/2.0/associations'},
            {text: "Tabs and panels", link: '/2.0/tabs'},
          ]
        },
        {
          text: "Dashboards and cards",
          items: [
            {text: "Dashboards", link: '/2.0/dashboards'},
            {text: "Cards", link: '/2.0/cards'},
          ]
        },
        {
          text: "Custom content",
          items: [
            {text: "Custom tools", link: '/2.0/custom-tools'},
            {text: "Custom fields", link: '/2.0/custom-fields'},
            {text: "Resource tools", link: '/2.0/resource-tools'},
            {text: "Stimulus integration", link: '/2.0/stimulus-integration'},
            {text: "Evaluation hosts", link: '/2.0/evaluation-hosts'},
          ]
        },
        {
          text: "Customization",
          items: [
            {text: "Menu editor", link: '/2.0/menu-editor'},
            {text: "Search", link: '/2.0/search'},
            {text: "Filters", link: '/2.0/filters'},
            {text: "Actions", link: '/2.0/actions'},
            {text: "Custom asset pipeline", link: '/2.0/custom-asset-pipeline'},
            {text: "Localization (I18n)", link: '/2.0/localization'},
          ]
        },


        // '/2.0/customization',
        // '/2.0/faq',
        // {
        //   title: 'Recipes & guides',
        //   path: '/2.0/recipes',
        //   sidebarDepth: 0,
        //   collapsable: false,
        //   children: recipeChildren2
        // },
      ],
    },

    algolia: {
      apiKey: 'ee35d4018f0bd7cf035aa4cd29cf7c86',
      appId: '3TLBFY0IWW',
      indexName: 'avohq',
    },
  }
}

export default config