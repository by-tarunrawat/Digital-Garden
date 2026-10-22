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

// Reusable Explorer configuration for both Content and List layouts
const configuredExplorer = Component.Explorer({
  title: "Explorer",
  folderDefaultState: "open",
  folderClickBehavior: "collapse",
  useSavedState: true,
  // 1. Hide templates and internal tags
  filterFn: (node) => {
    const exclude = ["template", "templates", "tags"]
    return !exclude.includes(node.slugSegment.toLowerCase())
  },
  // 2. Format and rename display titles
  mapFn: (node) => {
    node.displayName = node.displayName.replace(/^\d+[_-\s]*/, "")

    const customNames: Record<string, string> = {
      "seed": "Thoughts",
      "seeds": "Thoughts",
      "01_seed": "Thoughts",
      "seedling": "Work in Progress",
      "seedlings": "Work in Progress",
      "02_seedling": "Work in Progress",
      "evergreen": "Completed Essays",
      "03_evergreen": "Completed Essays",
    }

    const keyByDisplay = node.displayName.toLowerCase().trim()
    const keyBySlug = node.slugSegment.toLowerCase().trim()

    if (customNames[keyByDisplay]) {
      node.displayName = customNames[keyByDisplay]
    } else if (customNames[keyBySlug]) {
      node.displayName = customNames[keyBySlug]
    }
  },
// 3. Enforce Reader-First folder ordering
  sortFn: (a, b) => {
    // Keep folders on top of individual files
    if (a.isFolder !== b.isFolder) {
      return a.isFolder ? -1 : 1
    }

    // Rank 1: Evergreen / Completed Essays
    // Rank 2: Seedling / Work in Progress
    // Rank 3: Seed / Thoughts
    const getRank = (node: typeof a) => {
      const slug = (node.slugSegment ?? "").toLowerCase().trim()
      const display = (node.displayName ?? "").toLowerCase().trim()

      if (slug.includes("evergreen") || display.includes("completed")) return 1
      if (slug.includes("seedling") || display.includes("work")) return 2
      if (slug.includes("seed") || display.includes("thought")) return 3
      return 99
    }
const rankA = getRank(a)
    const rankB = getRank(b)

    if (rankA !== rankB) {
      return rankA - rankB
    }

    // Default alphabetical sort for items with the same rank
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  },

    const order: Record<string, number> = {
      "03_evergreen": 1,
      "evergreen": 1,
      "02_seedling": 2,
      "seedling": 2,
      "seedlings": 2,
      "01_seed": 3,
      "seed": 3,
      "seeds": 3,
    }

    const orderA = order[a.slugSegment.toLowerCase()] ?? 99
    const orderB = order[b.slugSegment.toLowerCase()] ?? 99

    if (orderA !== orderB) {
      return orderA - orderB
    }

    // Default alphabetical sort for items within the same bucket
    return a.displayName.localeCompare(b.displayName, undefined, {
      numeric: true,
      sensitivity: "base",
    })
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
    configuredExplorer,
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
    configuredExplorer,
  ],
  right: [],
}