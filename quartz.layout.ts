import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// Reusable Explorer keeping Obsidian folders untouched: 03 -> 02 -> 01
const gardenExplorer = Component.Explorer({
  title: "Explorer",
  folderDefaultState: "open",
  folderClickBehavior: "collapse",
  useSavedState: false,
  filterFn: (node) => {
    const exclude = ["template", "templates", "tags"]
    const segment = String(node?.slugSegment ?? node?.name ?? "").toLowerCase()
    return !exclude.includes(segment)
  },
  // 1. Sort folders strictly by disk name in reverse: 03_Evergreen -> 02_Seedling -> 01_Seed
  sortFn: (a, b) => {
    const isFolderA = a.file === null
    const isFolderB = b.file === null

    // Put folders before standalone files
    if (isFolderA && !isFolderB) return -1
    if (!isFolderA && isFolderB) return 1

    // Reverse alphabetical sort for folders (03 comes before 02 and 01)
    if (isFolderA && isFolderB) {
      const nameA = a.name ?? ""
      const nameB = b.name ?? ""
      return nameB.localeCompare(nameA, undefined, { numeric: true })
    }

    // Standard A-Z sort for notes inside folders
    const titleA = a.displayName ?? a.name ?? ""
    const titleB = b.displayName ?? b.name ?? ""
    return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: "base" })
  },
  // 2. Strip "01_", "02_", "03_" and rename to your chosen display labels
  mapFn: (node) => {
    if (!node || typeof node.displayName !== "string") return

    node.displayName = node.displayName.replace(/^\d+[_-\s]*/, "")

    const customNames: Record<string, string> = {
      "seed": "Thoughts",
      "seeds": "Thoughts",
      "seedling": "Works in progress",
      "seedlings": "Works in progress",
      "evergreen": "Completed works",
    }

    const key = node.displayName.toLowerCase().trim()
    if (customNames[key]) {
      node.displayName = customNames[key]
    }
  },
})

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    gardenExplorer,
  ],
  right: [
Component.Graph({
  localGraph: {
    drag: true,
    zoom: true,
    depth: 1,
    scale: 1.1,
    repellingForce: 0.7, // Increased repulsion to spread nodes out
    centerForce: 0.2,    // Gentle pull to center
    linkDistance: 45,    // Clean link spacing between related notes
    fontSize: 0.6,
    opacityScale: 1,
    showTags: false,     // Keeps the local graph focused purely on note connections
    focusOnHover: true,
  },
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1,
    scale: 0.9,
    repellingForce: 0.8,
    centerForce: 0.2,
    linkDistance: 50,
    fontSize: 0.5,
    opacityScale: 1,
    showTags: true,      // Allows tag hubs in full garden view
    focusOnHover: true,
  },
}),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    gardenExplorer,
  ],
  right: [],
}