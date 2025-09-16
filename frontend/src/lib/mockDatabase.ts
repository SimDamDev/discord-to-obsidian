// Base de données simulée partagée entre toutes les routes API
export const mockDatabase = new Map<string, { servers: any[], timestamp: number }>();

export function getDatabaseStats() {
  const users = mockDatabase.size;
  let servers = 0;
  
  for (const [userId, userData] of mockDatabase.entries()) {
    servers += userData.servers.length;
  }
  
  // Simuler des canaux (pour la démo)
  const channels = servers * 3; // Estimation : 3 canaux par serveur en moyenne
  
  return {
    users,
    servers,
    channels,
    lastUpdate: new Date().toISOString()
  };
}

export function isDataRecent(userId: string): boolean {
  const userData = mockDatabase.get(userId);
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  return userData && userData.timestamp > fifteenMinutesAgo;
}

export function storeServers(userId: string, servers: any[]): void {
  mockDatabase.set(userId, {
    servers,
    timestamp: Date.now()
  });
}

export function getServers(userId: string): any[] {
  const userData = mockDatabase.get(userId);
  return userData ? userData.servers : [];
}

