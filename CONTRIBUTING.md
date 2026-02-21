# Contributing to CIF Dashboard

Thank you for your interest in contributing to the CIF Dashboard — the admin panel for the [GuardianCare](https://github.com/uumair327/guardiancare) child safety application.

## Getting Started

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** v9+
- A Firebase project (see [Firebase Setup](#firebase-setup))

### Local Development Setup

1. **Fork & clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/cifdashboard.git
   cd cifdashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** — copy the example file and fill in your Firebase credentials:
   ```bash
   cp .env.example .env.local
   ```
   > ⚠️ **Never commit `.env.local`** — it is gitignored by default.

4. **Start the dev server**:
   ```bash
   npm run dev
   ```

### Firebase Setup

This project connects to a Firebase backend. You need:
- A Firebase project with **Firestore** and **Authentication** (Google provider) enabled.
- The web app config values from your Firebase Console → Project Settings → General → Your apps → Web app.

Populate `.env.local` with these values (see `.env.example` for the template).

## Development Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes following the [Architecture Guidelines](ARCHITECTURE.md).

3. Run the linter:
   ```bash
   npm run lint
   ```

4. Run tests:
   ```bash
   npm run test:run
   ```

5. Commit with a descriptive message:
   ```bash
   git commit -m "feat: add user analytics dashboard"
   ```
   We follow [Conventional Commits](https://www.conventionalcommits.org/).

6. Push and open a Pull Request against `main`.

## Architecture

Please read [ARCHITECTURE.md](ARCHITECTURE.md) before contributing. Key points:

- **Clean Architecture**: Domain → Data → Presentation layers.
- **Feature-based structure**: Each feature lives under `src/features/<name>/`.
- **No Firebase in presentation**: Use hooks and factories, not direct Firebase imports.

## Code Style

- **TypeScript** — strict mode, no `any` types.
- **Functional components** — React hooks over class components.
- **Named exports** — avoid default exports where possible.
- **Descriptive names** — clarity over brevity.

## Security

- **Never commit secrets** (API keys, tokens, service account keys).
- **Use environment variables** for all configuration.
- Read [SECURITY.md](SECURITY.md) for our security policy.
- Report vulnerabilities privately — **do not open a public issue**.

## Reporting Issues

- Use GitHub Issues with a clear title and description.
- Include steps to reproduce, expected vs actual behavior.
- Add screenshots or logs if applicable.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
