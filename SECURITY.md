# Security Policy

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in this project, please report it responsibly:

1. **Email**: Send details to the project maintainers privately.
2. **GitHub Security Advisories**: Use the [Security tab](../../security/advisories/new) to create a private advisory.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within **48 hours** and aim to release a patch within **7 days** for critical issues.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅        |
| Older   | ❌        |

## Security Best Practices (for Contributors)

### Environment Variables
- **Never** commit `.env`, `.env.local`, or any file containing secrets.
- Use `.env.example` as a template — it contains only placeholder values.
- All Firebase config must be in environment variables, never hardcoded.

### Secrets Management
- **Local development**: Use `.env.local` (gitignored).
- **CI/CD (GitHub Pages)**: Use [GitHub Actions secrets](../../settings/secrets/actions).
- **Never** commit service account keys, private keys, or API tokens.

### Firebase Security
- Enable **Firestore Security Rules** to restrict data access.
- Enable **Firebase App Check** in production.
- Restrict API key usage in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
  - Set HTTP referrer restrictions to:
    - `umairansari.in/*`
    - `uumair327.github.io/*`
    - `localhost:*` (dev only)
  - Restrict to only the APIs you use.

### Authentication
- Google OAuth is the sole sign-in method.
- **Both** deployment domains must be listed in Firebase Console → Authentication → Settings → Authorized domains:
  - `umairansari.in` (custom domain)
  - `uumair327.github.io` (GitHub Pages default)
  - `localhost` (local development)

### Code Security
- No `any` types in TypeScript — use proper typing.
- Validate and sanitize all user inputs.
- Use the `logger` utility (`src/core/utils/logger.ts`) instead of `console.*` — debug/info logs are automatically suppressed in production builds.
- Dependencies should be regularly audited: `npm audit`.

## Past Incidents

See [SECURITY_INCIDENT_RESPONSE.md](SECURITY_INCIDENT_RESPONSE.md) for documented incidents and response procedures.