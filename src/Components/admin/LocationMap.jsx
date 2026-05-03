import { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

// Extended country coords
const COORDS = {
  'Kenya':           [-1.286389,  36.817223],
  'Uganda':          [0.347596,   32.582520],
  'Tanzania':        [-6.369028,  34.888822],
  'Nigeria':         [9.081999,    8.675277],
  'Ghana':           [7.946527,   -1.023194],
  'South Africa':    [-30.559482, 22.937506],
  'Ethiopia':        [9.145000,   40.489673],
  'Rwanda':          [-1.940278,  29.873888],
  'Zambia':          [-13.133897, 27.849332],
  'Zimbabwe':        [-19.015438, 29.154857],
  'Mozambique':      [-18.665695, 35.529562],
  'Senegal':         [14.497401, -14.452362],
  'Ivory Coast':     [7.539989,   -5.547080],
  'Cameroon':        [3.848033,   11.502075],
  'Egypt':           [26.820553,  30.802498],
  'Morocco':         [31.791702,  -7.092620],
  'Tunisia':         [33.886917,   9.537499],
  'Algeria':         [28.033886,   1.659626],
  'Sudan':           [12.862807,  30.217636],
  'Angola':          [-11.202692, 17.873887],
  'Botswana':        [-22.328474, 24.684866],
  'Namibia':         [-22.957640, 18.490410],
  'Madagascar':      [-18.766947, 46.869107],
  'Malawi':          [-13.254308, 34.301525],
  'United States':   [37.090240, -95.712891],
  'United Kingdom':  [55.378051,  -3.435973],
  'Germany':         [51.165691,  10.451526],
  'France':          [46.227638,   2.213749],
  'India':           [20.593684,  78.962880],
  'China':           [35.861660, 104.195397],
  'Brazil':          [-14.235004,-51.925280],
  'Canada':          [56.130366, -106.346771],
  'Australia':       [-25.274398, 133.775136],
  'Unknown':         [0, 20],
}

function loadLeaflet() {
  return new Promise(resolve => {
    if (window.L) { resolve(window.L); return }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    document.head.appendChild(script)
  })
}

export default function LocationMap({ locations = [] }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const { isDark } = useTheme()

  useEffect(() => {
    if (!locations.length || !mapRef.current) return

    loadLeaflet().then(L => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }

      const map = L.map(mapRef.current, {
        center: [5, 25],
        zoom: 3,
        zoomControl: true,
        scrollWheelZoom: false,
      })
      instanceRef.current = map

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      L.tileLayer(tileUrl, {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 18,
      }).addTo(map)

      const dotColor = isDark ? '#00ff88' : '#00b860'

      locations.forEach(loc => {
        const coords = COORDS[loc.country] || COORDS['Unknown']
        const radius = Math.max(20000, (loc.pct / 100) * 800000)

        L.circle(coords, {
          color: dotColor,
          fillColor: dotColor,
          fillOpacity: 0.15,
          weight: 1.5,
          radius,
        }).addTo(map).bindPopup(
          `<div style="font-family:system-ui;font-size:13px;color:#1a202c;min-width:120px">
            <strong style="font-size:14px">${loc.country}</strong><br/>
            <span style="color:#4a5568">${loc.logins ?? loc.pct + '%'} logins</span><br/>
            <span style="color:#00b860;font-weight:700">${loc.pct}% of traffic</span>
          </div>`
        )

        const dot = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${dotColor};border:2px solid #fff;box-shadow:0 0 10px ${dotColor}88"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
        L.marker(coords, { icon: dot }).addTo(map)
          .bindTooltip(`${loc.country}: ${loc.pct}%`, { permanent: false, direction: 'top' })
      })

      // Force Leaflet to recalculate size after DOM paint
      setTimeout(() => map.invalidateSize(), 100)
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [locations, isDark])

  const sorted = [...locations].sort((a, b) => b.pct - a.pct)
  const maxPct = sorted[0]?.pct || 1

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginTop: 20 }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>Login Locations</h3>
        <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>Top {locations.length} regions</span>
      </div>

      {locations.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text)', opacity: .5 }}>No location data yet</div>
      ) : (
        <>
          <div ref={mapRef} style={{ height: 340, width: '100%', borderRadius: '0 0 0 0' }} />

          {/* Ranked list */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: .8, marginBottom: 12 }}>
              Traffic by Country
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.map((loc, i) => (
                <div key={loc.country}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 20, height: 20, borderRadius: '50%', background: i === 0 ? 'var(--green)' : i === 1 ? '#facc15' : i === 2 ? '#fb923c' : 'var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: i < 3 ? '#0a0e1a' : 'var(--text)', flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--heading)' }}>{loc.country}</span>
                    </span>
                    <span style={{ fontWeight: 700, color: i === 0 ? 'var(--green)' : 'var(--heading)' }}>
                      {loc.logins != null ? `${loc.logins} logins` : ''} <span style={{ color: 'var(--text)', fontWeight: 400 }}>({loc.pct}%)</span>
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      width: `${(loc.pct / maxPct) * 100}%`,
                      height: '100%',
                      background: i === 0 ? 'var(--green)' : i === 1 ? '#facc15' : i === 2 ? '#fb923c' : 'var(--blue)',
                      borderRadius: 4,
                      transition: 'width .5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
