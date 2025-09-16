import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId || !session?.accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { botId, serverId } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID requis' }, { status: 400 });
    }

    // Créer l'URL d'invitation directe avec le token de l'utilisateur
    // Cette approche utilise le token OAuth2 de l'utilisateur pour pré-autoriser l'invitation
    const directInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&scope=bot&permissions=6656${serverId ? `&guild_id=${serverId}` : ''}&response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXTAUTH_URL || 'http://localhost:3000')}/api/auth/callback/discord`;

    return NextResponse.json({
      success: true,
      directInviteUrl,
      message: 'URL d\'invitation directe générée',
      instructions: [
        'Cliquez sur le lien pour inviter le bot',
        'Vous serez redirigé vers Discord avec votre session actuelle',
        'Sélectionnez les serveurs et autorisez le bot',
        'Vous serez automatiquement redirigé vers l\'application'
      ]
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'invitation directe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
