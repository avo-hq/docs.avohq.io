import fields from "./getFields"
import container from "markdown-it-container"

function createContainer(klass, defaultTitle, md) {
  return [
    container,
    klass,
    {
      render(tokens, idx) {
        const token = tokens[idx]
        const info = token.info.trim().slice(klass.length).trim()
        if (token.nesting === 1) {
          const title = md.render(`### \`${info || defaultTitle}\``)
          return `<div class="${klass}"><p class="custom-block-title">${title}</p><div class="pl-8">\n`
        } else {
          return `</div></div>\n`
        }
      },
    },
  ]
}

/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: "Avo docs",
  description: "Just playing around.",
  markdown: {
    config: (md) => {
      md.use(...createContainer("option", "option", md))
    },
  },
  themeConfig: {
    siteTitle: false,
    logo: "/logo.svg",
    nav: [
      {text: "Home", link: "/"},
      {text: "Team", link: "/team.html"},
      {text: "Fields", link: "/2.0/fields/index"},
      {text: "2.0", link: "/2.0/index.html"},
      {text: "Recipes", link: "/2.0/recipes"},
      {text: "FAQ", link: "/2.0/faq"},
    ],
    sidebar: {
      "/2.0/": [
        {
          text: "Getting started",
          items: [
            {text: "Installation", link: "/2.0/installation"},
            {text: "Authentication", link: "/2.0/authentication"},
            {text: "Authorization", link: "/2.0/authorization"},
            {text: "Licensing", link: "/2.0/licensing"},
            {text: "Upgrade guide", link: "/2.0/upgrade"},
          ],
        },
        {
          text: "CRUD UI",
          items: [
            {text: "Resource configuration", link: "/2.0/resources"},
            // {text: "Fields", link: '/2.0/fields/index'},
            {text: "Field options", link: "/2.0/field-options"},
            {text: "Records reordering", link: "/2.0/records-reordering"},
            {text: "Associations", link: "/2.0/associations"},
            {text: "Tabs and panels", link: "/2.0/tabs"},
          ],
        },
        {
          text: "Fields",
          collapsible: true,
          collapsed: true,
          items: fields,
        },
        {
          text: "Dashboards and cards",
          items: [
            {text: "Dashboards", link: "/2.0/dashboards"},
            {text: "Cards", link: "/2.0/cards"},
          ],
        },
        {
          text: "Customize Avo",
          items: [
            {text: "Customization options", link: "/2.0/customization"},
            {text: "Grid view", link: "/2.0/grid-view"},
            {text: "Menu editor", link: "/2.0/menu-editor"},
            {text: "Search", link: "/2.0/search"},
            {text: "Filters", link: "/2.0/filters"},
            {text: "Actions", link: "/2.0/actions"},
            {text: "Custom asset pipeline", link: "/2.0/custom-asset-pipeline"},
            {text: "Localization (I18n)", link: "/2.0/localization"},
          ],
        },
        {
          text: "Custom content",
          items: [
            {text: "Custom tools", link: "/2.0/custom-tools"},
            {text: "Custom fields", link: "/2.0/custom-fields"},
            {text: "Resource tools", link: "/2.0/resource-tools"},
            {text: "Stimulus integration", link: "/2.0/stimulus-integration"},
            {text: "Evaluation hosts", link: "/2.0/evaluation-hosts"},
          ],
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
      apiKey: "ee35d4018f0bd7cf035aa4cd29cf7c86",
      appId: "3TLBFY0IWW",
      indexName: "avohq",
    },
  },
}

export default config
