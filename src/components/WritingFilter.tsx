import { useState } from 'react';
import { ALL_POSTS, PLATFORM_COLORS, type Platform, type PostWithPlatform } from '../data/site';

type Filter = 'All' | Platform;
const TABS: Filter[] = ['All', 'Qiita', 'Zenn', 'Note'];

function ArticleThumb({ platform, uid }: { platform: Platform; uid: string }) {
  const c = PLATFORM_COLORS[platform];
  const pid = `stripe-${uid}`;
  return (
    <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--bg3)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
        <defs>
          <pattern id={pid} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="12" fill="rgba(255,255,255,.022)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${pid})`} />
        <rect width="100%" height="100%" fill={`${c}08`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, opacity: 0.45 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--t3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>article image</span>
      </div>
    </div>
  );
}

function ArticleCard({ post, uid }: { post: PostWithPlatform; uid: string }) {
  const [hov, setHov] = useState(false);
  const dot = PLATFORM_COLORS[post.platform];
  return (
    <a
      href={post.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `1px solid ${hov ? 'rgba(255,255,255,.14)' : 'var(--bd)'}`,
        borderRadius: '4px',
        overflow: 'hidden',
        background: 'var(--bg2)',
        cursor: 'pointer',
        transition: 'border-color .15s',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
      }}
    >
      <ArticleThumb platform={post.platform} uid={uid} />
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--t2)' }}>{post.platform}</span>
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 400, color: 'var(--t1)', lineHeight: 1.6, flex: 1 }}>{post.t}</p>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '4px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--t2)' }}>{post.d}</span>
          {post.tags.map((tag) => (
            <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--t1)', border: '1px solid rgba(255,255,255,.1)', padding: '1px 6px', borderRadius: '2px', opacity: 0.65 }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

export default function WritingFilter() {
  const [filter, setFilter] = useState<Filter>('All');
  const filtered = filter === 'All' ? ALL_POSTS : ALL_POSTS.filter((p) => p.platform === filter);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px,5vw,64px)', fontWeight: 700, letterSpacing: '-.04em', color: 'var(--t1)', margin: 0 }}>Writing</h1>
        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {TABS.map((f) => {
            const on = filter === f;
            const dot = f === 'All' ? undefined : PLATFORM_COLORS[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: on ? 'rgba(0,204,245,.07)' : 'transparent',
                  border: `1px solid ${on ? 'var(--cy)' : 'var(--bd)'}`,
                  color: on ? 'var(--cy)' : 'var(--t2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  padding: '7px 16px',
                  cursor: 'pointer',
                  borderRadius: '3px',
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {dot && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot, display: 'inline-block' }} />}
                {f}
              </button>
            );
          })}
        </div>
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
        {filtered.map((post, i) => (
          <ArticleCard key={`${post.platform}-${i}`} post={post} uid={`wp-${filter}-${i}`} />
        ))}
      </div>
    </>
  );
}
