import { useEffect, useRef } from 'react'

// Country name → approximate lat/lng
const COORDS = {
  'Kenya':        [-1.286389, 36.817223],
  'Uganda':       [0.347596,  32.582520],
  'Tanzania':     [-6.369028, 34.888822],
  'Nigeria':      [9.081999,  8.675277],
  'Ghana':        [7.946527,  -1.023194],
  'South Africa': [-30.559482, 22.937506],
  'Ethiopia':     [9.145000,  40.489673],
  'Rwanda':       [-1.940278, 29.873888],
  'Unknown':      [0, 20],
}

function loadLeaflet() {
  return new Promise(resolve => {
    if (window.L) { resolve(window.L); return }

    const link = document.createElement('link')
    link.rel  = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => resolve(window.L)
    document.head.appendChild(script)
  })
}

export default function LocationMap({ locations = [] }) {
  const mapRef     = useRef(null)
  const instanceRef = useRef(null)

  useEffect(() => {
    if (!locations.length) return

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

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 18,
      }).addTo(map)

      locations.forEach(loc => {
        const coords = COORDS[loc.country] || COORDS['Unknown']
        const radius = Math.max(20000, (loc.pct / 100) * 800000)

        // Pulse circle
        L.circle(coords, {
          color:       '#00ff88',
          fillColor:   '#00ff88',
          fillOpacity: 0.15,
          weight:      1.5,
          radius,
        }).addTo(map).bindPopup(
          `<div style="font-family:system-ui;font-size:13px;color:#0a0e1a">
            <strong>${loc.country}</strong><br/>
            ${loc.logins ?? loc.pct + '%'} logins
          </div>`
        )

        // Dot marker
        const dot = L.divIcon({
          className: '',
          html: `<div style="width:10px;height:10px;border-radius:50%;background:#00ff88;border:2px solid #fff;box-shadow:0 0 8px #00ff88"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })
        L.marker(coords, { icon: dot }).addTo(map)
          .bindTooltip(`${loc.country}: ${loc.pct}%`, { permanent: false, direction: 'top' })
      })
    })

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [locations])

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--heading)', fontWeight: 600 }}>️ Login Locations</h3>
        <span style={{ fontSize: '.75rem', color: 'var(--text)' }}>Top {locations.length} regions</span>
      </div>
      {locations.length === 0 ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text)', opacity: .5 }}>No location data yet</div>
      ) : (
        <div ref={mapRef} style={{ height: 340, width: '100%' }} />
      )}
    </div>
  )
}

