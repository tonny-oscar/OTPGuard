import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '56px 20px 28px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--heading)', marginBottom: 14 }}>
              OTP<span style={{ color: 'var(--green)' }}>Guard</span>
            </div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.75, color: 'var(--text)', marginBottom: 16 }}>
              Multi-factor authentication built for developers. Protect every login with SMS, email, or authenticator app verification.
            </p>
            <p style={{ fontSize: '.8rem', color: 'var(--text)', opacity: .6 }}>Nairobi, Kenya</p>
          </div>

          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Product</div>
            {[
              { label: 'Features', to: '/features' },
              { label: 'How It Works', to: '/how-it-works' },
              { label: 'Pricing', to: '/pricing' },
              { label: 'Documentation', to: '/docs' },
              { label: 'API Reference', to: '/api-docs' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 10 }}>
                <Link to={l.to} style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.9rem', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--green)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</div>
            {[
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Service', to: '/terms' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 10 }}>
                <Link to={l.to} style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.9rem', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--green)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Company</div>
            {[
              { label: 'About Us', to: '/about' },
              { label: 'FAQ', to: '/faq' },
              { label: 'Contact Us', to: '/contact' },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 10 }}>
                <Link to={l.to} style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '.9rem', transition: 'color .2s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--green)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text)'}
                >{l.label}</Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ color: 'var(--heading)', fontWeight: 600, marginBottom: 16, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: 1 }}>Contact</div>
            <p style={{ fontSize: '.9rem', color: 'var(--text)', marginBottom: 8 }}>otpguard26@gmail.com</p>
            <p style={{ fontSize: '.9rem', color: 'var(--text)', marginBottom: 16 }}>+254 794 886 149</p>
            <a href="mailto:hello@otpguard.co.ke" className="btn-outline" style={{ padding: '8px 18px', fontSize: '.85rem', display: 'inline-block' }}>
              Get in Touch
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: '.85rem', color: 'var(--text)', opacity: .6 }}>
            &copy; {new Date().getFullYear()} OTPGuard. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/privacy" style={{ fontSize: '.82rem', color: 'var(--text)', textDecoration: 'none', opacity: .6 }}>Privacy</Link>
            <Link to="/terms"   style={{ fontSize: '.82rem', color: 'var(--text)', textDecoration: 'none', opacity: .6 }}>Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
