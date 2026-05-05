/**
 * OAuth Configuration Utilities
 *
 * The client only knows a provider is wired up if its NEXT_PUBLIC_*_CLIENT_ID
 * is set at build time. Server-side, Better Auth additionally requires the
 * matching *_CLIENT_SECRET (see src/lib/auth.ts) — to surface a button that
 * actually works locally, set both the public ID and the server secret.
 */

export interface OAuthProvider {
  id: 'google' | 'github'
  name: string
  enabled: boolean
  icon?: string
}

export function getOAuthProviders(): OAuthProvider[] {
  const providers: OAuthProvider[] = [
    {
      id: 'google',
      name: 'Google',
      enabled:
        typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      icon: '🔍',
    },
    {
      id: 'github',
      name: 'GitHub',
      enabled:
        typeof window !== 'undefined' &&
        !!process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      icon: '🐙',
    },
  ]

  return providers.filter(provider => provider.enabled)
}

export function getEnabledOAuthProviders(): OAuthProvider[] {
  return getOAuthProviders()
}

export function hasOAuthProviders(): boolean {
  return getEnabledOAuthProviders().length > 0
}

export function getOAuthProvider(id: 'google' | 'github'): OAuthProvider | undefined {
  return getOAuthProviders().find(provider => provider.id === id)
}
