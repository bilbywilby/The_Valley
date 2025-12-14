# Lehigh Valley Master Intelligence Feed Index

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/lehigh-valley-master-intelligence-feed-index)

A professional, visually stunning, and high-performance digital directory for the Lehigh Valley Master Intelligence Feed. This application serves as a central index for over 140+ categorized RSS and Atom feeds relevant to the Lehigh Valley region. It transforms the raw data into an elegant, searchable, and interactive user interface featuring categorized sidebar navigation, real-time search filtering, one-click URL copying, and OPML export for easy import into RSS readers.

## Features

- **Categorized Navigation**: Collapsible sidebar with all feed categories (News, Government, Business, Education, Safety, and more) and item counters.
- **Real-Time Search**: Instant filtering across all 140+ feeds with debounced input for smooth performance.
- **Feed Cards**: Beautiful, responsive cards displaying feed titles and truncated URLs with one-click copy functionality and success toasts.
- **OPML Export**: Download the complete feed collection as a valid OPML file for seamless import into Feedly, Inoreader, or any RSS reader.
- **Visual Excellence**: Modern glassmorphism effects, smooth animations (Framer Motion), hover states, and responsive design (mobile-first).
- **Performance Optimized**: Fully client-side with hardcoded data for zero latency; no external API calls.
- **Accessibility & Polish**: Keyboard navigation, ARIA labels, high contrast, and micro-interactions.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **UI Library**: shadcn/ui (Radix UI primitives), Tailwind CSS 3
- **Icons & Animations**: Lucide React, Framer Motion
- **State & Utils**: Zustand, clsx, tailwind-merge
- **Notifications**: Sonner (Toaster)
- **Deployment**: Cloudflare Workers & Pages
- **Other**: React Query, Zod, Date-fns

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager)
- [Node.js](https://nodejs.org/) (v18+ for fallback)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare deployment)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd lv-feed-index
   ```

2. Install dependencies:
   ```
   bun install
   ```

### Development

1. Start the development server:
   ```
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view in the browser.

2. Lint the codebase:
   ```
   bun lint
   ```

### Build for Production

```
bun build
```

Preview the production build:
```
bun preview
```

## Usage

- **Browse Feeds**: Scroll through categorized sections or use the sidebar to jump to specific categories (e.g., "Safety - Police & Courts").
- **Search**: Type in the global search bar to filter feeds instantly (e.g., "Police" or "Airport").
- **Copy Feed URL**: Click "Copy URL" on any feed card. A green toast confirms the copy.
- **Export OPML**: Click "Download Full OPML" in the header to get the complete file for your RSS reader.

The app is fully responsive and works flawlessly on mobile, tablet, and desktop.

## Deployment

Deploy to Cloudflare Workers & Pages with a single command:

```
bun run deploy
```

This builds the app and deploys via Wrangler. Ensure you have a Cloudflare account and API token configured:

```
wrangler login
wrangler deploy
```

For custom domains or advanced config, edit `wrangler.jsonc` (do not modify forbidden sections).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/bilbywilby/lehigh-valley-master-intelligence-feed-index)

## Contributing

1. Fork the project.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.