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
const configuredExplorer = Component.Explorer({
  title: "Explorer",
  folderDefaultState: "open",
  folderClickBehavior: "collapse",
  useSavedState: true,
  // 1. Hide templates, drafts, and tags
  filterFn: (node) => {
    const exclude = ["template", "templates", "tags"]
    return !exclude.includes(node.slugSegment.toLowerCase())
  },
  // 2. Format display titles
  mapFn: (node) => {
    node.displayName = node.displayName.replace(/^\d+[_-\s]*/, "")

    const customNames: Record<string, string> = {
      "seed": "Thoughts",
      "seeds": "Thoughts",
      "01_seed": "Thoughts",
      "seedling": "Works in progress",
      "seedlings": "Works in progress",
      "02_seedling": "Works in progress",
      "evergreen": "Completed works",
      "03_evergreen": "Completed works",
    }

    const keyByDisplay = node.displayName.toLowerCase().trim()
    const keyBySlug = node.slugSegment.toLowerCase().trim()

    if (customNames[keyByDisplay]) {
      node.displayName = customNames[keyByDisplay]
    } else if (customNames[keyBySlug]) {
      node.displayName = customNames[keyBySlug]
    }
  },
  // 3. Enforce Reader-First sorting: Completed works -> Works in progress -> Thoughts
  sortFn: (a, b) => {
    if (a.isFolder !== b.isFolder) {
      return a.isFolder ? -1 : 1
    }

    const rankOrder: Record<string, number> = {
      // 1. Completed works (Evergreen)
      "completed works": 1,
      "completed essays": 1,
      "03_evergreen": 1,
      "evergreen": 1,

      // 2. Works in progress (Seedlings)
      "works in progress": 2,
      "work in progress": 2,
      "02_seedling": 2,
      "seedling": 2,
      "seedlings": 2,

      // 3. Thoughts (Seeds)
      "thoughts": 3,
      "thought": 3,
      "01_seed": 3,
      "seed": 3,
      "seeds": 3,
    }

    const nameA = String(a.displayName || a.slugSegment || "").toLowerCase().trim()
    const nameB = String(b.displayName || b.slugSegment || "").toLowerCase().trim()

    const rankA = rankOrder[nameA] ?? 99
    const rankB = rankOrder[nameB] ?? 99

    if (rankA !== rankB) {
      return rankA - rankB
    }

    return String(a.displayName || "").localeCompare(String(b.displayName || ""), undefined, {
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