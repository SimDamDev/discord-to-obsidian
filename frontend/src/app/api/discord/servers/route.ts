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

    console.log('🔍 Récupération de tous les serveurs Discord de l\'utilisateur...');
    
    try {
      // Récupérer tous les serveurs de l'utilisateur
      const userResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        timeout: 10000,
      });

      const userServers = userResponse.data;
      console.log(`✅ ${userServers.length} serveur(s) récupéré(s) pour l'utilisateur`);
      
      const responseData = { 
        success: true,
        servers: userServers,
        totalServers: userServers.length,
        botInviteLink: `https://discord.com/api/oauth2/authorize?client_id=1417259355967062037&scope=bot&permissions=6656`
      };
      
      console.log('🎯 API servers retourne:', responseData);
      return NextResponse.json(responseData);

    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token Discord utilisateur expiré ou invalide. Veuillez vous reconnecter.' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des serveurs Discord' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des serveurs Discord' },
      { status: 500 }
    );
  }
}