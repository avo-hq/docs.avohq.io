import { getFiles } from "./getFiles.js"

const fieldsMenuItems2 = getFiles('fields', '2.0')

export default [
  {
    text: "Avo 2",
    items: [
      { text: "Intro", link: "/2.0/index.html" },
      { text: "Avo, Rails & Hotwire", link: "/2.0/rails-and-hotwire.html" },
      { text: "Licensing", link: "/2.0/licensing.html" },
      { text: "Upgrade guide", link: "/2.0/upgrade.html" },
      { text: "Technical Support", link: "/2.0/technical-support.html" },
      { text: "Code editors and LLM setup", link: "/2.0/llm-support.html" },
    ],
  },
  {
    text: "Configuration",
    items: [
      { text: "Installation", link: "/2.0/installation.html" },
      { text: "Authentication", link: "/2.0/authentication.html" },
      { text: "Authorization", link: "/2.0/authorization.html" },
      { text: "Cache", link: "/2.0/cache.html" },
    ],
  },
  {
    text: "CRUD UI",
    items: [
      { text: "Resource configuration", link: "/2.0/resources.html" },
      { text: "Controller configuration", link: "/2.0/controllers.html" },
      { text: "Field options", link: "/2.0/field-options.html" },
      { text: "Records reordering", link: "/2.0/records-reordering.html" },
      { text: "Tabs and panels", link: "/2.0/tabs.html" },
      { text: "Resource sidebar", link: "/2.0/resource-sidebar.html" },
      { text: "Customizable controls", link: "/2.0/customizable-controls.html" },
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
      { text: "Customization", link: "/2.0/associations.html" },
      { text: 'Belongs to', link: '/2.0/associations/belongs_to.html' },
      { text: 'Has one', link: '/2.0/associations/has_one.html' },
      { text: 'Has many', link: '/2.0/associations/has_many.html' },
      { text: 'Has and belongs to many', link: '/2.0/associations/has_and_belongs_to_many.html' },
    ],
  },
  {
    text: "Dashboards and cards",
    items: [
      { text: "Dashboards", link: "/2.0/dashboards.html" },
      { text: "Cards", link: "/2.0/cards.html" },
    ],
  },
  {
    text: "Customize Avo",
    items: [
      { text: "Customization options", link: "/2.0/customization.html" },
      { text: "Grid view", link: "/2.0/grid-view.html" },
      { text: "Map view", link: "/2.0/map-view.html" },
      { text: "Menu editor", link: "/2.0/menu-editor.html" },
      { text: "Search", link: "/2.0/search.html" },
      { text: "Filters", link: "/2.0/filters.html" },
      { text: "Actions", link: "/2.0/actions.html" },
      { text: "Localization (I18n)", link: "/2.0/localization.html" },
      { text: "Branding", link: "/2.0/branding.html" },
    ],
  },
  {
    text: "Custom content",
    items: [
      { text: "Custom pages", link: "/2.0/custom-tools.html" },
      { text: "Custom fields", link: "/2.0/custom-fields.html" },
      { text: "Resource tools", link: "/2.0/resource-tools.html" },
      { text: "Stimulus JS integration", link: "/2.0/stimulus-integration.html" },
      { text: "Custom asset pipeline", link: "/2.0/custom-asset-pipeline.html" },
    ],
  },
  {
    text: "Native Avo components",
    items: [
      { text: "Avo::PanelComponent", link: "/2.0/native-components/avo-panel-component.html" },
      { text: "Native field components", link: "/2.0/native-field-components.html" },
      { text: "Field wrappers", link: "/2.0/field-wrappers.html" },
    ],
  },
  {
    text: "Internals",
    items: [
      { text: "Testing", link: "/2.0/testing.html" },
      { text: "Avo::ApplicationController", link: "/2.0/avo-application-controller.html" },
      { text: "Evaluation hosts", link: "/2.0/evaluation-hosts.html" },
    ],
  },
]
