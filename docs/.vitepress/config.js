import { getFiles } from "./getFiles.js"
import sidebar20 from "./sidebar-2.0.js"
import sidebar30 from "./sidebar-3.0.js"
import fs from "node:fs"
import path from "node:path"

const fieldsMenuItems4 = getFiles('fields', '4.0')

// Every page is also published as raw markdown next to its .html version (and
// served the same way in dev). Markdown readers never see PageHeader's
// `api_docs`/`guide` callouts, so surface them as visible notices with
// absolute URLs.
function transformRawMd(src, relativePath) {
  const fm = src.match(/^---\n[\s\S]*?\n---\n/)
  if (!fm) return src

  const linkNotice = (key, label) => {
    const match = fm[0].match(new RegExp(`^${key}:\\s*["']?(\\S+?)["']?\\s*$`, 'm'))
    if (!match) return null
    const target = path.posix
      .join(path.posix.dirname(`/${relativePath}`), match[1])
      .replace(/\.html$/, '.md')
    return `> ${label} https://docs.avohq.io${target}\n`
  }

  const notice =
    linkNotice('api_docs', '**Looking for every option?** See the full API reference →') ||
    linkNotice('guide', '**How-to guides and worked examples** See the guides →')
  if (!notice) return src

  return fm[0] + '\n' + notice + src.slice(fm[0].length)
}

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
    config: (md) => {
      md.use(require('markdown-it-task-lists'))

      // Inject the LLM prompt box right under the page title when the
      // page has a `prompt` frontmatter key.
      const defaultHeadingClose = md.renderer.rules.heading_close ||
        ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
      md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
        const html = defaultHeadingClose(tokens, idx, options, env, self)
        if (tokens[idx].tag === 'h1' && !env.__llmPromptInjected && env.frontmatter?.prompt) {
          env.__llmPromptInjected = true
          return html + '\n<LlmPrompt />'
        }
        return html
      }
    },
  },
  head: [
    // ["script", { src: "https://unpkg.com/@inkeep/uikit-js@0.3.8/dist/embed.js", type: "module", defer: true }],
    // ["script", { src: "/static/addInkeep.js", type: "module", defer: true }],
    // ["script", { async: true, src: "https://seltrk.avohq.io/seline.js", dataToken: "803b01c143d844b" }],
    ["script", { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-VWMV2FNBQ1' }
    ],
    ["script", {}, '!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]); posthog.init("phc_AcnCOed7OL4OtCH5i9O3Hb9jLow9iX1aiJxi7GmXoky",{api_host:"https://eu.i.posthog.com",person_profiles: "always"})'],
    ["script", {}, "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-VWMV2FNBQ1');"],
    ['link', { rel: "apple-touch-icon", sizes: "180x180", href: "/favicons/apple-touch-icon.png" }],
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicons/favicon-32x32.png" }],
    ['link', { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicons/favicon-16x16.png" }],
    ['link', { rel: "manifest", href: "/favicons/site.webmanifest" }],
    ['link', { rel: "mask-icon", href: "/favicons/safari-pinned-tab.svg", color: "#5bbad5" }],
    ['link', { rel: "shortcut icon", href: "/favicons/favicon.ico" }],
    ['meta', { name: "msapplication-TileColor", content: "#2b5797" }],
    ['meta', { name: "msapplication-config", content: "/favicons/browserconfig.xml" }],
    ['meta', { name: "theme-color", content: "#ffffff" }],
  ],
  // Publish the raw .md of every page into dist so /4.0/scopes.md works in
  // production (the Copy page button and LLMs fetch these).
  buildEnd(siteConfig) {
    for (const page of siteConfig.pages) {
      try {
        const src = fs.readFileSync(path.join(siteConfig.srcDir, page), 'utf8')
        const out = path.join(siteConfig.outDir, page)
        fs.mkdirSync(path.dirname(out), { recursive: true })
        fs.writeFileSync(out, transformRawMd(src, page))
      } catch {
        // ponytail: dynamic-route/missing sources are skipped, not fatal
      }
    }
  },
  vite: {
    plugins: [
      {
        // Dev parity with the published .md files: serve them transformed
        // instead of letting Vite's static handler return the raw source.
        name: 'avo-serve-transformed-md',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // The SPA loads pages via import('/path/page.md') — those requests
            // must reach Vite's transform pipeline, not get raw markdown.
            if (req.headers['sec-fetch-dest'] === 'script') return next()
            const url = (req.url || '').split('?')[0]
            if (!url.endsWith('.md')) return next()
            const docsDir = path.resolve(__dirname, '..')
            const file = path.resolve(docsDir, decodeURIComponent(url).slice(1))
            if (!file.startsWith(docsDir + path.sep) || !fs.existsSync(file)) return next()
            res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
            res.end(transformRawMd(fs.readFileSync(file, 'utf8'), url.slice(1)))
          })
        },
      },
    ],
  },
  transformPageData(pageData) {
    const canonicalUrl = `https://docs.avohq.io/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '.html')

    pageData.frontmatter.llmLink = `https://docs.avohq.io/${pageData?.params?.version}/docs-map.md`

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
      copyright: `Copyright © 2020–${new Date().getFullYear()} Avo`
    },
    nav: [
      { text: "avohq.io", link: "https://avohq.io" },
      { text: "Guides", link: "/4.0/guides.html" },
      { text: "FAQ", link: "/4.0/faq.html" },
      { text: "Team", link: "/team.html" },
      { text: "Blog", link: "https://avohq.io/blog" },
      {
        text: "More", items: [
          { text: "Releases", link: "https://avohq.io/releases" },
          { text: "Gems", link: "https://avohq.io/gems" },
        ]
      },
      {
        text: "Version", items: [
          { text: "4.0", link: "/4.0/index.html" },
          { text: "3.0", link: "/3.0/index.html" },
          { text: "2.0", link: "/2.0/index.html" },
          { text: "1.0", link: "https://v1-docs.avohq.io/1.0/" },
        ]
      },
    ],
    sidebar: {
      "/4.0/": [
        {
          text: "Avo 4",
          items: [
            { text: "Getting Started", link: "/4.0/index.html" },
            { text: "Upgrade Guide", link: "/4.0/upgrade.html" },
            { text: "Technical Support", link: "/4.0/technical-support.html" },
            { text: "🤖 Agentic engineering", link: "/4.0/agentic-engineering.html" },
          ]
        },
        {
          text: "Configuration",
          items: [
            { text: "Installation", link: "/4.0/installation.html" },
            { text: "Routing", link: "/4.0/routing.html" },
            { text: "Gem server authentication", link: "/4.0/gem-server-authentication.html" },
            { text: "License troubleshooting", link: "/4.0/license-troubleshooting.html" },
            { text: "Authentication", link: "/4.0/authentication.html" },
            { text: "Authorization", link: "/4.0/authorization.html" },
            { text: "Performance", link: "/4.0/performance.html" },
          ],
        },
        {
          text: "Resources",
          items: [
            { text: "Overview", link: "/4.0/resources.html" },
            { text: "Array Resource", link: "/4.0/array-resource.html" },
            { text: "HTTP Resource", link: "/4.0/http-resource.html" },
            { text: "Scopes", link: "/4.0/scopes.html" },
            { text: "Record reordering", link: "/4.0/record-reordering.html" },
            { text: "Discreet information", link: "/4.0/discreet-information.html" },
            { text: "Custom controls", link: "/4.0/custom-controls.html" },
            { text: "Actions", link: "/4.0/actions.html" },
            { text: "Select All", link: "/4.0/select-all.html" },
            { text: "Cover and Avatar", link: "/4.0/cover-and-avatar.html" },
            {
              text: "Views",
              link: "/4.0/views.html",
              collapsed: false,
              items: [
                { text: "Overview", link: "/4.0/views.html" },
                { text: "Table view", link: "/4.0/table-view.html" },
                { text: "Grid view", link: "/4.0/grid-view.html" },
                { text: "Map view", link: "/4.0/map-view.html" },
                { text: "Custom view types", link: "/4.0/custom-view-types.html" },
              ],
            },
          ]
        },
        {
          text: "Fields",
          items: [
            { text: "Fields", link: "/4.0/fields.html" },
            { text: "Field options", link: "/4.0/field-options.html" },
            { text: "HTML attributes", link: "/4.0/html.html" },
            { text: "Field discovery", link: "/4.0/field-discovery.html" },

            { text: "Layout", link: "/4.0/fields-layout.html" },
            {
              text: "Field types",
              collapsed: true,
              items: fieldsMenuItems4,
            },
            {
              text: "Associations",
              collapsed: true,
              items: [
                { text: "Overview", link: "/4.0/associations.html" },
                { text: 'Searchable', link: '/4.0/associations/searchable.html' },
                { text: 'Belongs to', link: '/4.0/associations/belongs_to.html' },
                { text: 'Has one', link: '/4.0/associations/has_one.html' },
                { text: 'Has many', link: '/4.0/associations/has_many.html' },
                { text: 'Has and belongs to many', link: '/4.0/associations/has_and_belongs_to_many.html' },
              ],
            },
          ],
        },
        {
          text: "Filters",
          items: [
            { text: "Overview", link: "/4.0/filters.html" },
            { text: "Basic Filters", link: "/4.0/basic-filters.html" },
            { text: "Dynamic Filters", link: "/4.0/dynamic-filters.html" },
          ],
        },
        {
          text: "Customize Avo",
          items: [
            { text: "Customization", link: "/4.0/customization.html" },
            { text: "Eject views", link: "/4.0/eject-views.html" },
            { text: "Menu editor", link: "/4.0/menu-editor.html" },
            { text: "Search", link: "/4.0/search.html" },
            { text: "Keyboard Shortcuts", link: "/4.0/keyboard-shortcuts.html" },
            { text: "Localization (I18n)", link: "/4.0/i18n.html" },
            { text: "Appearance", link: "/4.0/appearance.html" },
            { text: "Theming", link: "/4.0/theming.html" },
            // { text: "User Preferences", link: "/4.0/user-preferences.html" },
            { text: "Multitenancy", link: "/4.0/multitenancy.html" },
            { text: "Breadcrumbs", link: "/4.0/breadcrumbs.html" },
            {
              text: "Build your own UI",
              collapsed: false,
              items: [
                { text: "Custom tools", link: "/4.0/custom-tools.html" },
                { text: "Resource tools", link: "/4.0/resource-tools.html" },
                { text: "Custom fields", link: "/4.0/custom-fields.html" },
                { text: "Custom errors", link: "/4.0/custom-errors.html" },
                { text: "Icons", link: "/4.0/icons.html" },
                { text: "Asset handling", link: "/4.0/asset-handling.html" },
                { text: "JavaScript & Stimulus", link: "/4.0/javascript.html" },
                { text: "TailwindCSS integration", link: "/4.0/tailwindcss-integration.html" },
                {
                  text: "Native Avo components",
                  collapsed: false,
                  items: [
                    { text: "<code>Avo::ButtonComponent</code>", link: "/4.0/native-components/avo-button-component.html" },
                    { text: "<code>Avo::PanelComponent</code>", link: "/4.0/native-components/avo-panel-component.html" },
                    { text: "<code>Avo::CardComponent</code>", link: "/4.0/native-components/avo-card-component.html" },
                    { text: "Native field components", link: "/4.0/native-field-components.html" },
                    { text: "Field wrappers", link: "/4.0/field-wrappers.html" },
                  ],
                },
                { text: "Plugins", link: "/4.0/plugins.html" },
                { text: "<code>Avo.asset_manager</code>", link: "/4.0/asset-manager.html" },
              ],
            },
          ],
        },
        // {
        //   text: "MCP (Model Context Protocol)",
        //   items: [
        //     { text: "Overview", link: "/4.0/mcp.html" },
        //   ],
        // },
        {
          text: "Add-ons",
          items: [
            { text: "Notifications", link: "/4.0/notifications.html" },
            { text: "Media Library", link: "/4.0/media-library.html" },
            { text: "Audit Logging", link: "/4.0/audit-logging.html" },
            { text: "Dashboards", link: "/4.0/dashboards.html" },
            { text: "Cards", link: "/4.0/cards.html" },
            {
              text: "Kanban board",
              link: "/4.0/kanban-boards.html",
            },
            {
              text: "Forms and pages",
              link: "/4.0/forms-and-pages.html",
            },
            {
              text: "REST API",
              link: "/4.0/rest-api.html",
            },
            {
              text: "Collaboration",
              link: "/4.0/collaboration.html",
            },
          ]
        },
        {
          text: "Internals",
          collapsed: false,
          items: [
            { text: "Overview", link: "/4.0/internals.html" },
            { text: "Testing", link: "/4.0/testing.html" },
            { text: "<code>Avo::Current</code>", link: "/4.0/avo-current.html" },
            { text: "<code>Avo::ExecutionContext</code>", link: "/4.0/execution-context.html" },
            { text: "<code>Avo::Services::EncryptionService</code>", link: "/4.0/encryption-service.html" },
            { text: "Reserved model names and routes", link: "/4.0/internal-model-names.html" },
            { text: "Rails engines and path helpers", link: "/4.0/rails-engines-paths.html" },
            { text: "Controller configuration", link: "/4.0/controllers.html" },
            { text: "<code>Avo::ApplicationController</code>", link: "/4.0/avo-application-controller.html" },
          ],
        },
        // {
        //   text: "Everything",
        //   link: "/4.0/everything.html",
        // },
      ],
      "/3.0/": sidebar30,
      "/2.0/": sidebar20,
      "/contributing/": [
        {
          text: "Contributing",
          items: [
            { text: "Overview", link: "/contributing/" },
            { text: "Writing docs", link: "/contributing/writing-docs.html" },
            { text: "Running the docs site", link: "/contributing/running-the-docs-site.html" },
          ],
        },
      ],
    },

    search: {
      provider: 'algolia',
      options: {
        apiKey: "ee35d4018f0bd7cf035aa4cd29cf7c86",
        appId: "3TLBFY0IWW",
        indexName: "avohq",
        // Scope search results to the docs version the reader is currently on:
        // on /4.0/* only `version:4.0` records are returned, on /3.0/* only 3.0,
        // etc. The version is read from the live pathname inside `search`, so it
        // follows client-side navigation without re-initializing DocSearch.
        // Pages without a version prefix (home, /team) stay unfiltered and search
        // across every version.
        //
        // Requires the Algolia index to carry a `version` facet
        // (`filterOnly(version)` in the crawler's attributesForFaceting).
        //
        // NOTE: VitePress serializes this function to the client and rehydrates it
        // with `new Function`, so it must be fully self-contained — no imports and
        // no closure variables. Only browser globals and its arguments are available.
        transformSearchClient(searchClient) {
          const originalSearch = searchClient.search.bind(searchClient)

          return Object.assign({}, searchClient, {
            search(args, requestOptions) {
              const match = typeof window !== 'undefined'
                ? window.location.pathname.match(/^\/(\d+\.\d+)\//)
                : null

              // Scope to the current docs version; default to 4.0 on unversioned
              // pages (home, /team) so search doesn't span every version.
              const version = match ? match[1] : '4.0'
              {
                const versionFilter = 'version:' + version
                const withFilter = function (request) {
                  // Only scope our docs index; leave any other index (e.g. Ask AI) untouched.
                  if (!request || request.indexName !== 'avohq') return request
                  const existing = request.facetFilters
                  let facetFilters
                  if (!existing) facetFilters = [versionFilter]
                  else if (Array.isArray(existing)) facetFilters = existing.concat([versionFilter])
                  else facetFilters = [existing, versionFilter]
                  return Object.assign({}, request, { facetFilters })
                }

                if (args && Array.isArray(args.requests)) {
                  args = Object.assign({}, args, { requests: args.requests.map(withFilter) })
                } else if (Array.isArray(args)) {
                  args = args.map(withFilter)
                }
              }

              return originalSearch(args, requestOptions)
            }
          })
        },
        // Show which docs version the results are scoped to, inside the search
        // modal. Renders on each search and reads the live pathname, so it stays
        // correct after client-side navigation. Hidden on unversioned pages
        // (home, /team), where search spans all versions.
        // Same serialization rules as transformSearchClient: keep it self-contained.
        resultsFooterComponent(props, helpers) {
          const html = helpers && helpers.html
          if (!html) return null
          const match = typeof window !== 'undefined'
            ? window.location.pathname.match(/^\/(\d+)\.\d+\//)
            : null
          // Default to v4 on unversioned pages (home, /team) to match the filter.
          const major = match ? match[1] : '4'
          return html`<div class="vp-docsearch-version-note">Searching <strong>v${major}</strong> docs</div>`
        },
      },
    },
  },
}

export default config
