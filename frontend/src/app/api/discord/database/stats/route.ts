import { NextRequest, NextResponse } from 'next/server';
import PrismaDatabaseService from '@/services/PrismaDatabaseService';

export async function GET(request: NextRequest) {
  try {
    const dbService = PrismaDatabaseService.getInstance();
    const stats = await dbService.getDatabaseStats();
    
    console.log(`📊 [Frontend API] Statistiques DB PostgreSQL: ${stats.users} utilisateurs, ${stats.servers} serveurs, ${stats.channels} canaux`);

    return NextResponse.json({
      ...stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques DB:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
