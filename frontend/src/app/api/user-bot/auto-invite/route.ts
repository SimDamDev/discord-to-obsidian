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

    const { botId, serverIds } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID requis' }, { status: 400 });
    }

    // Récupérer les serveurs de l'utilisateur
    try {
      const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
        timeout: 10000,
      });

      const guilds = guildsResponse.data;
      
      if (!guilds || guilds.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Aucun serveur trouvé',
          message: 'Vous devez être administrateur d\'au moins un serveur Discord'
        });
      }

      // Filtrer les serveurs où l'utilisateur a les permissions d'administrateur
      const adminGuilds = guilds.filter((guild: any) => 
        (guild.permissions & 0x8) === 0x8 // Permission ADMINISTRATOR
      );

      if (adminGuilds.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Permissions insuffisantes',
          message: 'Vous devez être administrateur d\'au moins un serveur pour inviter le bot',
          availableGuilds: guilds.map((g: any) => ({ id: g.id, name: g.name }))
        });
      }

      // Si des serveurs spécifiques sont demandés, les utiliser
      const targetGuilds = serverIds ? 
        adminGuilds.filter((g: any) => serverIds.includes(g.id)) : 
        adminGuilds;

      if (targetGuilds.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Serveurs non trouvés',
          message: 'Les serveurs spécifiés ne sont pas accessibles ou vous n\'avez pas les permissions',
          availableGuilds: adminGuilds.map((g: any) => ({ id: g.id, name: g.name }))
        });
      }

      // Créer les invitations pour chaque serveur
      const invitations = [];
      
      for (const guild of targetGuilds) {
        try {
          // Au lieu de créer une invitation serveur, on génère directement l'URL d'invitation du bot
          // avec le guild_id pour cibler le serveur spécifique
          const botInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botId}&scope=bot&permissions=6656&guild_id=${guild.id}`;
          
          invitations.push({
            guildId: guild.id,
            guildName: guild.name,
            botInviteUrl,
            message: `Bot prêt à être invité sur ${guild.name}`
          });

        } catch (error) {
          console.error(`Erreur lors de la préparation de l'invitation pour ${guild.name}:`, error);
          // Continuer avec les autres serveurs
        }
      }

      return NextResponse.json({
        success: true,
        message: `${invitations.length} invitation(s) créée(s) avec succès`,
        invitations,
        totalGuilds: adminGuilds.length,
        processedGuilds: invitations.length
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des serveurs:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return NextResponse.json(
          { error: 'Token Discord expiré' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Erreur lors de la récupération des serveurs' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur lors de l\'invitation automatique:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
