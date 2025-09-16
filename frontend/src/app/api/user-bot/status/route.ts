import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserBotManager from '@/services/UserBotManager';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userId = session.user.discordId;
    const userBotManager = UserBotManager.getInstance();

    // Récupérer le bot de l'utilisateur
    const userBot = await userBotManager.getUserBot(userId);
    
    // Récupérer les serveurs autorisés
    const authorizedServers = await userBotManager.getAuthorizedServers(userId);

    return NextResponse.json({
      hasBot: !!userBot,
      bot: userBot,
      authorizedServers: authorizedServers,
      serverCount: authorizedServers.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du statut du bot:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    );
  }
}
