import { NextRequest, NextResponse } from 'next/server';
import DiscordCacheService from '@/services/DiscordCacheService';
import DiscordRateLimitService from '@/services/DiscordRateLimitService';

export async function GET(request: NextRequest) {
  try {
    const cacheService = DiscordCacheService.getInstance();
    const rateLimitService = DiscordRateLimitService.getInstance();

    // Nettoyer le cache expiré
    cacheService.cleanup();

    const status = {
      cache: cacheService.getStatus(),
      rateLimit: rateLimitService.getQueueStatus(),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

