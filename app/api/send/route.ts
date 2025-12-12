import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { GithubAccessTokenEmail } from '../../../email/ContactEmail';


export async function GET() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const emailPayload = { 
      from: 'onboarding@resend.dev',
      to: 'leeja328@gmail.com',
      subject: 'Test Email',
      // text: `Email: ${user}`,
      react: GithubAccessTokenEmail({username: 'adsfkj'}),
    }

    const {data: resendData, error} = await resend.emails.send(emailPayload);

    if (error) {
      return NextResponse.json({ error });
    }
    return NextResponse.json({ resendData });

  }
  catch (error) {
    return NextResponse.json({ error });
  }
} 