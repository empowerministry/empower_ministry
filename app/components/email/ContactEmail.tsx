import * as React from 'react'

interface ContactEmailProps {
  name: string
  email: string
  message: string
}

export const ContactEmail: React.FC<Readonly<ContactEmailProps>> = ({
  name,
  email,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ backgroundColor: '#1e3a5f', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ color: '#c9a227', margin: 0 }}>New Contact Form Submission</h1>
      <p style={{ color: 'white', margin: '10px 0 0 0' }}>Empower Ministry Group</p>
    </div>

    <div style={{ padding: '30px', backgroundColor: '#f9f9f9' }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e3a5f', marginTop: 0 }}>Contact Details</h2>
        <p style={{ margin: '10px 0' }}>
          <strong>Name:</strong> {name}
        </p>
        <p style={{ margin: '10px 0' }}>
          <strong>Email:</strong> {email}
        </p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#1e3a5f', marginTop: 0 }}>Message</h2>
        <p style={{ color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
      </div>
    </div>

    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
      <p>This email was sent from the Empower Ministry Group contact form.</p>
    </div>
  </div>
)

export default ContactEmail
