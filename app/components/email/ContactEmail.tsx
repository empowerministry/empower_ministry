import {
  Html,
  Body,
  Container,
  Heading,
  Text,
} from '@react-email/components'

interface Props {
  name: string
  email: string
  message: string
}

export default function ContactEmail({ name, email, message }: Props) {
  return (
    <Html>
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Heading>New Contact Form Submission</Heading>

          <Text><strong>Name:</strong> {name}</Text>
          <Text><strong>Email:</strong> {email}</Text>
          <Text><strong>Message:</strong></Text>
          <Text>{message}</Text>
        </Container>
      </Body>
    </Html>
  )
}
