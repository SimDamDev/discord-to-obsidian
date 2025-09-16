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

    const { botId, serverId } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID requis' }, { status: 400 });
    }

    // Si un serveur spécifique est fourni, créer une invitation directe
    if (serverId) {
      try {
        // Créer une invitation pour le bot sur le serveur spécifique
        const inviteResponse = await axios.post(
          `https://discord.com/api/guilds/${serverId}/invites`,
          {
            max_age: 0, // Invitation permanente
            max_uses: 0, // Usage illimité
            temporary: false,
            unique: true
          },
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        const invite = inviteResponse.data;
        
        // Construire l'URL d'invitation du bot avec l'invitation du serveur
        const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&scope=bot&permissions=6656&guild_id=${serverId}`;
        
        return NextResponse.json({
          success: true,
          botInviteUrl,
          serverInvite: invite,
          message: 'Invitation créée avec succès'
        });

      } catch (error) {
        console.error('Erreur lors de la création de l\'invitation:', error);
        
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          return NextResponse.json(
            { error: 'Permissions insuffisantes pour créer une invitation sur ce serveur' },
            { status: 403 }
          );
        }

        return NextResponse.json(
          { error: 'Erreur lors de la création de l\'invitation' },
          { status: 500 }
        );
      }
    }

    // Sinon, retourner l'URL d'invitation générale
    const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&scope=bot&permissions=6656`;
    
    return NextResponse.json({
      success: true,
      botInviteUrl,
      message: 'URL d\'invitation générée'
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'invitation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
