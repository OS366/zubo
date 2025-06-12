# 🎮 Zubo - Personality Quiz Game

A modern React TypeScript quiz game with lives system, Stripe payments, and personality assessment.

## ✨ Features

- **Personality Quiz**: Discover your inner persona through thought-provoking questions
- **Lives System**: Start with 3 lives, gain bonus lives with 20% chance on correct answers
- **Timed Questions**: Some questions have 60-second time limits
- **Stripe Integration**: Purchase additional lives through secure Stripe checkout
- **Copy Protection**: Comprehensive protection against copy-paste and cheating
- **Responsive Design**: Beautiful UI with modern animations and effects
- **Level Restrictions**: Life purchases disabled after level 75

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

## 🏪 Stripe Setup

1. Create a Stripe account and get your API keys
2. Create 3 products in Stripe Dashboard:
   - 5 Lives - $3.00
   - 10 Lives - $5.00
   - 20 Lives - $10.00
3. Update Price IDs in `src/components/Store.tsx`
4. Set environment variables (see `.env.example`)

## 🌐 Deploy to Netlify

Follow the detailed guide in `NETLIFY_DEPLOYMENT.md`:

1. Push to GitHub
2. Connect to Netlify
3. Set environment variables
4. Update Stripe webhook URL
5. Test the deployment

## 📂 Project Structure

```
zubo/
├── src/
│   ├── components/
│   │   ├── Game.tsx        # Main game logic
│   │   ├── Question.tsx    # Question display
│   │   └── Store.tsx       # Payment integration
│   ├── data/
│   │   └── questions.ts    # Question database
│   └── utils/
│       └── persona.ts      # Personality calculation
├── netlify/
│   └── functions/          # Serverless API endpoints
│       ├── create-checkout-session.js
│       └── webhook.js
├── netlify.toml           # Netlify configuration
└── NETLIFY_DEPLOYMENT.md  # Deployment guide
```

## 🎯 Game Rules

- Start with 3 lives
- Lose a life for incorrect answers (except personality questions)
- 20% chance to gain a life on correct answers
- Score 75% to win and discover your persona
- 4 question categories: Analytical, Logical, General Knowledge, Personality

## 🧪 Testing

**Development Mode:**

- Demo payments work automatically
- No API setup required for basic testing

**Production:**

- Use Stripe test cards: `4242 4242 4242 4242`
- Check webhook logs in Netlify Functions tab

## 🛡️ Security Features

- Copy-paste protection
- Text selection disabled
- Keyboard shortcut blocking
- Server-side payment verification
- Webhook signature validation

## 📱 Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Payments**: Stripe Checkout
- **Deployment**: Netlify Functions
- **Build Tool**: Vite

## 🎨 Design Features

- Modern gradient backgrounds
- Smooth animations and transitions
- Responsive layout for all devices
- Beautiful success/failure screens
- Real-time feedback and notifications

## 📄 License

MIT License - feel free to use for your own projects!

---

**Ready to deploy?** Check out `NETLIFY_DEPLOYMENT.md` for step-by-step instructions! 🚀
