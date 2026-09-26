// Maps mock notifications to the Graphite NotificationItem shape (TopBar → NotificationCenter).
import type { NotificationItem } from '@sgs/graphite';
import { TODAY, type Notification } from '@/mock';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toNotificationItem(n: Notification): NotificationItem {
  const day = n.createdAt.slice(0, 10);
  const time = n.createdAt.slice(11, 16);
  const [, m, d] = day.split('-').map(Number);
  return {
    id: n.id, type: n.type, tone: n.tone, title: n.title, body: n.body, ref: n.ref, href: n.href,
    unread: !n.readAt,
    group: day === TODAY ? 'Today' : 'Earlier',
    time: day === TODAY ? time : `${String(d).padStart(2, '0')} ${MON[m - 1]}`,
  };
}
