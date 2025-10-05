import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API channels-simple - Récupération des canaux pour Simdamsi...');
    
    // Retourner des canaux fictifs pour le serveur Simdamsi
    const mockChannels = [
      {
        id: '817156135013843016',
        name: 'general',
        type: 0,
        topic: 'Canal général du serveur',
        position: 0,
        parent_id: null,
        nsfw: false
      },
      {
        id: '817156135013843017',
        name: 'random',
        type: 0,
        topic: 'Canal pour discuter de tout',
        position: 1,
        parent_id: null,
        nsfw: false
      },
      {
        id: '817156135013843018',
        name: 'dev',
        type: 0,
        topic: 'Canal pour les développeurs',
        position: 2,
        parent_id: null,
        nsfw: false
      },
      {
        id: '817156135013843019',
        name: 'announcements',
        type: 0,
        topic: 'Annonces importantes',
        position: 3,
        parent_id: null,
        nsfw: false
      }
    ];

    console.log(`✅ API channels-simple retourne ${mockChannels.length} canaux`);
    return NextResponse.json({ channels: mockChannels });
    
  } catch (error) {
    console.error('Erreur API channels-simple:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

