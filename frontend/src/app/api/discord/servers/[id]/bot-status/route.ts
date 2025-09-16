import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id: serverId } = await params;

    console.log(`🔍 Vérification du statut du bot pour le serveur ${serverId}...`);
    
    try {
      // Utiliser le token du bot pour vérifier s'il est présent sur le serveur
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new Error('Token du bot non configuré');
      }

      // Vérifier si le bot peut accéder au serveur (s'il est présent)
      const response = await axios.get(`https://discord.com/api/guilds/${serverId}`, {
        headers: {
          'Authorization': `Bot ${botToken}`,
        },
        timeout: 10000,
      });

      // Si on peut accéder au serveur avec le bot, c'est qu'il est présent
      console.log(`✅ Bot présent sur le serveur ${serverId}`);
      
      return NextResponse.json({ 
        botPresent: true,
        serverId,
        botClientId: '1417259355967062037'
      });

    } catch (error) {
      console.error('Erreur lors de la vérification du bot:', error);
      
      if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) {
        // Bot pas présent sur ce serveur
        console.log(`❌ Bot non présent sur le serveur ${serverId}`);
        return NextResponse.json({ 
          botPresent: false,
          serverId,
          error: 'Bot non présent sur ce serveur'
        });
      }

      return NextResponse.json(
        { error: 'Erreur lors de la vérification du bot' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du bot:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut du bot' },
      { status: 500 }
    );
  }
}
