# Next.js + Convex + Clerk Starter Template

This is a modern full-stack application template built with:

- [Next.js 15](https://nextjs.org/) - React framework for building web applications
- [Convex](https://convex.dev/) - Backend platform with real-time database and server functions
- [Clerk](https://clerk.com/) - Complete user management and authentication solution
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development

## Features

- **Authentication & User Management**: Complete authentication flow with Clerk, including sign-up, sign-in, and user profiles
- **Real-time Database**: Convex provides a real-time database with automatic syncing
- **Server Functions**: Write your backend logic in TypeScript with Convex functions
- **Premium Content Access**: Example implementation of premium/protected content with Clerk's permission system
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **TypeScript**: Full type safety across the entire stack

## Pages & Components

- **Home Page**: Main landing page with authentication state handling
- **Pricing Page**: Integration with Clerk's pricing table component
- **Premium Content**: Example of protected content based on user permissions
- **Server-side Rendering**: Example of server component data fetching

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone this repository:
```bash
git clone https://github.com/your-username/nextjs-convex-clerk.git
cd nextjs-convex-clerk
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory with the following variables:
   ```
   # Clerk (Authentication)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_JWT_ISSUER_DOMAIN=your_clerk_issuer_domain
   
   # Convex (Backend)
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Setting Up Clerk with Convex

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. In your Clerk dashboard, create a new JWT template for Convex:
   - Go to JWT Templates → Add new
   - Name it "convex"
   - Set the appropriate claims and permissions
3. Get your Clerk Issuer URL from the JWT template
4. Add the Issuer URL as `CLERK_JWT_ISSUER_DOMAIN` in your Convex deployment environment variables
5. Uncomment the Clerk provider in `convex/auth.config.ts`

## Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Home page
│   ├── premium/            # Premium content page
│   ├── pricing/            # Pricing page
│   └── server/             # Server component example
├── components/             # React components
│   ├── ConvexClientProvider.tsx  # Convex client setup
│   ├── Navigation.tsx      # Navigation bar
│   └── PremiumContent.tsx  # Protected content component
├── convex/                 # Convex backend
│   ├── _generated/         # Generated Convex API
│   ├── auth.config.ts      # Authentication configuration
│   ├── myFunctions.ts      # Example Convex functions
│   └── schema.ts           # Database schema
├── public/                 # Static assets
└── middleware.ts           # Next.js middleware for auth protection
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy

### Deploying Convex

1. Run `npx convex deploy` to deploy your Convex functions
2. Update the `NEXT_PUBLIC_CONVEX_URL` in your environment variables with the production URL

## Learn More

- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Community

- [Convex Discord](https://convex.dev/community)
- [Next.js Discord](https://discord.gg/nextjs)
- [Clerk Discord](https://clerk.com/discord)

