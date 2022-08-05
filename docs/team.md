<script setup>
import { VPTeamMembers } from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/adrianthedev.png',
    name: 'Adrian Marin',
    title: 'Creator',
    links: [
      { icon: 'github', link: 'https://github.com/adrianthedev' },
      { icon: 'twitter', link: 'https://twitter.com/adrianthedev' }
    ]
  },
  {
    avatar: 'https://www.github.com/Paul-Bob.png',
    name: 'Paul Bob',
    title: 'Dev magician',
    links: [
      { icon: 'github', link: 'https://github.com/Paul-Bob' },
    ]
  },
]
</script>

# Our Team

Say hello to our awesome team.

<VPTeamMembers size="small" :members="members" />