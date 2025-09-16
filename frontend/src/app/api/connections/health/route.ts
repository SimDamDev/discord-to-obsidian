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

    // Pour l'instant, on retourne un statut de santé simulé
    // TODO: Récupérer depuis le HybridMessageService
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      services: {
        discordBot: true,
        pollingService: true,
        connectionManager: true,
      },
      lastCheck: new Date().toISOString(),
      errors: [] as string[],
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Erreur lors de la vérification de la santé:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la santé' },
      { status: 500 }
    );
  }
}

