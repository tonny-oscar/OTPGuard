export function Skeleton({ width = '100%', height = 14, radius = 6, style = {} }) {
  return (
    <div className="skeleton" style={{ width, height, borderRadius: radius, ...style }} />
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
      <Skeleton height={20} width="50%" radius={6} style={{ marginBottom: 16 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === lines - 1 ? '70%' : '100%'} style={{ marginBottom: 10 }} />
      ))}
    </div>
  )
}

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <Skeleton height={32} width={32} radius={8} style={{ marginBottom: 12 }} />
          <Skeleton height={28} width="60%" style={{ marginBottom: 8 }} />
          <Skeleton height={12} width="80%" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === 0 ? '30%' : '20%'} />
      ))}
    </div>
  )
}
