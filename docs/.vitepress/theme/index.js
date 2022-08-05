import DefaultTheme from "vitepress/theme"
import FeedbackPill from "./components/FeedbackPill.vue"
import LicenseReq from "./components/LicenseReq.vue"
import VersionReq from "./components/VersionReq.vue"
import DemoVideo from "./components/DemoVideo.vue"
import PageHeader from "./components/PageHeader.vue"
import Alert from "./components/Alert.vue"
import BetaStatus from "./components/BetaStatus.vue"
import {InformationCircleIcon, BeakerIcon, PlayIcon} from "@heroicons/vue/outline"
import "./styles.css"
import {h} from "vue"

export default {
  ...DefaultTheme,
  enhanceApp({app}) {
    app.component("FeedbackPill", FeedbackPill)
    app.component("LicenseReq", LicenseReq)
    app.component("VersionReq", VersionReq)
    app.component("DemoVideo", DemoVideo)
    app.component("BetaStatus", BetaStatus)
    app.component("Alert", Alert)

    app.component("BeakerIcon", BeakerIcon)
    app.component("PlayIcon", PlayIcon)
    app.component("InformationCircleIcon", InformationCircleIcon)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-before": () => h(PageHeader),
    })
  },
}
