
console.log('import.meta.env', import.meta.env)
console.log('ENV', ENV)
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
      apiKey: import.meta.env.VITE_INKEEP_API_KEY, // required
      integrationId: import.meta.env.VITE_INKEEP_INTEGRATION_ID, // required
      organizationId: import.meta.env.VITE_INKEEP_ORGANIZATION_ID, // required
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
