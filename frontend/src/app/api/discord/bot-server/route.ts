import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('🔍 Recherche du serveur avec le bot...');
    
    try {
      // Utiliser le token du bot pour vérifier sur quel serveur il est
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        throw new Error('Token du bot non configuré');
      }

      // Récupérer les serveurs de l'utilisateur
      const userResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        timeout: 10000,
      });

      const userServers = userResponse.data;
      console.log(`👤 Utilisateur membre de ${userServers.length} serveur(s)`);

      // ID du bot principal
      const botId = '1417259355967062037'; // Notre bot principal
      
      // Tester chaque serveur pour voir si le bot y est membre
      for (const server of userServers) {
        try {
          console.log(`🔍 Test du serveur: ${server.name} (${server.id})`);
          
          // Vérifier si le bot est membre de ce serveur
          const botResponse = await axios.get(`https://discord.com/api/guilds/${server.id}/members/${botId}`, {
            headers: {
              'Authorization': `Bot ${botToken}`,
            },
            timeout: 5000,
          });

          // Si on peut récupérer les infos du bot, c'est qu'il est membre
          console.log(`✅ Bot présent sur le serveur: ${server.name}`);
          return NextResponse.json({ 
            success: true,
            server: server,
            botPresent: true,
            botId: botId
          });

        } catch (error) {
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.log(`❌ Bot non présent sur: ${server.name}`);
            continue; // Tester le serveur suivant
          } else if (axios.isAxiosError(error) && error.response?.status === 403) {
            console.log(`❌ Pas d'accès au serveur: ${server.name}`);
            continue; // Tester le serveur suivant
          } else {
            console.error(`Erreur lors du test du serveur ${server.name}:`, error);
            continue;
          }
        }
      }

      // Aucun serveur avec bot trouvé
      return NextResponse.json({ 
        success: false,
        message: 'Aucun serveur avec bot trouvé',
        botPresent: false
      });

    } catch (error) {
      console.error('Erreur lors de la recherche du serveur avec bot:', error);
      
      return NextResponse.json(
        { error: 'Erreur lors de la recherche du serveur avec bot' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du serveur avec bot:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la recherche du serveur avec bot' },
      { status: 500 }
    );
  }
}
