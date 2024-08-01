import {getFiles} from "./getFiles"

const fieldsMenuItems2 = getFiles('fields', '2.0')
const fieldsMenuItems3 = getFiles('fields', '3.0')

/**
 * @type {import('vitepress').UserConfig}
 */
const config = {
  title: "Avo docs",
  description: "Avo Admin for Rails docs.",
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
  head: [
    // <script async="" src="https://www.google-analytics.com/analytics.js"></script>
    [
      'script',
      { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-VWMV2FNBQ1' }
    ],
    [
      'script',
      {},
      "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-VWMV2FNBQ1');"
    ],
    ['link', { rel:"apple-touch-icon", sizes:"180x180", href:"/favicons/apple-touch-icon.png" }],
    ['link', { rel:"icon", type:"image/png", sizes:"32x32", href:"/favicons/favicon-32x32.png" }],
    ['link', { rel:"icon", type:"image/png", sizes:"16x16", href:"/favicons/favicon-16x16.png" }],
    ['link', { rel:"manifest", href:"/favicons/site.webmanifest" }],
    ['link', { rel:"mask-icon", href:"/favicons/safari-pinned-tab.svg", color:"#5bbad5" }],
    ['link', { rel:"shortcut icon", href:"/favicons/favicon.ico" }],
    ['meta', { name:"msapplication-TileColor", content:"#2b5797" }],
    ['meta', { name:"msapplication-config", content:"/favicons/browserconfig.xml" }],
    ['meta', { name:"theme-color", content:"#ffffff" }],
  ],
  transformPageData(pageData) {
    const canonicalUrl = `https://docs.avohq.io/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push([
      'link',
      { rel: 'canonical', href: canonicalUrl }
    ])
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: pageData.frontmatter.title }],
      ['meta', { property: 'og:url', content: "https://docs.avohq.io/img/docs-cover.jpeg" }],
      ['meta', { name: "description", content: "Ruby on Rails Admin Panel Framework" }],
      ['meta', { name: "keywords", content: "rails admin, ruby on rails admin, rails admin gem, rails admin package, crud, dashboard, rails dashboard, rails cms, rails crm, ruby on rails, admin, make it easy" }],
      ['meta', { name: "twitter:title", content: "Avo - Ruby on Rails Admin Panel Framework" }],
      ['meta', { name: "twitter:description", content: "Ruby on Rails Admin Panel Framework" }],
      ['meta', { name: "twitter:card", content: "summary_large_image" }],
      ['meta', { name: "twitter:site", content: "@avo_hq" }],
      ['meta', { name: "twitter:image", content: "https://docs.avohq.io/img/docs-cover.jpeg" }],
      ['meta', { property: "og:title", content: "Avo" }],
      ['meta', { property: "og:description", content: "Ruby on Rails Admin Panel Framework" }],
      ['meta', { property: "og:type", content: "website" }],
      ['meta', { property: "og:url", content: canonicalUrl }],
      ['meta', { property: "og:image", content: "https://docs.avohq.io/img/docs-cover.jpeg" }],
      ['meta', { property: "og:image:width", content: "3840" }],
      ['meta', { property: "og:image:height", content: "1920" }],
    )
  },
  themeConfig: {
    siteTitle: false,
    logo: "/logo.svg",
    editLink: {
      pattern: 'https://github.com/avo-hq/vitepress-docs/edit/main/docs/:path'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/avo-hq/avo' },
      { icon: 'twitter', link: 'https://twitter.com/avo_hq' },
      { icon: 'discord', link: 'https://avo.cool/chat' },
    ],
    footer: {
      message: '',
      copyright: 'Copyright © 2020-present Adrian Marin'
    },
    nav: [
      {text: "Home", link: "/"},
      {text: "Docs", link: "/3.0/index.html"},
      {text: "Guides", link: "/3.0/guides.html"},
      {text: "FAQ", link: "/3.0/faq.html"},
      {text: "Team", link: "/team.html"},
      {text: "Version", items: [
        {text: "3.0", link: "/3.0/index.html"},
        {text: "2.0", link: "/2.0/index.html"},
        {text: "1.0", link: "https://v1-docs.avohq.io/1.0/"},
      ]},
    ],
    sidebar: {
      "/3.0/": [
        {
          text: "Avo 3",
          items: [
            {text: "Intro", link: "/3.0/index.html"},
            {text: "Avo 3", link: "/3.0/avo-3.html"},
            {text: "Upgrade guide", link: "/3.0/upgrade.html"},
            {text: "Avo 2 to Avo 3 upgrade", link: "/3.0/avo-2-avo-3-upgrade.html"},
            {text: "Technical Support", link: "/3.0/technical-support.html"},
            {text: "Best practices", link: "/3.0/best-practices.html"},
          ]
        },
        // {
        //   text: "Getting started",
        //   items: [
        //     {text: "Intro", link: "/3.0/index.html"},
        //     {text: "Avo, Rails & Hotwire", link: "/3.0/rails-and-hotwire.html"},
        //     {text: "Licensing", link: "/3.0/licensing"},
        //     // {text: "Upgrade guide", link: "/3.0/upgrade.html"},
        //   ],
        // },
        {
          text: "Configuration",
          items: [
            {text: "Installation", link: "/3.0/installation.html"},
            {text: "Gem server authentication", link: "/3.0/gem-server-authentication.html"},
            {text: "Authentication", link: "/3.0/authentication.html"},
            {text: "Authorization", link: "/3.0/authorization.html"},
            {text: "Cache", link: "/3.0/cache.html"},
          ],
        },
        {
          text: "CRUD UI",
          items: [
            {text: "Resources", link: "/3.0/resources.html"},
            {text: "Fields", link: "/3.0/fields.html"},
            {text: "Field options", link: "/3.0/field-options.html"},
            {text: "Controller configuration", link: "/3.0/controllers.html"},
            {text: "Record previews", link: "/3.0/record-previews.html"},
            {text: "Scopes", link: "/3.0/scopes.html"},
            {text: "Views", link: "/3.0/views.html"},
            {text: "Records reordering", link: "/3.0/records-reordering.html"},
            {text: "Resource sidebar", link: "/3.0/resource-sidebar.html"},
            {text: "Resource panels", link: "/3.0/resource-panels.html"},
            {text: "Resource tabs", link: "/3.0/tabs.html"},
            {text: "Customizable controls", link: "/3.0/customizable-controls.html"},
            {text: "Cover and Profile Photos", link: "/3.0/cover-and-profile-photos.html"},
          ],
        },
        {
          text: "Customize Avo",
          items: [
            {text: "Customization options", link: "/3.0/customization.html"},
            {text: "Eject views", link: "/3.0/eject-views.html"},
            {text: "Grid view", link: "/3.0/grid-view.html"},
            {text: "Map view", link: "/3.0/map-view.html"},
            {text: "Custom view types", link: "/3.0/custom-view-types.html"},
            {text: "Menu editor", link: "/3.0/menu-editor.html"},
            {text: "Search", link: "/3.0/search.html"},
            {text: "Actions", link: "/3.0/actions.html"},
            {text: "Localization (I18n)", link: "/3.0/i18n.html"},
            {text: "Branding", link: "/3.0/branding.html"},
            {text: "Routing", link: "/3.0/routing.html"},
            {text: "Multitenancy", link: "/3.0/multitenancy.html"},
          ],
        },
        {
          text: "Field types",
          collapsible: true,
          collapsed: true,
          items: fieldsMenuItems3,
        },
        {
          text: "Associations",
          collapsible: true,
          collapsed: true,
          items: [
            {text: "Customization", link: "/3.0/associations.html"},
            {text: 'Belongs to', link: '/3.0/associations/belongs_to.html'},
            {text: 'Has one', link: '/3.0/associations/has_one.html'},
            {text: 'Has many', link: '/3.0/associations/has_many.html'},
            {text: 'Has and belongs to many', link: '/3.0/associations/has_and_belongs_to_many.html'},
          ],
        },
        {
          text: "Dashboards and cards",
          items: [
            {text: "Dashboards", link: "/3.0/dashboards.html"},
            {text: "Cards", link: "/3.0/cards.html"},
          ],
        },
        {
          text: "Filters",
          items: [
            {text: "Overview", link: "/3.0/filters.html"},
            {text: "Basic Filters", link: "/3.0/basic-filters.html"},
            {text: "Dynamic Filters", link: "/3.0/dynamic-filters.html"},
          ],
        },
        {
          text: "Custom content",
          items: [
            {text: "Custom views", link: "/3.0/custom-tools.html"},
            {text: "Custom fields", link: "/3.0/custom-fields.html"},
            {text: "Resource tools", link: "/3.0/resource-tools.html"},
            {text: "Stimulus JS integration", link: "/3.0/stimulus-integration.html"},
            {text: "Custom asset pipeline", link: "/3.0/custom-asset-pipeline.html"},
            {text: "TailwindCSS integration", link: "/3.0/tailwindcss-integration.html"},
          ],
        },
        {
          text: "Native Avo components",
          items: [
            {text: "Avo::PanelComponent", link: "/3.0/native-components/avo-panel-component.html"},
            {text: "Native field components", link: "/3.0/native-field-components.html"},
            {text: "Field wrappers", link: "/3.0/field-wrappers.html"},
          ],
        },
        {
          text: "Internals",
          items: [
            {text: "Overview", link: "/3.0/internals.html"},
            {text: "Testing", link: "/3.0/testing.html"},
            {text: "Avo::Current", link: "/3.0/avo-current.html"},
            {text: "Avo::ExecutionContext", link: "/3.0/execution-context.html"},
            {text: "Avo::ApplicationController", link: "/3.0/avo-application-controller.html"},
            {text: "Avo.asset_manager", link: "/3.0/asset-manager.html"},
            {text: "Avo::Services::EncryptionService", link: "/3.0/encryption-service.html"},
            {text: "Icons", link: "/3.0/icons.html"},
          ],
        },
        // {
        //   text: "Extending",
        //   items: [
        //     {text: "Plugins", link: "/3.0/plugins.html"},
        //     {text: "Avo::ApplicationController", link: "/3.0/avo-application-controller.html"},
        //     {text: "Avo.asset_manager", link: "/3.0/asset-manager.html"},
        //   ],
        // },
      ],
      "/2.0/": [
        {
          text: "Avo 2",
          items: [
            {text: "Intro", link: "/2.0/index.html"},
            {text: "Avo, Rails & Hotwire", link: "/2.0/rails-and-hotwire.html"},
            {text: "Licensing", link: "/2.0/licensing.html"},
            {text: "Upgrade guide", link: "/2.0/upgrade.html"},
            {text: "Technical Support", link: "/2.0/technical-support.html"},
          ],
        },
        {
          text: "Configuration",
          items: [
            {text: "Installation", link: "/2.0/installation.html"},
            {text: "Authentication", link: "/2.0/authentication.html"},
            {text: "Authorization", link: "/2.0/authorization.html"},
            {text: "Cache", link: "/2.0/cache.html"},
          ],
        },
        {
          text: "CRUD UI",
          items: [
            {text: "Resource configuration", link: "/2.0/resources.html"},
            {text: "Controller configuration", link: "/2.0/controllers.html"},
            {text: "Field options", link: "/2.0/field-options.html"},
            {text: "Records reordering", link: "/2.0/records-reordering.html"},
            {text: "Tabs and panels", link: "/2.0/tabs.html"},
            {text: "Resource sidebar", link: "/2.0/resource-sidebar.html"},
            {text: "Customizable controls", link: "/2.0/customizable-controls.html"},
          ],
        },
        {
          text: "Fields",
          collapsible: true,
          collapsed: true,
          items: fieldsMenuItems2,
        },
        {
          text: "Associations",
          collapsible: true,
          collapsed: true,
          items: [
            {text: "Customization", link: "/2.0/associations.html"},
            {text: 'Belongs to', link: '/2.0/associations/belongs_to.html'},
            {text: 'Has one', link: '/2.0/associations/has_one.html'},
            {text: 'Has many', link: '/2.0/associations/has_many.html'},
            {text: 'Has and belongs to many', link: '/2.0/associations/has_and_belongs_to_many.html'},
          ],
        },
        {
          text: "Dashboards and cards",
          items: [
            {text: "Dashboards", link: "/2.0/dashboards.html"},
            {text: "Cards", link: "/2.0/cards.html"},
          ],
        },
        {
          text: "Customize Avo",
          items: [
            {text: "Customization options", link: "/2.0/customization.html"},
            {text: "Grid view", link: "/2.0/grid-view.html"},
            {text: "Map view", link: "/2.0/map-view.html"},
            {text: "Menu editor", link: "/2.0/menu-editor.html"},
            {text: "Search", link: "/2.0/search.html"},
            {text: "Filters", link: "/2.0/filters.html"},
            {text: "Actions", link: "/2.0/actions.html"},
            {text: "Localization (I18n)", link: "/2.0/localization.html"},
            {text: "Branding", link: "/2.0/branding.html"},
          ],
        },
        {
          text: "Custom content",
          items: [
            {text: "Custom pages", link: "/2.0/custom-tools.html"},
            {text: "Custom fields", link: "/2.0/custom-fields.html"},
            {text: "Resource tools", link: "/2.0/resource-tools.html"},
            {text: "Stimulus JS integration", link: "/2.0/stimulus-integration.html"},
            {text: "Custom asset pipeline", link: "/2.0/custom-asset-pipeline.html"},
          ],
        },
        {
          text: "Native Avo components",
          items: [
            {text: "Avo::PanelComponent", link: "/2.0/native-components/avo-panel-component.html"},
            {text: "Native field components", link: "/2.0/native-field-components.html"},
            {text: "Field wrappers", link: "/2.0/field-wrappers.html"},
          ],
        },
        {
          text: "Internals",
          items: [
            {text: "Testing", link: "/2.0/testing.html"},
            {text: "Avo::ApplicationController", link: "/2.0/avo-application-controller.html"},
            {text: "Evaluation hosts", link: "/2.0/evaluation-hosts.html"},
          ],
        },
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
