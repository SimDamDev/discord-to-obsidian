import NextAuth, { type NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

// Configuration des providers
const providers = [];

// Debug des variables d'environnement
console.log('🔍 Debug Auth Config:');
console.log('DISCORD_CLIENT_ID:', process.env.DISCORD_CLIENT_ID ? '✅ Configuré' : '❌ Non configuré');
console.log('DISCORD_CLIENT_SECRET:', process.env.DISCORD_CLIENT_SECRET ? '✅ Configuré' : '❌ Non configuré');

// Provider Discord (si configuré)
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email guilds guilds.members.read',
        },
      },
    })
  );
} else {
  // Provider de connexion simple (sans OAuth Discord)
  providers.push(
    CredentialsProvider({
      id: 'discord-simple',
      name: 'Discord (Mode Simple)',
      credentials: {
        username: { label: 'Nom d\'utilisateur Discord', type: 'text', placeholder: 'Votre nom Discord' },
        email: { label: 'Email', type: 'email', placeholder: 'votre@email.com' },
      },
      async authorize(credentials) {
        // Connexion simple sans OAuth - pour tester l'application
        if (credentials?.username && credentials?.email) {
          return {
            id: `simple_${credentials.username.replace(/\s+/g, '_')}`,
            name: credentials.username,
            email: credentials.email,
            image: `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`,
            discordId: `simple_${credentials.username.replace(/\s+/g, '_')}`,
          };
        }
        return null;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
  callbacks: {
    async jwt({ token, account, profile, user }: { token: JWT; account: any; profile: any; user: User }) {
      console.log('🔍 Debug JWT callback:', {
        hasAccount: !!account,
        provider: account?.provider,
        hasProfile: !!profile,
        hasUser: !!user,
        hasAccessToken: !!account?.access_token,
        accessTokenPreview: account?.access_token ? `${account.access_token.substring(0, 10)}...` : 'none'
      });

      // Pour le provider simple (credentials)
      if (account?.provider === 'discord-simple' && user) {
        token.discordId = user.discordId;
        token.accessToken = 'simple-token';
        token.refreshToken = 'simple-refresh';
      }
      // Pour le provider Discord OAuth
      else if (account && profile) {
        token.discordId = profile.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        console.log('✅ Token Discord stocké dans JWT:', {
          discordId: profile.id,
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token
        });
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('🔍 Debug session callback:', {
        hasToken: !!token,
        hasDiscordId: !!token?.discordId,
        hasAccessToken: !!token?.accessToken,
        accessTokenPreview: token?.accessToken ? `${token.accessToken.substring(0, 10)}...` : 'none'
      });

      if (token.discordId) {
        session.user.discordId = token.discordId;
        session.accessToken = token.accessToken;
        console.log('✅ Session mise à jour avec token Discord');
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);

