import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createElement } from 'react'
import ContactEmail from '@/app/components/email/ContactEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Empower Ministry <onboarding@resend.dev>', // Replace with your verified domain
      to: ['leeja328@gmail.com'], // Replace with your email
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      react: createElement(ContactEmail, { name, email, message }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
