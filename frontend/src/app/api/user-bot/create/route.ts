import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import UserBotManager from '@/services/UserBotManager';
import { CreateUserBotRequest } from '@/types/userBot';

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
    const { botName, permissions } = body;

    if (!botName) {
      return NextResponse.json(
        { error: 'Le nom du bot est requis' },
        { status: 400 }
      );
    }

    // Créer le bot pour l'utilisateur
    const userBotManager = UserBotManager.getInstance();
    const createRequest: CreateUserBotRequest = {
      userId: session.user.discordId,
      botName: botName.trim(),
      permissions: permissions || ['VIEW_CHANNELS', 'READ_MESSAGE_HISTORY']
    };

    // Passer le token d'accès utilisateur pour créer le bot personnel
    const result = await userBotManager.createUserBot(createRequest, session.accessToken);

    return NextResponse.json({
      success: true,
      bot: result.bot,
      inviteLink: result.inviteLink
    });

  } catch (error) {
    console.error('Erreur lors de la création du bot:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('déjà un bot actif')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la création du bot' },
      { status: 500 }
    );
  }
}
