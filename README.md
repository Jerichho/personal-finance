# Personal Finance Tracker with AI Budget Coach

A modern personal finance management application that helps users track their spending, manage budgets, and get AI-powered financial advice.

## Features

- 🔐 Secure user authentication with Firebase
- 🏦 Bank account integration via Plaid
- 📊 Interactive dashboard with spending analytics
- 🤖 AI-powered budget coaching and insights
- 📈 Spending trends and category breakdown
- 💡 Personalized financial recommendations

## Tech Stack

- Frontend: Next.js 14 with TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Authentication: Firebase Auth
- Database: Firebase
- Bank Integration: Plaid
- AI Integration: OpenAI
- Charts: Recharts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_PLAID_CLIENT_ID=
   NEXT_PUBLIC_PLAID_SECRET=
   OPENAI_API_KEY=
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── hooks/             # Custom React hooks
├── store/             # Zustand store
└── types/             # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
