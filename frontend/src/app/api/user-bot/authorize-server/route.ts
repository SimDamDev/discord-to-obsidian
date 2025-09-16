import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserBotManager from '@/services/UserBotManager';

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serverId, serverName, permissions } = body;

    if (!serverId || !serverName) {
      return NextResponse.json(
        { error: 'serverId et serverName sont requis' },
        { status: 400 }
      );
    }

    const userId = session.user.discordId;
    const userBotManager = UserBotManager.getInstance();

    // Vérifier que l'utilisateur a un bot
    const userBot = await userBotManager.getUserBot(userId);
    if (!userBot) {
      return NextResponse.json(
        { error: 'Aucun bot configuré' },
        { status: 403 }
      );
    }

    // Autoriser le serveur
    const authorizedServer = await userBotManager.authorizeServer(
      userId,
      serverId,
      serverName,
      userBot.id,
      permissions || ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY']
    );

    return NextResponse.json({
      success: true,
      authorizedServer
    });

  } catch (error) {
    console.error('Erreur lors de l\'autorisation du serveur:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'autorisation du serveur' },
      { status: 500 }
    );
  }
}
