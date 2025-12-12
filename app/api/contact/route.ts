export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createElement } from 'react'
import ContactEmail from '@/app/components/email/ContactEmail'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await resend.emails.send({
      from: 'Empower Ministry <onboarding@resend.dev>',
      to: ['leeja328@gmail.com'],
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      react: createElement(ContactEmail, { name, email, message }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('API route error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
