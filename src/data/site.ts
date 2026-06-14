/**
 * Site content data for meg4ne.net.
 *
 * Mirrors the data defined in the design prototype (meg4ne.net.html).
 * Values prefixed as placeholders should be replaced with real data over time.
 */

export type Platform = 'Qiita' | 'Zenn' | 'Note';

export interface TechGroup {
  /** Group label, e.g. "Infrastructure". */
  g: string;
  items: string[];
}

export interface BlogPost {
  /** Title. */
  t: string;
  /** Date (YYYY-MM-DD). */
  d: string;
  tags: string[];
}

export interface Machine {
  name: string;
  cpu: string;
  ram: string;
  storage: string;
  os: string;
  role: string;
}

export interface Service {
  name: string;
  desc: string;
  role: string;
}

export interface SiteLink {
  label: string;
  sub: string;
  href: string;
}

export const ACCENT = '#00ccf5';

export const TECH: TechGroup[] = [
  { g: '3D / Motion', items: ['Blender', 'MotionBuilder', 'Unity', 'C#', 'Vive MC'] },
  { g: 'Infrastructure', items: ['Proxmox', 'Docker', 'GitLab', 'Zabbix', 'Grafana', 'Cloudflare'] },
  { g: 'Tools', items: ['Obsidian', 'Bambu Lab', 'Claude Code'] },
];

/** Accent colour per tech group (Variant B). */
export const TECH_GROUP_COLORS: Record<string, string> = {
  Infrastructure: 'var(--cy)',
  '3D / Motion': '#a5f3fc',
  Tools: 'var(--t2)',
};

export const BLOGS: Record<Platform, BlogPost[]> = {
  Qiita: [
    { t: 'ProxmoxでVMを自動プロビジョニングする方法', d: '2025-03-12', tags: ['Proxmox', 'Infra'] },
    { t: 'ZabbixとGrafanaで自宅監視ダッシュボードを構築', d: '2025-01-28', tags: ['Zabbix', 'Grafana'] },
    { t: 'BlenderのPython APIで作業を自動化する', d: '2024-11-15', tags: ['Blender', 'Python'] },
  ],
  Zenn: [
    { t: 'Cloudflare TunnelでSSH over HTTPを実現する', d: '2025-04-02', tags: ['Cloudflare', 'SSH'] },
    { t: 'UnityでViveモーションキャプチャを活用する', d: '2024-12-20', tags: ['Unity', 'MoCap'] },
  ],
  Note: [
    { t: '自宅サーバーを始めて1年、やってよかったこと', d: '2025-02-14', tags: ['Server', 'Life'] },
    { t: '電通大のサークルと3Dモデリングの話', d: '2024-10-03', tags: ['Life'] },
  ],
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  Qiita: '#55c500',
  Zenn: '#3ea8ff',
  Note: '#41c9b4',
};

export interface PostWithPlatform extends BlogPost {
  platform: Platform;
}

/** Every post, flattened with its platform. */
export const ALL_POSTS: PostWithPlatform[] = (Object.entries(BLOGS) as [Platform, BlogPost[]][]).flatMap(
  ([platform, posts]) => posts.map((p) => ({ ...p, platform }))
);

/** One featured post per platform (used on the home page). */
export const FEATURED_POSTS: PostWithPlatform[] = (Object.entries(BLOGS) as [Platform, BlogPost[]][]).map(
  ([platform, posts]) => ({ ...posts[0], platform })
);

export const MACHINES: Machine[] = [
  { name: 'Server', cpu: 'Intel Core i5-12400', ram: '32GB DDR4', storage: '500GB NVMe + 4TB HDD', os: 'Proxmox VE 8.x', role: 'Hypervisor' },
  { name: 'Desktop', cpu: 'AMD Ryzen 9 5900X', ram: '64GB DDR4', storage: '2TB NVMe', os: 'Windows 11', role: 'Main Workstation' },
  { name: 'Laptop', cpu: 'Intel Core i7', ram: '16GB', storage: '512GB NVMe', os: 'Windows 11 / Ubuntu', role: 'Mobile' },
];

export const SERVICES: Service[] = [
  { name: 'GitLab CE', desc: 'セルフホスト Git サーバー', role: 'VCS / CI/CD' },
  { name: 'Grafana', desc: 'メトリクス可視化ダッシュボード', role: 'Monitoring' },
  { name: 'Zabbix', desc: 'ネットワーク・サーバー監視', role: 'Monitoring' },
  { name: 'Docker / Portainer', desc: 'コンテナ管理プラットフォーム', role: 'Container' },
  { name: 'Cloudflare Tunnel', desc: '外部公開用セキュアトンネル', role: 'Network' },
];

export const LINKS: SiteLink[] = [
  { label: 'GitLab', sub: '@megane', href: 'https://gitlab.com' },
  { label: 'X / Twitter', sub: '@megane', href: 'https://x.com' },
  { label: 'Email', sub: 'me@meg4ne.net', href: 'mailto:me@meg4ne.net' },
];

export const PROFILE: [string, string][] = [
  ['所属', '電気通信大学'],
  ['サークル', 'VLL, MMA'],
  ['趣味', '自宅サーバー管理 / 3Dモデル制作'],
];
