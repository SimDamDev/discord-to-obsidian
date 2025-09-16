import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

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
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié ou token Discord manquant' },
        { status: 401 }
      );
    }

    const { id: serverId } = await params;

    // Appel direct à l'API Discord pour récupérer les canaux
    console.log(`🔄 Récupération des canaux depuis l'API Discord pour le serveur ${serverId}...`);
    
    try {
      console.log('🔍 Debug token utilisé:', {
        tokenPreview: session.accessToken.substring(0, 20) + '...',
        tokenLength: session.accessToken.length,
        serverId: serverId
      });
      
      // Utiliser le bot token au lieu du token utilisateur OAuth2
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new Error('Bot token Discord non configuré');
      }

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
      
      // Si le token est expiré ou invalide
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token Discord expiré ou invalide' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la récupération des canaux' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux:', error);
    
    // Si le token est expiré ou invalide
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Token Discord expiré ou invalide' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des canaux' },
      { status: 500 }
    );
  }
}
