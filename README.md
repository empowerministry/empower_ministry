# Empower Ministry Group Website

A modern, responsive Next.js website for Empower Ministry Group - a non-profit organization dedicated to revitalizing local ministries through strategic partnerships and community empowerment.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **Email Service:** Resend
- **Icons:** Lucide React

## Features

- ✨ Modern, responsive design
- 🎬 Video hero section with smooth animations
- 📧 Contact form with email integration (Resend)
- 📱 Mobile-first approach
- 🎨 Custom color scheme matching brand identity
- ♿ Accessible components
- 🚀 Optimized performance

## Project Structure

```
empower-ministry/
│
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── projects/
│   │   └── page.tsx        # Projects listing page
│   ├── donate/
│   │   └── page.tsx        # Donation page
│   ├── api/
│   │   └── contact/
│   │       └── route.ts    # Contact form API endpoint
│   │
│   ├── components/
│   │   ├── Footer.tsx
│   │   ├── HeroSection.tsx
│   │   ├── LeadershipTeam.tsx
│   │   ├── WhoWeAre.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── JourneyTimeline.tsx
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   └── textarea.tsx
│   │   └── email/
│   │       └── ContactEmail.tsx  # React Email template
│   │
│   ├── globals.css         # Global styles with CSS variables
│   └── assets/             # Images and media files
│
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
│
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
├── package.json
├── next.config.ts
├── tailwind.config.js
├── postcss.config.mjs
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd empower-ministry
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory and add your Resend API key:

```env
RESEND_API_KEY=your_resend_api_key_here
```

To get a Resend API key:
- Sign up at [resend.com](https://resend.com)
- Go to API Keys section
- Create a new API key
- Update the `from` email in `app/api/contact/route.ts` with your verified domain

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Customization

### Colors

The brand colors are defined in `app/globals.css`:
- Primary: `#1e3a5f` (Navy blue)
- Accent: `#c9a227` (Gold)

### Assets

Place your images in the `app/assets/` directory. Update image paths in components as needed.

### Content

Update text content directly in the component files:
- Hero: `app/components/HeroSection.tsx`
- About: `app/components/WhoWeAre.tsx`
- Leadership: `app/components/LeadershipTeam.tsx`
- Timeline: `app/components/JourneyTimeline.tsx`
- Projects: `app/components/ProjectsSection.tsx`

## Contact Form Setup

The contact form sends emails via Resend. To configure:

1. Update the recipient email in `app/api/contact/route.ts`:
```typescript
to: ['your-email@domain.com']
```

2. Update the sender email with your verified domain:
```typescript
from: 'Your Name <noreply@yourdomain.com>'
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `RESEND_API_KEY` environment variable in Vercel project settings
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

© 2024 Empower Ministry Group. All rights reserved.

## Support

For questions or issues, contact: contact@empowermg.org
