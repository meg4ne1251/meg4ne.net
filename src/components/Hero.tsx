import { useEffect, useState } from 'react';

interface Span {
  c: string;
  t: string;
}

const CODE_LINES: Span[][] = [
  [
    { c: '#4a9ef0', t: 'const ' },
    { c: 'var(--cy)', t: 'me' },
    { c: 'var(--t1)', t: ' = {' },
  ],
  [
    { c: 'var(--t2)', t: '  uni:    ' },
    { c: '#a5f3a0', t: '"電気通信大学"' },
    { c: 'var(--t2)', t: ',' },
  ],
  [
    { c: 'var(--t2)', t: '  circles:' },
    { c: '#a5f3a0', t: '"VLL, MMA"' },
    { c: 'var(--t2)', t: ',' },
  ],
  [
    { c: 'var(--t2)', t: '  hobby:  ' },
    { c: '#a5f3a0', t: '"server / 3D"' },
    { c: 'var(--t2)', t: ',' },
  ],
  [
    { c: 'var(--t2)', t: '  stack: [' },
    { c: '#a5f3a0', t: '"Proxmox"' },
    { c: 'var(--t2)', t: ', ...],' },
  ],
  [{ c: 'var(--t1)', t: '}' }],
];

const FULL = 'megane';

export default function Hero() {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setTyped(FULL.slice(0, ++i));
      if (i >= FULL.length) clearInterval(id);
    }, 72);
    return () => clearInterval(id);
  }, []);

  const typing = typed.length < FULL.length;

  return (
    <section
      style={{
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px clamp(24px,7vw,100px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dot grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.032) 1px,transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />
      {/* Cyan ambient */}
      <div
        style={{
          position: 'absolute',
          left: '-8%',
          top: '10%',
          width: '800px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(0,204,245,.05) 0%,transparent 62%)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="fade-in"
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '48px',
          alignItems: 'center',
          maxWidth: '1400px',
        }}
      >
        {/* Text */}
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: 'var(--t2)', marginBottom: '20px' }}>
            <span style={{ color: 'var(--t3)' }}>root@meg4ne:~# </span>
            <span style={{ color: 'var(--cy)' }}>whoami</span>
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(72px,11vw,152px)',
              fontWeight: 700,
              lineHeight: 0.85,
              letterSpacing: '-.055em',
              background: 'linear-gradient(145deg,var(--t1) 0%,var(--cy) 72%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '28px',
            }}
          >
            {typed}
            <span
              style={{
                WebkitTextFillColor: 'var(--cy)',
                animation: typing ? 'blink .9s step-end infinite' : 'none',
                opacity: typing ? 1 : 0,
              }}
            >
              _
            </span>
          </h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--t2)' }}>
              UEC · 3D Artist · Homelab
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['VLL', 'MMA'].map((c) => (
                <span
                  key={c}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--cy)',
                    border: '1px solid rgba(0,204,245,.28)',
                    padding: '3px 9px',
                    borderRadius: '2px',
                    background: 'rgba(0,204,245,.04)',
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Code card */}
        <div
          className="hero-code-card"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: 1.9,
            padding: '22px 26px',
            border: '1px solid rgba(0,204,245,.18)',
            borderRadius: '4px',
            background: 'rgba(12,16,24,.9)',
            boxShadow: '0 0 48px rgba(0,204,245,.07)',
            minWidth: '300px',
            whiteSpace: 'pre',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.6 }} />
            ))}
          </div>
          {CODE_LINES.map((line, i) => (
            <div key={i} style={{ display: 'flex', flexWrap: 'wrap' }}>
              {line.map((s, j) => (
                <span key={j} style={{ color: s.c }}>
                  {s.t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
