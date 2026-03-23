import { getFiles } from "./getFiles"

const fieldsMenuItems3 = getFiles('fields', '3.0')

export default [
  {
    text: "Avo 3",
    items: [
      { text: "Intro", link: "/3.0/index.html" },
      { text: "Avo 3", link: "/3.0/avo-3.html" },
      { text: "Upgrade guide", link: "/3.0/upgrade.html" },
      { text: "Avo 2 to Avo 3 upgrade", link: "/3.0/avo-2-avo-3-upgrade.html" },
      { text: "Technical Support", link: "/3.0/technical-support.html" },
      { text: "Best practices", link: "/3.0/best-practices.html" },
      { text: "Code editors and LLM setup", link: "/3.0/llm-support.html" },
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
      { text: "Installation", link: "/3.0/installation.html" },
      { text: "Gem server authentication", link: "/3.0/gem-server-authentication.html" },
      { text: "License troubleshooting", link: "/3.0/license-troubleshooting.html" },
      { text: "Authentication", link: "/3.0/authentication.html" },
      { text: "Authorization", link: "/3.0/authorization.html" },
    ],
  },
  {
    text: "CRUD UI",
    items: [
      { text: "Resources", link: "/3.0/resources.html" },
      { text: "Array Resources", link: "/3.0/array-resources.html" },
      { text: "Fields", link: "/3.0/fields.html" },
      { text: "Field options", link: "/3.0/field-options.html" },
      { text: "Field discovery", link: "/3.0/field-discovery.html" },
      { text: "Controller configuration", link: "/3.0/controllers.html" },
      { text: "Record previews", link: "/3.0/record-previews.html" },
      { text: "Scopes", link: "/3.0/scopes.html" },
      { text: "Records reordering", link: "/3.0/records-reordering.html" },
      { text: "Discreet information", link: "/3.0/discreet-information.html" },
      { text: "Customizable controls", link: "/3.0/customizable-controls.html" },
      { text: "Cover and Profile Photos", link: "/3.0/cover-and-profile-photos.html" },
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
      { text: "Customization", link: "/3.0/associations.html" },
      { text: 'Belongs to', link: '/3.0/associations/belongs_to.html' },
      { text: 'Has one', link: '/3.0/associations/has_one.html' },
      { text: 'Has many', link: '/3.0/associations/has_many.html' },
      { text: 'Has and belongs to many', link: '/3.0/associations/has_and_belongs_to_many.html' },
    ],
  },
  {
    text: "Layout",
    items: [
      { text: "Panels", link: "/3.0/resource-panels.html" },
      { text: "Clusters", link: "/3.0/resource-clusters.html" },
      { text: "Sidebars", link: "/3.0/resource-sidebar.html" },
      { text: "Tabs", link: "/3.0/tabs.html" },
    ],
  },
  {
    text: "Views",
    items: [
      { text: "Overview", link: "/3.0/views.html" },
      { text: "Table view", link: "/3.0/table-view.html" },
      { text: "Grid view", link: "/3.0/grid-view.html" },
      { text: "Map view", link: "/3.0/map-view.html" },
    ],
  },
  {
    text: "Customize Avo",
    items: [
      { text: "Customization options", link: "/3.0/customization.html" },
      { text: "Eject views", link: "/3.0/eject-views.html" },
      { text: "Custom view types", link: "/3.0/custom-view-types.html" },
      { text: "Menu editor", link: "/3.0/menu-editor.html" },
      { text: "Search", link: "/3.0/search.html" },
      { text: "Localization (I18n)", link: "/3.0/i18n.html" },
      { text: "Branding", link: "/3.0/branding.html" },
      { text: "Routing", link: "/3.0/routing.html" },
      { text: "Multitenancy", link: "/3.0/multitenancy.html" },
    ],
  },
  {
    text: "Actions",
    items: [
      { text: "Overview", link: "/3.0/actions/overview.html" },
      { text: "Generate", link: "/3.0/actions/generate.html" },
      { text: "Registration", link: "/3.0/actions/registration.html" },
      { text: "Execution & Feedback", link: "/3.0/actions/execution.html" },
      { text: "Customization", link: "/3.0/actions/customization.html" },
      { text: "Guides & Tutorials", link: "/3.0/actions/guides-and-tutorials.html" },
    ],
  },
  {
    text: "Dashboards and cards",
    items: [
      { text: "Dashboards", link: "/3.0/dashboards.html" },
      { text: "Cards", link: "/3.0/cards.html" },
    ],
  },
  {
    text: "Kanban board",
    items: [
      { text: "Overview", link: "/3.0/kanban-boards.html" },
    ],
  },
  {
    text: "Collaboration",
    items: [
      { text: "Overview", link: "/3.0/collaborate/overview.html" },
      { text: "Authorization", link: "/3.0/collaborate/authorization.html" },
    ],
  },
  {
    text: "Audit Logging",
    items: [
      { text: "Overview", link: "/3.0/audit-logging/" },
    ],
  },
  {
    text: "Filters",
    items: [
      { text: "Overview", link: "/3.0/filters.html" },
      { text: "Basic Filters", link: "/3.0/basic-filters.html" },
      { text: "Dynamic Filters", link: "/3.0/dynamic-filters.html" },
    ],
  },
  // {
  //   text: "Audit Logging",
  //   items: [
  //     {text: "Overview", link: "/3.0/audit-logging/overview.html"},
  //   ],
  // },
  {
    text: "Custom content",
    items: [
      { text: "Custom views", link: "/3.0/custom-tools.html" },
      { text: "Custom fields", link: "/3.0/custom-fields.html" },
      { text: "Custom errors", link: "/3.0/custom-errors.html" },
      { text: "Resource tools", link: "/3.0/resource-tools.html" },
      { text: "Stimulus JS integration", link: "/3.0/stimulus-integration.html" },
      { text: "Custom asset pipeline", link: "/3.0/custom-asset-pipeline.html" },
      { text: "TailwindCSS integration", link: "/3.0/tailwindcss-integration.html" },
    ],
  },
  {
    text: "Media Library",
    items: [
      { text: "Overview", link: "/3.0/media-library.html" },
    ]
  },
  {
    text: "Performance",
    items: [
      { text: "Cache", link: "/3.0/cache.html" },
      { text: "Views", link: "/3.0/views-performance.html" },
    ],
  },
  {
    text: "Native Avo components",
    collapsed: true,
    items: [
      { text: "<code>Avo::PanelComponent</code>", link: "/3.0/native-components/avo-panel-component.html" },
      { text: "Native field components", link: "/3.0/native-field-components.html" },
      { text: "Field wrappers", link: "/3.0/field-wrappers.html" },
    ],
  },
  {
    text: "Internals",
    collapsed: true,
    items: [
      { text: "Overview", link: "/3.0/internals.html" },
      { text: "Testing", link: "/3.0/testing.html" },
      { text: "<code>Avo::Current</code>", link: "/3.0/avo-current.html" },
      { text: "<code>Avo::ExecutionContext</code>", link: "/3.0/execution-context.html" },
      { text: "<code>Avo::Services::EncryptionService</code>", link: "/3.0/encryption-service.html" },
      { text: "Select All", link: "/3.0/select-all.html" },
      { text: "Icons", link: "/3.0/icons.html" },
      { text: "Reserved model names and routes", link: "/3.0/internal-model-names.html" },
    ],
  },
  {
    text: "Extending",
    collapsed: true,
    items: [
      { text: "<code>Avo::ApplicationController</code>", link: "/3.0/avo-application-controller.html" },
      { text: "<code>Avo.asset_manager</code>", link: "/3.0/asset-manager.html" },
      { text: "Plugins", link: "/3.0/plugins.html" },
    ],
  },
]
