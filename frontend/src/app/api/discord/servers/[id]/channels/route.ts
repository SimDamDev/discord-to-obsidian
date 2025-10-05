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

    // Récupérer le token de bot selon la version choisie
    let botToken = process.env.DISCORD_BOT_TOKEN; // Bot principal par défaut
    
    // TODO: Récupérer le token du bot personnel depuis la base de données si version sécurisée
    // const userBotToken = await getUserBotToken(session.user.discordId);
    // if (userBotToken) {
    //   botToken = userBotToken;
    // }
    
    if (!botToken) {
      return NextResponse.json(
        { error: 'Token du bot non configuré' },
        { status: 500 }
      );
    }

    console.log(`🔄 Récupération des canaux depuis l'API Discord pour le serveur ${serverId} avec le bot principal...`);
    
    try {
      console.log('🔍 Debug bot principal utilisé:', {
        serverId: serverId,
        botTokenPreview: botToken.substring(0, 10) + '...',
        discordId: session.user?.discordId
      });
      
      const response = await axios.get(`https://discord.com/api/guilds/${serverId}/channels`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
        timeout: 10000, // 10 secondes de timeout
      });

      // Filtrer seulement les canaux textuels (type 0)
      const textChannels = response.data.filter((channel: any) => channel.type === 0);
      
      console.log(`✅ ${textChannels.length} canaux récupérés depuis Discord pour le serveur ${serverId}`);
      return NextResponse.json({ channels: textChannels });
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Discord:', error);
      
      // Si le bot n'a pas accès au serveur
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        return NextResponse.json(
          { error: 'Le bot n\'a pas accès à ce serveur. Veuillez inviter le bot sur ce serveur.' },
          { status: 403 }
        );
      }

      // Si le serveur n'existe pas
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return NextResponse.json(
          { error: 'Serveur Discord non trouvé. Vérifiez que le serveur existe.' },
          { status: 404 }
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
