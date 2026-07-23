import DefaultTheme from 'vitepress/theme'
import FeedbackPill from "../theme/components/FeedbackPill.vue"
import LicenseReq from "../theme/components/LicenseReq.vue"
import VersionReq from "../theme/components/VersionReq.vue"
import Version from "../theme/components/Version.vue"
import DemoVideo from "../theme/components/DemoVideo.vue"
import Demo from "../theme/components/Demo.vue"
import TopBarWrapper from "../theme/components/TopBarWrapper.vue"
import VersionBadge from "../theme/components/VersionBadge.vue"
import PageHeader from "../theme/components/PageHeader.vue"
import CopyPageButton from "../theme/components/CopyPageButton.vue"
import AsideOutlineAfter from "../theme/components/AsideOutlineAfter.vue"
import BetaStatus from "../theme/components/BetaStatus.vue"
import SponsorGroup from "../theme/components/SponsorGroup.vue"
import Sponsor from "../theme/components/Sponsor.vue"
import Index from "../theme/components/Index.vue"
import Show from "../theme/components/Show.vue"
import Edit from "../theme/components/Edit.vue"
import New from "../theme/components/New.vue"
import Preview from "../theme/components/Preview.vue"
import View from "../theme/components/View.vue"
import Option from "../theme/components/Option.vue"
import AllContent from "../theme/components/AllContent.vue"
import Image from "../theme/components/Image.vue"
import RelatedList from "../theme/components/RelatedList.vue"
import RelatedItem from "../theme/components/RelatedItem.vue"
import EditorList from "../theme/components/EditorList.vue"
import FieldTypesList from "../theme/components/FieldTypesList.vue"
import RecipesList from "../theme/components/RecipesList.vue"
import CustomCode from "../theme/components/CustomCode.vue"
import LlmPrompt from "../theme/components/LlmPrompt.vue"
import BrandingRedirect from "../theme/components/BrandingRedirect.vue"
import RefactoredFromBranding from "../theme/components/RefactoredFromBranding.vue"
import InternalsList from "../theme/components/InternalsList.vue"
import {ChatBubbleBottomCenterIcon, CheckBadgeIcon, InformationCircleIcon, BeakerIcon, PlayIcon} from "@heroicons/vue/24/outline"
import './custom.css'
import {h} from "vue"

export default {
  ...DefaultTheme,
  enhanceApp({app, router}) {
    if (typeof window !== "undefined") {
      // -api pages aren't sidebar entries, so nothing lights up on them. Read their
      // `guide:` frontmatter and mark the guide's sidebar item active instead.
      let manualActive = null
      const highlightGuideForApiPage = () => {
        if (manualActive) { manualActive.classList.remove("is-active"); manualActive = null }
        const guide = router.route.data?.frontmatter?.guide
        if (!guide) return
        const target = new URL(guide, window.location.href).pathname.replace(/\.html$/, "")
        const link = [...document.querySelectorAll(".VPSidebar a")]
          .find(a => a.pathname.replace(/\.html$/, "") === target)
        const item = link?.closest(".VPSidebarItem")
        if (item) { item.classList.add("is-active"); manualActive = item }
      }

      const syncSidebar = () => {
        requestAnimationFrame(() => {
          highlightGuideForApiPage()
          const item = document.querySelector(".VPSidebarItem.is-active > .item")
          const sidebar = item?.closest(".VPSidebar")
          if (!item || !sidebar) return

          const itemRect = item.getBoundingClientRect()
          const sidebarRect = sidebar.getBoundingClientRect()
          const inView = itemRect.top >= sidebarRect.top && itemRect.bottom <= sidebarRect.bottom
          if (!inView) item.scrollIntoView({block: "center"})
        })
      }
      router.onAfterRouteChange = syncSidebar
      // ponytail: initial load — sidebar isn't mounted yet in enhanceApp, so defer
      window.addEventListener("load", syncSidebar, {once: true})
    }


    app.component("FeedbackPill", FeedbackPill)
    app.component("LicenseReq", LicenseReq)
    app.component("VersionReq", VersionReq)
    app.component("Version", Version)
    app.component("DemoVideo", DemoVideo)
    app.component("Demo", Demo)
    app.component("BetaStatus", BetaStatus)
    app.component("SponsorGroup", SponsorGroup)
    app.component("Sponsor", Sponsor)
    app.component("Index", Index)
    app.component("Show", Show)
    app.component("Edit", Edit)
    app.component("New", New)
    app.component("Preview", Preview)
    app.component("View", View)

    app.component("AllContent", AllContent)
    app.component("Option", Option)
    app.component("Image", Image)
    app.component("RelatedList", RelatedList)
    app.component("RelatedItem", RelatedItem)

    app.component("BeakerIcon", BeakerIcon)
    app.component("PlayIcon", PlayIcon)
    app.component("InformationCircleIcon", InformationCircleIcon)
    app.component("CheckBadgeIcon", CheckBadgeIcon)
    app.component("ChatBubbleBottomCenterIcon", ChatBubbleBottomCenterIcon)

    app.component("EditorList", EditorList)
    app.component("FieldTypesList", FieldTypesList)
    app.component("RecipesList", RecipesList)
    app.component("CustomCode", CustomCode)
    app.component("LlmPrompt", LlmPrompt)
    app.component("BrandingRedirect", BrandingRedirect)
    app.component("RefactoredFromBranding", RefactoredFromBranding)
    app.component("InternalsList", InternalsList)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-top": () => h(TopBarWrapper),
      "nav-bar-title-after": () => h(VersionBadge),
      "doc-before": () => h(PageHeader),
      "aside-outline-before": () => h(CopyPageButton),
      "aside-outline-after": () => h(AsideOutlineAfter),
    })
  },
}
