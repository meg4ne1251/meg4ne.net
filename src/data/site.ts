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
  /** Link to the original article. */
  href: string;
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
    {
      t: 'WindowsユーザーがMacBookに買い換えた話',
      d: '2026-03-19',
      tags: ['Windows', 'Blender', 'MacBook', 'Motionbuilder'],
      href: 'https://qiita.com/meg4ne1251/items/3e7e54be9a8f35b7e69e',
    },
  ],
  Zenn: [],
  Note: [
    {
      t: '自宅鯖と振り返る2025',
      d: '2025-12-12',
      tags: ['ネットワーク', 'サーバー', '逸般の誤家庭', '自宅鯖'],
      href: 'https://note.com/hot_rue8555/n/ndc0d3d8d04fa',
    },
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
  { label: 'GitHub', sub: 'https://github.com/meg4ne1251', href: 'https://github.com/meg4ne1251' },
  { label: 'X / Twitter', sub: 'https://x.com/meg4ne1251', href: 'https://x.com/meg4ne1251' },
  { label: 'Email', sub: 'yuta@meg4ne.net', href: 'mailto:yuta@meg4ne.net' },
];

export const PROFILE: [string, string][] = [
  ['所属', '電気通信大学'],
  ['趣味', '自宅サーバー管理 / 3Dモデル制作'],
];

export const CIRCLES: SiteLink[] = [
  { label: 'バーチャルライブ研究会', sub: '', href: 'https://vll.jp/' },
  { label: 'MMA', sub: '', href: 'https://wiki.mma.club.uec.ac.jp/' },
];
