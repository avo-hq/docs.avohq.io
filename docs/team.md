<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/adrianthedev.png',
    name: 'Adrian Marin',
    title: 'Author',
    links: [
      { icon: 'github', link: 'https://github.com/adrianthedev' },
      { icon: 'twitter', link: 'https://twitter.com/adrianthedev' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/adrianthedev/' }
    ]
  },
  {
    avatar: 'https://www.github.com/Paul-Bob.png',
    name: 'Paul Bob',
    title: 'CTO & CGO (Chief GIF Officer)',
    links: [
      { icon: 'github', link: 'https://github.com/Paul-Bob' },
      { icon: 'twitter', link: 'https://twitter.com/paul_ionut_bob' },
    ]
  },
]
</script>

# Team

<VPTeamMembers size="large" :members="members" />
