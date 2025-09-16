import { NextRequest, NextResponse } from 'next/server';
import { mockDatabase, isDataRecent, storeServers, getServers } from '@/lib/mockDatabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId manquant' },
        { status: 400 }
      );
    }
    
    // Vérifier si on a des données récentes (moins de 15 minutes)
    if (isDataRecent(userId)) {
      const servers = getServers(userId);
      console.log(`📦 [Frontend API] ${servers.length} serveurs récupérés depuis la base de données simulée`);
      return NextResponse.json({ 
        servers,
        cached: true,
        source: 'database',
        timestamp: new Date().toISOString()
      });
    }
    
    // Pas de données récentes
    return NextResponse.json({ 
      servers: [],
      cached: false,
      source: 'none',
      message: 'Aucune donnée récente en base de données'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des serveurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des serveurs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, servers } = body;
    
    // Stocker les serveurs dans la base de données simulée
    storeServers(userId, servers);
    
    console.log(`💾 [Frontend API] ${servers.length} serveurs stockés en base de données simulée pour l'utilisateur ${userId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `${servers.length} serveurs stockés`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors du stockage des serveurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors du stockage des serveurs' },
      { status: 500 }
    );
  }
}
