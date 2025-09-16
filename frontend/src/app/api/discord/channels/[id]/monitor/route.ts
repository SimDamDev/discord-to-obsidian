import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer la session NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const channelId = params.id;

    // TODO: Implémenter la suppression du canal de la surveillance
    // Pour l'instant, on simule la suppression
    console.log(`Suppression du canal ${channelId} de la surveillance pour l'utilisateur ${session.user.discordId}`);

    return NextResponse.json({ 
      message: 'Canal retiré de la surveillance',
      channelId,
      userId: session.user.discordId,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du canal:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du canal' },
      { status: 500 }
    );
  }
}

