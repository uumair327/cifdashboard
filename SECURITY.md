# Security Guidelines

## Environment Variables
- Never commit `.env` files to version control
- Use `.env.local` for local development
- All Firebase config should be in environment variables
- Copy `.env.example` to `.env.local` and fill in your values

## Firebase Security
- Regenerate all Firebase API keys after compromise
- Review Firebase Security Rules
- Enable Firebase App Check for production
- Use Firebase Auth for user authentication only

## GitHub Pages Deployment
- Environment variables for GitHub Pages should be set in repository secrets
- Use GitHub Actions for secure deployment
- Never expose sensitive keys in client-side code

## Development Security
- Keep dependencies updated
- Use HTTPS in production
- Implement proper error handling
- Log security events

## Incident Response
1. Immediately revoke compromised credentials
2. Review all project activity
3. Delete unauthorized resources
4. Update all secrets and keys
5. Review and update security rules