import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly when you create an account, including your name, email address, mobile phone number, and company name. We also collect usage data generated through your use of the platform, including OTP logs, device identifiers, IP addresses, and login timestamps. Payment information is processed by our payment providers and is not stored on our servers.`
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to provide, maintain, and improve the OTPGuard platform; to process transactions and send related information; to send technical notices, security alerts, and support messages; to respond to your comments and questions; to monitor and analyse usage patterns and trends; and to detect, investigate, and prevent fraudulent transactions and other illegal activities.`
  },
  {
    title: '3. Data Sharing and Disclosure',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with third-party service providers who assist us in operating the platform, conducting our business, or serving our users, provided those parties agree to keep this information confidential. We may also disclose your information when required by law or to protect the rights, property, or safety of OTPGuard, our users, or others.`
  },
  {
    title: '4. Data Retention',
    content: `We retain your account information for as long as your account is active or as needed to provide you services. OTP logs and audit records are retained for a minimum of 90 days and a maximum of 24 months, depending on your subscription plan. You may request deletion of your account and associated data at any time by contacting us at otpguard26@gmail.com.`
  },
  {
    title: '5. Security',
    content: `We implement industry-standard security measures to protect your information, including encryption of data in transit using TLS 1.2 or higher, encryption of sensitive data at rest, access controls limiting data access to authorised personnel, and regular security audits. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.`
  },
  {
    title: '6. Your Rights (GDPR)',
    content: `If you are located in the European Economic Area, you have the right to access, correct, or delete your personal data; the right to restrict or object to our processing of your data; the right to data portability; and the right to withdraw consent at any time. To exercise these rights, contact us at otpguard26@gmail.com. We will respond to your request within 30 days.`
  },
  {
    title: '7. Cookies',
    content: `We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept cookies, some portions of our platform may not function properly.`
  },
  {
    title: '8. Third-Party Services',
    content: `Our platform integrates with third-party SMS and email delivery providers to send OTP codes on your behalf. These providers process phone numbers and email addresses solely for the purpose of message delivery and are bound by data processing agreements. We do not share any additional user data with these providers.`
  },
  {
    title: '9. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date. You are advised to review this policy periodically for any changes. Continued use of the platform after changes are posted constitutes your acceptance of the updated policy.`
  },
  {
    title: '10. Contact Us',
    content: `If you have any questions about this Privacy Policy, please contact us at otpguard26@gmail.com or by phone at +254 794 886 149. Our registered address is Nairobi, Kenya.`
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="tag">Legal</div>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--heading)', marginBottom: 16 }}>Privacy Policy</h1>
            <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
              Effective date: 1 January 2025. This policy describes how OTPGuard collects, uses, and protects your personal information.
            </p>
          </div>
        </section>

        <section style={{ padding: '64px 20px' }}>
          <div className="container" style={{ maxWidth: 780 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {sections.map(s => (
                <div key={s.title}>
                  <h2 style={{ color: 'var(--heading)', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12, borderLeft: '3px solid var(--green)', paddingLeft: 14 }}>{s.title}</h2>
                  <p style={{ color: 'var(--text)', lineHeight: 1.85, fontSize: '.95rem' }}>{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
