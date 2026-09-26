# Graphite DS — changes to port

DS version: **1790347709-dd39** (published 25 Sep 2026)
Source: https://claude.ai/artifact/CEneLQNFxsQuEaagfERSqo

## TopBar — app hooks (design questions Q25, Q26)

All props are optional. Without them TopBar renders and behaves exactly as before, so no screen changes.

| Prop | Type | Behaviour |
|---|---|---|
| `onSignOut` | `() => void` | Called on **Sign out** click; the link's default navigation is prevented when this is set (UC-AUTH-002). |
| `signOutHref` | `string` | Href for Sign out when `onSignOut` is not set. Default `#`. |
| `signOutLabel` | `string` | Default `"Sign out"`. |
| `accountLinks` | `{ label: string; href?: string; onClick?: () => void }[]` | Replaces the default items **Profile, Settings**. Sign out is always rendered last. `onClick` prevents default navigation. |
| `onNotificationOpen` | `(item: NotificationItem) => void` | Forwarded to `NotificationCenter.onOpen`. Called when a notification is clicked (UC-NTF-002). |
| `onMarkAllRead` | `() => void` | Forwarded to `NotificationCenter.onMarkAllRead`. |
| `onNotificationsLoadMore` | `() => void` | Forwarded to `NotificationCenter.onLoadMore` ("Show older notifications"). |

Reference implementation: `components/bundle.js` → `function TopBar`. Types: `components/index.d.ts` → `TopBarProps`. Docs: `components/TopBar/README.md`.

### How to port
1. In the TopBar port, replace the three hard-coded account links with `accountLinks` (default `[{label:'Profile'},{label:'Settings'}]`) + a Sign out link wired to `onSignOut` / `signOutHref` / `signOutLabel`.
2. Pass `onOpen={onNotificationOpen}`, `onMarkAllRead={onMarkAllRead}`, `onLoadMore={onNotificationsLoadMore}` to `NotificationCenter`.
3. Add the fields to `TopBarProps`.
4. Re-run the port-equals-dist check against the new `components/bundle.js` in this folder.
5. In the app, remove the Phase 3 click-capture TODOs and use the props.

## Everything else in this folder
`graphite/` is a full copy of the DS at this version (tokens + components + READMEs) so the port can be diffed against a single snapshot.
