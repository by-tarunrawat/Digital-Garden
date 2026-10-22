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

// Reusable Explorer with strict Reader-First sorting and folder renaming
const gardenExplorer = Component.Explorer({
  title: "Explorer",
  folderDefaultState: "open",
  folderClickBehavior: "collapse",
  useSavedState: false,
  // 1. Force sort to execute BEFORE mapFn so folder names still have their 01/02/03 prefixes
  order: ["filter", "sort", "map"],
  filterFn: (node) => {
    const exclude = ["template", "templates", "tags"]
    const segment = String(node?.slugSegment ?? "").toLowerCase()
    return !exclude.includes(segment)
  },
  // 2. Sort folders strictly by our Reader-First rank
  sortFn: (a, b) => {
    const hasChildrenA = Boolean(a?.children && a.children.length > 0)
    const hasChildrenB = Boolean(b?.children && b.children.length > 0)

    // Keep folders grouped above standalone files
    if (hasChildrenA && !hasChildrenB) return -1
    if (!hasChildrenA && hasChildrenB) return 1

    if (hasChildrenA && hasChildrenB) {
      const getFolderRank = (node: typeof a): number => {
        const seg = String(node?.slugSegment ?? "").toLowerCase()
        const disp = String(node?.displayName ?? "").toLowerCase()

        // Rank 1: Completed works (03_Evergreen)
        if (seg.includes("03") || seg.includes("evergreen") || disp.includes("completed")) return 1
        // Rank 2: Works in progress (02_Seedling)
        if (seg.includes("02") || seg.includes("seedling") || disp.includes("work")) return 2
        // Rank 3: Thoughts (01_Seed)
        if (seg.includes("01") || seg.includes("seed") || disp.includes("thought")) return 3

        return 99
      }

      const rankA = getFolderRank(a)
      const rankB = getFolderRank(b)

      if (rankA !== rankB) {
        return rankA - rankB
      }
    }

    // Default alphabetical sort for notes within a folder
    const nameA = String(a?.displayName ?? a?.slugSegment ?? "")
    const nameB = String(b?.displayName ?? b?.slugSegment ?? "")
    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: "base" })
  },
  // 3. Rename display titles AFTER sorting has finished
  mapFn: (node) => {
    if (!node || typeof node.displayName !== "string") return

    // Strip "01_", "02_", etc.
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
        repelForce: 0.5,
        centerForce: 0.3,
        linkDistance: 30,
        fontSize: 0.6,
        opacityScale: 1,
        removeTags: [],
        showTags: true,
      },
      globalGraph: {
        drag: true,
        zoom: true,
        depth: -1,
        scale: 0.9,
        repelForce: 0.7,
        centerForce: 0.2,
        linkDistance: 45,
        fontSize: 0.5,
        opacityScale: 1,
        removeTags: ["draft", "archive"],
        showTags: true,
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