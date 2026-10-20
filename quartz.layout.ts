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
    Component.Explorer(),
  ],
  right: [
    Component.Graph({
  localGraph: {
    drag: true,
    zoom: true,
    depth: 1, // Depth of neighborhood links displayed (1 or 2)
    scale: 1.1,
    repelForce: 0.5, // How strongly nodes push each other away (default ~0.5)
    centerForce: 0.3, // Pull toward center
    linkDistance: 30, // Pixel length of connecting springs
    fontSize: 0.6,
    opacityScale: 1,
    removeTags: [], // Tags to hide completely from the graph
    showTags: true, // Whether tags display as interactive nodes
  },
  globalGraph: {
    drag: true,
    zoom: true,
    depth: -1, // -1 shows the entire vault network
    scale: 0.9,
    repelForce: 0.7, // Higher value spaces out crowded clusters
    centerForce: 0.2,
    linkDistance: 45,
    fontSize: 0.5,
    opacityScale: 1,
    removeTags: ["draft", "archive"], // Hide utility tags
    showTags: true,
  },
}),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
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
    Component.Explorer(),
  ],
  right: [],
}
