import Navbar from '../Components/Navbar'
import Footer from '../Components/Footer'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the OTPGuard platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform. These terms apply to all users, including developers, businesses, and end users accessing the platform through an integrated application.`
  },
  {
    title: '2. Description of Service',
    content: `OTPGuard provides a multi-factor authentication platform that enables businesses to add OTP-based verification to their applications via a REST API. The service includes OTP generation and delivery via SMS, email, and authenticator apps; an administrative dashboard; analytics and reporting tools; and developer documentation. Features available to you depend on your subscription plan.`
  },
  {
    title: '3. Account Registration',
    content: `To use the platform, you must register for an account by providing accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorised use of your account. OTPGuard reserves the right to terminate accounts that provide false information or violate these terms.`
  },
  {
    title: '4. Acceptable Use',
    content: `You agree not to use the platform to send unsolicited messages or spam; to impersonate any person or entity; to engage in any activity that interferes with or disrupts the platform; to attempt to gain unauthorised access to any part of the platform or its related systems; to use the platform for any unlawful purpose; or to transmit any content that is harmful, offensive, or violates any applicable law. Violation of these terms may result in immediate account suspension.`
  },
  {
    title: '5. API Usage and Rate Limits',
    content: `Your use of the OTPGuard API is subject to rate limits defined by your subscription plan. Exceeding rate limits may result in temporary throttling of your API access. You may not use automated tools to circumvent rate limits. OTPGuard reserves the right to modify rate limits at any time with reasonable notice. Excessive or abusive API usage may result in account suspension.`
  },
  {
    title: '6. Billing and Payment',
    content: `Paid plans are billed monthly or annually in advance. All fees are non-refundable except as required by law or as explicitly stated in our refund policy. Per-SMS charges are billed in arrears based on actual usage. Failure to pay may result in suspension of your account. Prices are subject to change with 30 days notice. Continued use of the platform after a price change constitutes acceptance of the new pricing.`
  },
  {
    title: '7. Intellectual Property',
    content: `The OTPGuard platform, including its software, design, documentation, and all associated intellectual property, is owned by OTPGuard and is protected by copyright, trademark, and other applicable laws. You are granted a limited, non-exclusive, non-transferable licence to use the platform solely for your internal business purposes. You may not copy, modify, distribute, sell, or lease any part of the platform without our prior written consent.`
  },
  {
    title: '8. Data and Privacy',
    content: `Your use of the platform is also governed by our Privacy Policy, which is incorporated into these Terms of Service by reference. By using the platform, you consent to the collection and use of your information as described in the Privacy Policy. You retain ownership of all data you submit to the platform. You grant OTPGuard a limited licence to process that data solely for the purpose of providing the service.`
  },
  {
    title: '9. Service Availability and Uptime',
    content: `OTPGuard targets 99.9% uptime for the platform. Scheduled maintenance windows will be communicated in advance where possible. We are not liable for downtime caused by factors outside our reasonable control, including internet outages, third-party provider failures, or force majeure events. Enterprise customers with SLA agreements are subject to the terms of their individual service agreements.`
  },
  {
    title: '10. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, OTPGuard shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the platform. Our total liability to you for any claim arising from these terms or your use of the platform shall not exceed the amount you paid to OTPGuard in the 12 months preceding the claim.`
  },
  {
    title: '11. Termination',
    content: `Either party may terminate the service relationship at any time. You may cancel your account from your dashboard settings. OTPGuard may suspend or terminate your account immediately if you violate these terms, fail to pay fees, or engage in conduct that we determine to be harmful to the platform or other users. Upon termination, your right to use the platform ceases immediately. Data deletion timelines are described in our Privacy Policy.`
  },
  {
    title: '12. Governing Law',
    content: `These Terms of Service are governed by and construed in accordance with the laws of Kenya. Any disputes arising from these terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya. If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`
  },
  {
    title: '13. Changes to Terms',
    content: `We reserve the right to modify these Terms of Service at any time. We will provide at least 14 days notice of material changes via email or a prominent notice on the platform. Your continued use of the platform after the effective date of any changes constitutes your acceptance of the revised terms. If you do not agree to the revised terms, you must stop using the platform.`
  },
  {
    title: '14. Contact',
    content: `For questions about these Terms of Service, contact us at otpguard26@gmail.com or by phone at +254 794 886 149. Our registered address is Nairobi, Kenya.`
  },
]

export default function TermsOfService() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <section style={{ padding: '72px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="tag">Legal</div>
            <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--heading)', marginBottom: 16 }}>Terms of Service</h1>
            <p style={{ color: 'var(--text)', lineHeight: 1.7 }}>
              Effective date: 1 January 2025. Please read these terms carefully before using the OTPGuard platform.
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
