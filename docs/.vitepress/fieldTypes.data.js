import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { humanize } from "./getFiles.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const frontmatterValue = (frontmatter, key) => {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : undefined
}

const entriesFor = (version, directory, filter = () => true) => {
  const dir = path.join(__dirname, "..", version, directory)

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") && filter(file))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf8")
      const frontmatter = raw.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
      let text = humanize(file.replace(".md", ""))
      if (text === "Easy mde") text = "Easy MDE"
      if (text === "Tip tap") text = "Tip Tap"

      return {
        text,
        link: `/${version}/${directory}/${file.replace(".md", ".html")}`,
        description: frontmatterValue(frontmatter, "description"),
        betaStatus: frontmatterValue(frontmatter, "betaStatus"),
        tags: (frontmatterValue(frontmatter, "fieldTags") ?? "")
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }
    })
}

const fieldsFor = (version) => {
  const associations = ["belongs_to", "has_one", "has_many", "has_and_belongs_to_many"]

  return [
    ...entriesFor(version, "fields"),
    ...entriesFor(version, "associations", (file) => associations.includes(file.replace(".md", ""))),
  ].sort((a, b) => a.text.localeCompare(b.text))
}

export default {
  watch: ["./../4.0/fields/*.md", "./../4.0/associations/*.md"],
  load() {
    return { "4.0": fieldsFor("4.0") }
  },
}
