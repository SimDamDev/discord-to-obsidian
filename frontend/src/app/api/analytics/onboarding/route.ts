import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log pour debug (en production, utiliser un service d'analytics)
    console.log('📊 Onboarding Analytics:', {
      event_type: body.event_type,
      step_number: body.step_number,
      step_id: body.step_id,
      timestamp: body.timestamp,
      user_id: body.user_id,
      session_id: body.session_id
    });

    // En production, envoyer vers un service d'analytics (Google Analytics, Mixpanel, etc.)
    // Pour l'instant, on retourne juste un succès
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics data received' 
    });
    
  } catch (error) {
    console.error('Erreur Analytics API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

