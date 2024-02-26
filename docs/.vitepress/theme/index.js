import DefaultTheme from 'vitepress/theme'
import FeedbackPill from "../theme/components/FeedbackPill.vue"
import LicenseReq from "../theme/components/LicenseReq.vue"
import VersionReq from "../theme/components/VersionReq.vue"
import Version from "../theme/components/Version.vue"
import DemoVideo from "../theme/components/DemoVideo.vue"
import Demo from "../theme/components/Demo.vue"
import PageHeader from "../theme/components/PageHeader.vue"
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
import {ChatBubbleBottomCenterIcon, CheckBadgeIcon, InformationCircleIcon, BeakerIcon, PlayIcon} from "@heroicons/vue/24/outline/index.js"
import './custom.css'
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

