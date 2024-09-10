
console.log('import.meta.env', import.meta.env.VITE_INKEEP_API_KEY)
// console.log('process.env.NODE_ENV', process.env.NODE_ENV)
// console.log('ENV', ENV)
// Embed the widget using the `Inkeep.embed()` function.
const config = {
  componentType: "ChatButton",
  // optional -- for syncing UI color mode
  colorModeSync: {
    observedElement: document.documentElement,
    isDarkModeCallback: (el) => {
      return el.classList.contains("dark");
    },
    colorModeAttribute: "class",
  },
  properties: {
    chatButtonType: "PILL",
    baseSettings: {
      apiKey: "389a67786d65d3ed8f59715c9e61d4a782c33269e7a89919", // required
      integrationId: "cm0wbyzba009blzci5h1bxbg8", // required
      organizationId: "org_IqSqx2i7H6DlDzGS", // required
      primaryBrandColor: "#1398FE", // your brand color, widget color scheme is derived from this
      organizationDisplayName: "Avo",
      // ...optional settings
      chatButtonText: "Ask the AI Assistant",
    },
    modalSettings: {
      // optional settings
    },
    searchSettings: {
      // optional settings
    },
    aiChatSettings: {
      // optional settings
      botAvatarSrcUrl: "/logomark.png", // use your own bot avatar
      // quickQuestions: [
      //   "Example question 1?",
      //   "Example question 2?",
      //   "Example question 3?",
      // ],
    },
  },
};

const inkeepWidget = Inkeep().embed(config);
