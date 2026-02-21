# CIF Dashboard

> Admin dashboard for the [GuardianCare](https://github.com/uumair327/guardiancare) child safety Flutter application.

**Live:** [umairansari.in/cifdashboard](https://umairansari.in/cifdashboard/) · [uumair327.github.io/cifdashboard](https://uumair327.github.io/cifdashboard/)

A modern web dashboard built with **React**, **TypeScript**, and **Vite** for managing GuardianCare's Firestore content — collections, forums, quizzes, and media.

## Features

- 🔐 **Google OAuth** authentication via Firebase
- 📊 **Collection management** — CRUD for carousel items, home images, learn content, quizzes, videos
- 💬 **Forum moderation** — manage posts and comments
- 🧩 **Quiz manager** — create and edit quizzes with questions
- 🌙 **Dark mode** support
- 📱 **Responsive** sidebar navigation
- ⚡ **Code splitting** with lazy-loaded routes

## Tech Stack

| Layer          | Technology                     |
|----------------|--------------------------------|
| Framework      | React 18                       |
| Language       | TypeScript                     |
| Build Tool     | Vite 5                         |
| Styling        | Tailwind CSS                   |
| Backend        | Firebase (Firestore, Auth)     |
| Hosting        | GitHub Pages                   |
| CI/CD          | GitHub Actions                 |
| Architecture   | Clean Architecture (DDD)       |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (LTS)
- npm v9+

### Installation

1. **Clone** the repository:
   ```bash
   git clone https://github.com/uumair327/cifdashboard.git
   cd cifdashboard
   ```

2. **Install** dependencies:
   ```bash
   npm install
   ```

3. **Configure** environment:
   ```bash
   cp .env.example .env.local
   ```
   Fill in `.env.local` with your Firebase web app credentials.  
   See `.env.example` for the required keys.

4. **Start** the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/cifdashboard/](http://localhost:5173/cifdashboard/)

### Building for Production

```bash
npm run build
```

Output is in `dist/`, ready for GitHub Pages deployment.

## Project Structure

```
src/
├── core/                   # Shared infrastructure
│   ├── auth/               # Auth abstraction (domain → data → context)
│   ├── components/         # Reusable UI (DataTable, Modal, Toast, etc.)
│   ├── errors/             # Shared error types
│   └── hooks/              # Shared React hooks
├── features/
│   ├── collections/        # Collection CRUD feature
│   │   ├── domain/         # Entities, interfaces, services
│   │   ├── data/           # Firebase repository + factory
│   │   ├── hooks/          # React hooks
│   │   ├── components/     # Feature UI
│   │   └── pages/          # Feature pages
│   ├── forum/              # Forum management feature
│   └── quiz/               # Quiz management feature
├── pages/                  # App-level pages (App, Login, Register)
├── firebase.ts             # Firebase initialization (env-based)
└── main.tsx                # Entry point & routing
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architectural documentation.

## Deployment

The app auto-deploys to **GitHub Pages** on push to `main` via GitHub Actions.

### Required GitHub Secrets

Configure in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_DATABASE_URL` | Realtime Database URL |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics ID |

### Firebase Authorized Domains

Both deployment domains must be whitelisted in **Firebase Console → Authentication → Settings → Authorized domains**:

- `umairansari.in` (custom domain)
- `uumair327.github.io` (GitHub Pages default)
- `localhost` (local development)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for our security policy and responsible disclosure process.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
