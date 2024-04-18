import {getFiles} from "./getFiles"

const replaceExtension = (i) => {
  return {
    ...i,
    link: i.link.replace('.md', '.html')
  }
}

export default {
  load() {
    const v2 = getFiles('recipes', '2.0').map((i) => replaceExtension(i))
    const v3 = getFiles('guides', '3.0').map((i) => replaceExtension(i))

    return {
      v2,
      v3
    }
  }
}
