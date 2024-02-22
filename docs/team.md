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
    title: 'Lead Developer & CGO (Chief GIF Officer)',
    links: [
      { icon: 'github', link: 'https://github.com/Paul-Bob' },
      { icon: 'twitter', link: 'https://twitter.com/paul_ionut_bob' },
    ]
  },
  {
    avatar: 'https://www.github.com/gabrielgiroe1.png',
    name: 'Gabriel Giroe',
    title: 'Developer',
    links: [
      { icon: 'github', link: 'https://github.com/gabrielgiroe1' },
      { icon: 'twitter', link: 'https://twitter.com/gabrielgiroe' },
    ]
  },
  // {
  //   avatar: 'https://media-exp1.licdn.com/dms/image/C4D03AQG4SAPGQZIkHw/profile-displayphoto-shrink_200_200/0/1618998196775?e=1665014400&v=beta&t=vP9Rw73rqVmxDf-Bs0gZmgpV1KUclOgCr7XhMRyKarg',
  //   name: 'Ștefan Stroie',
  //   title: 'Design',
  //   links: [
  //     { icon: 'linkedin', link: 'https://www.linkedin.com/in/%C8%99tefan-stroie/' },
  //   ]
  // },
]
</script>

# Team

<VPTeamMembers size="small" :members="members" />
