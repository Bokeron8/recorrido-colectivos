# Secrets Configuration

This project uses EAS (Expo Application Services) secrets for sensitive configuration.

## Required Secrets

### RNMAPBOX_MAPS_DOWNLOAD_TOKEN
A Mapbox secret token with `Downloads:Read` scope, required for downloading Mapbox SDK during builds.

**Setup:**
1. Go to https://account.mapbox.com/access-tokens/
2. Create a new **Secret token** (not a public token)
3. Enable the `Downloads:Read` scope
4. Set the secret in EAS:

```bash
eas secret:create --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --value "your-secret-token-here"
```

Or set it via the EAS dashboard:
https://expo.dev/accounts/[username]/projects/[project-name]/secrets

### MAPBOX_PUBLIC_TOKEN
The public Mapbox access token used in the app at runtime.

**Setup:**
1. Go to https://account.mapbox.com/access-tokens/
2. Copy your public token (starts with `pk.`)
3. Set the secret in EAS:

```bash
eas secret:create --name MAPBOX_PUBLIC_TOKEN --value "pk.your-public-token-here"
```

## Important Notes

- **Never commit secret tokens** (starting with `sk.`) to the repository
- Secret tokens should only be configured via EAS secrets
- If you accidentally committed a secret, revoke it immediately in Mapbox dashboard and create a new one
- The old secret in commit history has been revoked and should not be used
