import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {},
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
    Component.Explorer({
      sortFn: (a, b) => {
        // Custom folder priority order
        const folderPriority: { [key: string]: number } = {
          "IT 지식들": 1,
          "Backend": 2,
          "트러블슈팅": 3,
          "DB": 4,
          "운영체제": 5,
          "네트워크": 6,
          "자바": 7
        }
        
        // Both are folders - use priority order
        if (a.isFolder && b.isFolder) {
          const aPriority = folderPriority[a.displayName] || 999
          const bPriority = folderPriority[b.displayName] || 999
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }
          
          // If same priority (or both not in priority list), sort alphabetically
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        
        // Both are files - sort alphabetically
        if (!a.isFolder && !b.isFolder) {
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        
        // One is folder, one is file - folders first
        if (a.isFolder && !b.isFolder) {
          return -1
        } else {
          return 1
        }
      }
    }),
  ],
  right: [
    Component.Graph(),
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
    Component.Explorer({
      sortFn: (a, b) => {
        // Custom folder priority order
        const folderPriority: { [key: string]: number } = {
          "IT 지식들": 1,
          "Backend": 2,
          "트러블슈팅": 3,
          "DB": 4,
          "운영체제": 5,
          "네트워크": 6,
          "자바": 7
        }
        
        // Both are folders - use priority order
        if (a.isFolder && b.isFolder) {
          const aPriority = folderPriority[a.displayName] || 999
          const bPriority = folderPriority[b.displayName] || 999
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }
          
          // If same priority (or both not in priority list), sort alphabetically
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        
        // Both are files - sort alphabetically
        if (!a.isFolder && !b.isFolder) {
          return a.displayName.localeCompare(b.displayName, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        }
        
        // One is folder, one is file - folders first
        if (a.isFolder && !b.isFolder) {
          return -1
        } else {
          return 1
        }
      }
    }),
  ],
  right: [],
}
