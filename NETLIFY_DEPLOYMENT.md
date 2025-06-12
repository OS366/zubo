# Deploy Zubo to Netlify

## 🚀 Quick Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

### 2. Deploy to Netlify

**Option A: Netlify Dashboard**

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your Zubo repository
5. Netlify will auto-detect the build settings from `netlify.toml`
6. Click "Deploy site"

**Option B: Netlify CLI**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 3. Set Environment Variables

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

### 4. Update Stripe Webhook URL

In your Stripe Dashboard:

1. Go to **Developers** → **Webhooks**
2. Update your webhook endpoint URL to:
   ```
   https://your-site-name.netlify.app/.netlify/functions/webhook
   ```

### 5. Test Your Deployment

1. Visit your Netlify URL
2. Play the game until you run out of lives
3. Try purchasing lives through the store
4. Verify the Stripe checkout flow works

## 📋 Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Site deployed to Netlify
- [ ] Environment variables set in Netlify
- [ ] Stripe webhook URL updated
- [ ] Build successful (check deploy logs)
- [ ] Site loads correctly
- [ ] Store functionality works
- [ ] Payment flow completed successfully

## 🛠️ Build Configuration

The `netlify.toml` file automatically configures:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **API routing**: `/api/*` → `/.netlify/functions/*`
- **SPA routing**: Redirects to `index.html`

## 🔧 Troubleshooting

**Build Fails:**

- Check the deploy logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

**Functions Not Working:**

- Verify environment variables are set
- Check function logs in Netlify dashboard
- Ensure Stripe keys are correct

**Payment Issues:**

- Verify webhook URL in Stripe Dashboard
- Check Price IDs in `Store.tsx` match your Stripe products
- Test with Stripe test cards

**CORS Errors:**

- The functions include CORS headers
- If issues persist, check browser console for details

## 📱 Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Add your custom domain
3. Netlify will provide DNS instructions
4. Update your Stripe webhook URL to use the custom domain

## 🔄 Continuous Deployment

Netlify automatically redeploys when you push to your main branch:

```bash
git add .
git commit -m "Update game features"
git push origin main
# Netlify automatically deploys the changes
```

## 🧪 Testing Production

**Stripe Test Mode:**

- Use test cards: `4242 4242 4242 4242`
- All payments are simulated
- No real money is charged

**Going Live:**

1. Switch Stripe to Live Mode
2. Update environment variables with live keys
3. Test with a small real payment
4. Update webhook to use live mode events

Your Zubo game is now live on Netlify! 🎉
