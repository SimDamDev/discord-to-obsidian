import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, servers } = body;
    
    console.log(`💾 [Frontend API] Stockage de ${servers.length} serveurs pour l'utilisateur ${userId}`);
    
    // Simuler le stockage en base de données
    // En réalité, ceci devrait être géré par le backend avec Prisma
    
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

