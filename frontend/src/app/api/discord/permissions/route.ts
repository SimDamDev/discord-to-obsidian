import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier les permissions du token Discord
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { 
            error: 'Token Discord invalide ou expiré',
            status: response.status,
            statusText: response.statusText
          },
          { status: 401 }
        );
      }

      const userData = await response.json();
      
      return NextResponse.json({
        valid: true,
        user: {
          id: userData.id,
          username: userData.username,
          discriminator: userData.discriminator,
          avatar: userData.avatar,
        },
        permissions: {
          canReadGuilds: true,
          canReadChannels: true,
        }
      });

    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification des permissions Discord' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erreur dans l\'API permissions:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

