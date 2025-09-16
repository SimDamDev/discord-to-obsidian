import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';
import UserBotManager from '@/services/UserBotManager';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Récupérer la session NextAuth
    const session = await getServerSession(authOptions);
    
    console.log('🔍 Debug session dans channels:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      discordId: session?.user?.discordId,
      sessionKeys: session ? Object.keys(session) : []
    });
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: serverId } = await params;
    const userId = session.user.discordId;

    // Vérifier que l'utilisateur a un bot configuré
    const userBotManager = UserBotManager.getInstance();
    const userBot = await userBotManager.getUserBot(userId);
    
    if (!userBot) {
      return NextResponse.json(
        { error: 'Aucun bot configuré. Veuillez créer un bot pour accéder aux canaux.' },
        { status: 403 }
      );
    }

    // Vérifier que l'utilisateur a accès à ce serveur
    const isAuthorized = await userBotManager.isServerAuthorized(userId, serverId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce serveur. Veuillez inviter votre bot sur ce serveur.' },
        { status: 403 }
      );
    }

    // Appel à l'API Discord avec le bot de l'utilisateur
    console.log(`🔄 Récupération des canaux depuis l'API Discord pour le serveur ${serverId} avec le bot de l'utilisateur...`);
    
    try {
      console.log('🔍 Debug bot utilisé:', {
        botId: userBot.id,
        clientId: userBot.clientId,
        serverId: serverId
      });
      
      const response = await axios.get(`https://discord.com/api/guilds/${serverId}/channels`, {
        headers: {
          'Authorization': `Bot ${userBot.token}`,
        },
        timeout: 10000, // 10 secondes de timeout
      });

      // Filtrer seulement les canaux textuels (type 0)
      const textChannels = response.data.filter((channel: any) => channel.type === 0);
      
      console.log(`✅ ${textChannels.length} canaux récupérés depuis Discord pour le serveur ${serverId}`);
      return NextResponse.json({ channels: textChannels });
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Discord:', error);
      
      // Si le token est expiré ou invalide
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Bot Discord invalide ou expiré' },
          { status: 401 }
        );
      }

      // Si le bot n'a pas accès au serveur
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return NextResponse.json(
          { error: 'Le bot n\'a pas accès à ce serveur. Vérifiez les permissions.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la récupération des canaux' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des canaux' },
      { status: 500 }
    );
  }
}
