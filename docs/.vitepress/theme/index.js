import DefaultTheme from "vitepress/theme"
import FeedbackPill from "./components/FeedbackPill.vue"
import LicenseReq from "./components/LicenseReq.vue"
import VersionReq from "./components/VersionReq.vue"
import Version from "./components/Version.vue"
import DemoVideo from "./components/DemoVideo.vue"
import Demo from "./components/Demo.vue"
import PageHeader from "./components/PageHeader.vue"
import AsideOutlineAfter from "./components/AsideOutlineAfter.vue"
import BetaStatus from "./components/BetaStatus.vue"
import SponsorGroup from "./components/SponsorGroup.vue"
import Sponsor from "./components/Sponsor.vue"
import Index from "./components/Index.vue"
import Show from "./components/Show.vue"
import Edit from "./components/Edit.vue"
import New from "./components/New.vue"
import Preview from "./components/Preview.vue"
import View from "./components/View.vue"
import Option from "./components/Option.vue"
import AllContent from "./components/AllContent.vue"
import {ChatBubbleBottomCenterIcon, CheckBadgeIcon, InformationCircleIcon, BeakerIcon, PlayIcon} from "@heroicons/vue/24/outline/index.js"
import "./styles.css"
import {h} from "vue"

export default {
  ...DefaultTheme,
  enhanceApp({app}) {
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

    app.component("BeakerIcon", BeakerIcon)
    app.component("PlayIcon", PlayIcon)
    app.component("InformationCircleIcon", InformationCircleIcon)
    app.component("CheckBadgeIcon", CheckBadgeIcon)
    app.component("ChatBubbleBottomCenterIcon", ChatBubbleBottomCenterIcon)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-before": () => h(PageHeader),
      "aside-outline-after": () => h(AsideOutlineAfter),
    })
  },
}
