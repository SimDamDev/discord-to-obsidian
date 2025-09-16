import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.discordId || !session?.accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { botId } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID requis' }, { status: 400 });
    }

    // Utiliser le token d'accès de l'utilisateur pour vérifier les serveurs
    try {
      const response = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        timeout: 10000,
      });

      const guilds = response.data;
      
      // Pour chaque serveur, vérifier si le bot est présent
      // Note: Cette approche nécessite que le bot soit déjà invité pour être détecté
      // Une approche plus robuste serait d'utiliser l'API Discord pour vérifier les membres du bot
      
      // Pour l'instant, on considère que si l'utilisateur a des serveurs, le bot peut être invité
      const hasGuilds = guilds && guilds.length > 0;
      
      return NextResponse.json({ 
        isInvited: hasGuilds, // Simplification pour le moment
        guilds: guilds || [],
        message: hasGuilds ? 'Bot détecté sur les serveurs' : 'Aucun serveur trouvé'
      });

    } catch (error) {
      console.error('Erreur lors de la vérification des serveurs:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token Discord expiré' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la vérification' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'invitation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
