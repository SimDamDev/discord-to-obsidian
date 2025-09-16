import { NextRequest, NextResponse } from 'next/server';
import { isDataRecent } from '@/lib/mockDatabase';

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
    const isRecent = isDataRecent(userId);
    
    console.log(`🔍 [Frontend API] Vérification de la fraîcheur des données pour l'utilisateur ${userId}: ${isRecent ? 'RÉCENTES' : 'EXPIRÉES'}`);
    
    return NextResponse.json({ 
      isRecent,
      timestamp: new Date().toISOString(),
      age: null
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de la fraîcheur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de la fraîcheur' },
      { status: 500 }
    );
  }
}
