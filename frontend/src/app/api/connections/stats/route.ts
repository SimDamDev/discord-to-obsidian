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

    // Pour l'instant, on retourne des statistiques simulées
    // TODO: Récupérer depuis le HybridMessageService
    const stats = {
      activeConnections: 0,
      currentMode: 'polling' as 'realtime' | 'polling',
      monitoredChannels: 0,
      messagesProcessed: 0,
      uptime: Math.floor(Date.now() / 1000) - Math.floor(Date.now() / 1000 - 3600), // 1 heure
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

