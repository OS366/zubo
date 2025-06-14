import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock Stripe checkout session creation
  http.post('/api/create-checkout-session', () => {
    return HttpResponse.json({
      url: 'https://checkout.stripe.com/pay/test_session_123'
    })
  }),

  // Mock leaderboard API
  http.post('/.netlify/functions/save-leaderboard', () => {
    return HttpResponse.json({
      id: 'test-entry-123',
      score: 85,
      questionsAnswered: 100,
      livesRemaining: 2,
      avatarUrl: 'https://example.com/avatar.jpg'
    })
  }),

  http.get('/.netlify/functions/get-leaderboard', () => {
    return HttpResponse.json([
      {
        id: 'test-entry-1',
        firstName: 'John',
        lastName: 'Doe',
        score: 95,
        questionsAnswered: 100,
        livesRemaining: 3,
        persona: 'Analytical Thinker',
        createdAt: new Date().toISOString()
      },
      {
        id: 'test-entry-2',
        firstName: 'Jane',
        lastName: 'Smith',
        score: 88,
        questionsAnswered: 100,
        livesRemaining: 1,
        persona: 'Creative Visionary',
        createdAt: new Date().toISOString()
      }
    ])
  }),

  http.get('/.netlify/functions/get-user-entries', () => {
    return HttpResponse.json([
      {
        id: 'user-entry-1',
        score: 85,
        questionsAnswered: 100,
        createdAt: new Date().toISOString()
      }
    ])
  }),

  // Mock email sending
  http.post('/.netlify/functions/send-leaderboard-email', () => {
    return HttpResponse.json({ success: true })
  }),

  // Mock Supabase calls (if needed)
  http.post('https://*/rest/v1/*', () => {
    return HttpResponse.json({ data: [], error: null })
  })
]

export const server = setupServer(...handlers) 