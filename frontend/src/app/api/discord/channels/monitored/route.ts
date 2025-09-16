import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Pour l'instant, on retourne une liste vide
    // TODO: Récupérer depuis la base de données
    const monitoredChannels: any[] = [];

    return NextResponse.json({ channels: monitoredChannels });
  } catch (error) {
    console.error('Erreur lors de la récupération des canaux surveillés:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des canaux surveillés' },
      { status: 500 }
    );
  }
}

