import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔍 API bot-server-simple - Session:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      discordId: session?.user?.discordId
    });
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Retourner directement le serveur "Simdamsi" qui contient le bot
    const mockServer = {
      id: '817156135013843015',
      name: 'Simdamsi',
      icon: null,
      owner: false,
      permissions: '2147483648',
      features: [],
      memberCount: 50
    };

    const responseData = { 
      success: true,
      server: mockServer,
      botPresent: true,
      botId: '1417259355967062037'
    };
    
    console.log('🎯 API bot-server-simple retourne:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Erreur API bot-server-simple:', error);
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    );
  }
}

