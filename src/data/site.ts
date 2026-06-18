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
  { g: 'Network', items: ['Juniper SRX', 'Allied Telesis', 'YAMAHA RTX', 'Cisco Catalyst', 'VyOS'] },
  { g: 'Tools', items: ['Obsidian', 'Bambu Lab', 'Claude Code'] },
];

/** Accent colour per tech group (Variant B). */
export const TECH_GROUP_COLORS: Record<string, string> = {
  Infrastructure: 'var(--cy)',
  '3D / Motion': '#a5f3fc',
  Network: '#fbbf24',
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
  ([platform, posts]) => posts.map((p) => ({ ...p, platform })),
);

export const MACHINES: Machine[] = [
  {
    name: 'HPE ProLiant ML350 Gen9',
    cpu: 'Intel Xeon E5-2620 v4 ×2',
    ram: '128GB DDR4 ECC',
    storage: 'NVMe 2TB + SAS HDD RAID10 2TB + SAS SSD 600GB',
    os: 'Proxmox VE 9.x',
    role: 'Hypervisor',
  },
  {
    name: 'Desktop',
    cpu: 'Intel Core i7-14700',
    ram: '32GB',
    storage: '1TB NVMe',
    os: 'Windows 11',
    role: 'Main Workstation (自作PC)',
  },
  { name: 'Laptop', cpu: 'Apple M1 Pro', ram: '32GB', storage: '1TB SSD', os: 'macOS', role: 'Mobile' },
];

export const SERVICES: Service[] = [
  { name: 'NetBox', desc: 'IPAM / DCIM 管理ツール', role: 'Infrastructure Management' },
  { name: 'Nextcloud', desc: 'セルフホストクラウドストレージ', role: 'Storage' },
  { name: 'GitLab CE', desc: 'セルフホスト Git サーバー', role: 'VCS / CI/CD' },
  { name: 'Zabbix', desc: 'ネットワーク・サーバー監視', role: 'Monitoring' },
  { name: 'Docker', desc: 'コンテナ管理プラットフォーム', role: 'Container' },
  { name: 'Minecraft Server', desc: 'マルチプレイ用ゲームサーバー', role: 'Game' },
  { name: 'Backup Server (PBS)', desc: 'Proxmox Backup Server によるバックアップ基盤', role: 'Backup' },
  { name: 'Nginx', desc: 'リバースプロキシ / Web サーバー', role: 'Network' },
  { name: 'Obsidian Self-Host', desc: 'セルフホスト Obsidian 同期サーバー', role: 'Storage' },
  { name: 'GNS3', desc: 'ネットワークエミュレーター', role: 'Lab' },
  { name: 'Kea', desc: 'DHCP サーバー', role: 'Network' },
  { name: 'CoreDNS', desc: 'DNS サーバー', role: 'Network' },
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
