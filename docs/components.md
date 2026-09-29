# Components

Shared layout and navigation components in `src/app/components/`.

---

## `RootLayout`

The authenticated layout shell. Renders a two-column flex layout:
- **Left:** `<Sidebar>` (navigation)
- **Right:** `<Outlet />` (nested route content)

**Usage:** Used in `routes.tsx` as the layout route element for `/admin-home`.

---

## `ProtectedRoute`

Route guard that enforces authentication and admin-only access.

**Behavior:**
1. Returns `null` while loading (checking auth state)
2. Shows error text if an auth error exists
3. Redirects to `/` if unauthenticated
4. Redirects to `/` if user is not an Admin
5. Renders children if authorized

**Usage:** Wraps the `/admin-home` route in `routes.tsx`.

---

## `Sidebar`

The main navigation sidebar. Displays:

### Navigation Links
- Home (`/admin-home`)
- Analytics (`/admin-home/analytics`)
- Distribution (`/admin-home/data`)
- Settings (`/admin-home/settings`)

### Notification Inbox
- Bell icon with unread count badge
- Paginated notification list
- Select all / mark as read / delete actions
- Plays a Web Audio notification sound when opening

### Logout Button
- Signs out the user and redirects to login

---

## `ImageWithFallback`

An image component that shows a fallback SVG placeholder if the image fails to load.

**Props:** `React.ImgHTMLAttributes<HTMLImageElement>`

**Usage:** Standalone utility component available for use across the app.

---

## UI Component Library (`src/app/components/ui/`)

A full set of shadcn/ui primitives is available. These are pre-built, accessible React components:

| Category | Components |
|----------|-----------|
| **Form** | Button, Input, Textarea, Label, Checkbox, Switch, RadioGroup, Select, Slider, InputOTP, Toggle, ToggleGroup, Form |
| **Overlay** | Dialog, AlertDialog, Popover, Tooltip, HoverCard, Sheet, Drawer |
| **Navigation** | DropdownMenu, ContextMenu, Menubar, NavigationMenu, Pagination, Breadcrumb |
| **Layout** | Card, Accordion, Collapsible, Resizable, ScrollArea, Separator, AspectRatio, Sidebar |
| **Data Display** | Table, Tabs, Chart, Carousel, Command |
| **Feedback** | Alert, Badge, Avatar, Progress, Skeleton, Sonner (Toaster) |

### Utility Files

| File | Export | Description |
|------|--------|-------------|
| `utils.ts` | `cn()` | Class name merger (clsx + tailwind-merge) |
| `use-mobile.ts` | `useIsMobile()` | Hook detecting mobile viewport (breakpoint: 768px) |
