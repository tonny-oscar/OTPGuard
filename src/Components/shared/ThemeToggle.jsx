import { useTheme } from '../../context/ThemeContext'
import { sound } from '../../utils/sound'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      onClick={() => { sound.toggle(); toggle() }}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
        fontSize: '.8rem', color: 'var(--text)', transition: 'all .2s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <span style={{ fontSize: '.8rem', fontWeight: 600 }}>{isLight ? 'Dark' : 'Light'} Mode</span>
    </button>
  )
}

