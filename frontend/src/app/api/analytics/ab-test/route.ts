import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Lire le body comme texte d'abord pour éviter les erreurs de parsing
    const text = await request.text();
    let body;
    
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      console.log('Raw body:', text);
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 }
      );
    }
    
    // Log pour debug (en production, utiliser un service d'analytics)
    console.log('📊 A/B Test Data:', {
      test_name: body.test_name,
      variant: body.variant,
      user_id: body.user_id,
      session_id: body.session_id,
      timestamp: body.timestamp
    });

    // En production, envoyer vers un service d'analytics (Google Analytics, Mixpanel, etc.)
    // Pour l'instant, on retourne juste un succès
    
    return NextResponse.json({ 
      success: true, 
      message: 'A/B test data received' 
    });
    
  } catch (error) {
    console.error('Erreur A/B Test API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
