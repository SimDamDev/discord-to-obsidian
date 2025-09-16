'use client';

import { useEffect, useState } from 'react';

export default function TestProvidersPage() {
  const [providers, setProviders] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        console.log('🔍 Fetching providers...');
        const response = await fetch('/api/auth/providers');
        const data = await response.json();
        console.log('📋 Providers received:', data);
        setProviders(data);
      } catch (error) {
        console.error('❌ Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test des Providers</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(providers, null, 2)}
      </pre>
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Résumé :</h2>
        <ul>
          <li>Discord OAuth: {providers?.discord ? '✅ Configuré' : '❌ Non configuré'}</li>
          <li>Discord Simple: {providers?.['discord-simple'] ? '✅ Configuré' : '❌ Non configuré'}</li>
        </ul>
      </div>
    </div>
  );
}
