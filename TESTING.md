# Zubo Testing Guide

This document outlines the comprehensive testing strategy for the Zubo quiz application, including unit tests, integration tests, end-to-end tests, and CI/CD pipeline integration.

## Testing Stack

- **Unit/Integration Tests**: Vitest + React Testing Library
- **End-to-End Tests**: Playwright
- **Mocking**: MSW (Mock Service Worker)
- **Coverage**: Vitest Coverage (v8)
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run unit tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test

# Open test UI
npm run test:ui
```

## Test Structure

```
src/test/
├── components/          # Component tests
│   ├── Game.test.tsx
│   └── Question.test.tsx
├── utils/              # Utility function tests
│   └── timeBank.test.ts
├── e2e/                # End-to-end tests
│   └── game-flow.spec.ts
├── mocks/              # Mock configurations
│   └── server.ts
└── setup.ts            # Test setup and configuration
```

## Unit Tests

### Game Component Tests

- Menu screen rendering and navigation
- Game state management
- Answer handling and progression
- Store integration
- Time bank system
- Game state persistence
- Payment success handling
- Failure scenarios

### Question Component Tests

- Question rendering and display
- User interaction handling
- Countdown timer functionality
- Timeout handling
- Security features (anti-cheating)
- State reset between questions

### Utility Function Tests

- Time bank calculations
- Time earning algorithms
- Life trading mechanics
- Integration scenarios

## End-to-End Tests

### Game Flow Tests

- Complete game walkthrough
- Store functionality
- Mobile responsiveness
- Security measures
- State persistence
- Payment flow simulation

### Coverage Requirements

- **Minimum Coverage**: 70% across all metrics
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## CI/CD Pipeline

### Workflow Stages

1. **Lint and Type Check**

   - ESLint validation
   - TypeScript compilation check

2. **Unit Tests**

   - Run all unit and integration tests
   - Generate coverage reports
   - Upload to Codecov

3. **End-to-End Tests**

   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile device testing
   - Generate test reports

4. **Build Verification**

   - Successful build compilation
   - Asset optimization check

5. **Security Audit**

   - Dependency vulnerability scan
   - Security best practices check

6. **Performance Testing**

   - Lighthouse CI integration
   - Performance metrics validation

7. **Deployment**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Post-deployment verification

### Branch Protection

Tests must pass before merging to:

- `main` branch (production)
- `develop` branch (staging)

### Required Checks

- ✅ Lint and type check
- ✅ Unit tests (70% coverage minimum)
- ✅ E2E tests (all browsers)
- ✅ Build success
- ✅ Security audit
- ✅ Performance benchmarks

## Running Tests Locally

### Prerequisites

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Unit Tests

```bash
# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test

# Interactive UI
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test game-flow.spec.ts
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

- JSDOM environment for React components
- Coverage thresholds and reporting
- Test setup files
- Mock configurations

### Playwright Configuration (`playwright.config.ts`)

- Multi-browser testing
- Mobile device simulation
- Test reporting
- Retry strategies

## Mocking Strategy

### API Mocking (MSW)

- Stripe payment endpoints
- Leaderboard API calls
- Email service endpoints
- Supabase interactions

### Browser API Mocking

- localStorage
- window.history
- URLSearchParams
- Console methods

## Best Practices

### Writing Tests

1. **Descriptive Test Names**

   ```typescript
   it("should handle answer selection and progress to next question", async () => {
     // Test implementation
   });
   ```

2. **Arrange-Act-Assert Pattern**

   ```typescript
   // Arrange
   render(<Component />);

   // Act
   await user.click(button);

   // Assert
   expect(screen.getByText("Expected")).toBeInTheDocument();
   ```

3. **Test User Behavior, Not Implementation**

   ```typescript
   // Good: Test what user sees/does
   await user.click(screen.getByText("Play the Challenge"));
   expect(screen.getByText("Question 1 of 100")).toBeVisible();

   // Avoid: Testing internal state
   expect(component.state.gameStatus).toBe("playing");
   ```

### E2E Test Guidelines

1. **Use Page Object Model**
2. **Test Critical User Journeys**
3. **Include Error Scenarios**
4. **Test Across Devices/Browsers**
5. **Keep Tests Independent**

## Debugging Tests

### Unit Tests

```bash
# Debug specific test
npm run test -- --reporter=verbose Game.test.tsx

# Debug with browser
npm run test:ui
```

### E2E Tests

```bash
# Debug mode
npx playwright test --debug

# Headed mode
npm run test:e2e:headed

# Trace viewer
npx playwright show-trace trace.zip
```

## Continuous Integration

### GitHub Actions Workflow

The CI pipeline runs on:

- Push to `main` or `develop`
- Pull requests to `main`

### Secrets Required

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `NETLIFY_STAGING_SITE_ID`
- `LHCI_GITHUB_APP_TOKEN` (optional)
- `SLACK_WEBHOOK_URL` (optional)

### Deployment Gates

Production deployment requires:

- All tests passing
- Security audit clean
- Performance benchmarks met
- Manual approval (if configured)

## Performance Testing

### Lighthouse CI Metrics

- **Performance**: ≥ 80%
- **Accessibility**: ≥ 90%
- **Best Practices**: ≥ 80%
- **SEO**: ≥ 80%

### Key Metrics Monitored

- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

## Troubleshooting

### Common Issues

1. **Tests timing out**

   - Increase timeout values
   - Check for infinite loops
   - Verify async operations

2. **Flaky E2E tests**

   - Add proper waits
   - Use stable selectors
   - Check for race conditions

3. **Coverage not meeting threshold**
   - Add missing test cases
   - Remove dead code
   - Check exclusion patterns

### Getting Help

- Check test logs in GitHub Actions
- Review Playwright reports
- Use debug modes for investigation
- Consult team documentation

## Future Enhancements

- Visual regression testing
- API contract testing
- Load testing integration
- Accessibility automation
- Cross-platform mobile testing
