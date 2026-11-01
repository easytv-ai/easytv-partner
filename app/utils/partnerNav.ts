export interface ConsoleNavLink {
  to: string
  labelKey: string
  icon: string
  /** 仅已通过审核的伙伴可见 */
  approvedOnly?: boolean
  /** 已通过审核后隐藏（申请页） */
  hideWhenApproved?: boolean
}

export interface ConsoleNavGroup {
  titleKey: string
  links: ConsoleNavLink[]
}

/** 代理商后台侧栏 */
export const PARTNER_NAV_GROUPS: ConsoleNavGroup[] = [
  {
    titleKey: 'nav.groupOverview',
    links: [
      { to: '/', labelKey: 'nav.dashboard', icon: 'i-lucide-layout-dashboard', approvedOnly: true },
      { to: '/customers', labelKey: 'nav.customers', icon: 'i-lucide-users', approvedOnly: true },
    ],
  },
  {
    titleKey: 'nav.groupMoney',
    links: [
      { to: '/billing', labelKey: 'nav.billing', icon: 'i-lucide-wallet', approvedOnly: true },
      { to: '/bonus-code', labelKey: 'nav.bonusCode', icon: 'i-lucide-ticket', approvedOnly: true },
    ],
  },
  {
    titleKey: 'nav.groupGrowth',
    links: [
      { to: '/materials', labelKey: 'nav.materials', icon: 'i-lucide-megaphone', approvedOnly: true },
    ],
  },
  {
    titleKey: 'nav.groupAccount',
    links: [
      { to: '/apply', labelKey: 'nav.apply', icon: 'i-lucide-file-badge', hideWhenApproved: true },
      { to: '/settings', labelKey: 'nav.settings', icon: 'i-lucide-settings', approvedOnly: true },
    ],
  },
]

export function filterNavGroups(groups: ConsoleNavGroup[], approved: boolean): ConsoleNavGroup[] {
  return groups
    .map(group => ({
      ...group,
      links: group.links.filter(link => (approved ? !link.hideWhenApproved : !link.approvedOnly)),
    }))
    .filter(group => group.links.length > 0)
}
