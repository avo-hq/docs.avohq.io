import DefaultTheme from 'vitepress/theme'
import FeedbackPill from './components/FeedbackPill.vue'
import './styles.css';

console.log('FeedbackPill->', FeedbackPill)

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('FeedbackPill', FeedbackPill)
  }
}