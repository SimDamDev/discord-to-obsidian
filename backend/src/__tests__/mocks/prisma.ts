import { vi } from 'vitest';

const prismaMock = {
  user: {
    upsert: vi.fn(),
  },
  // Ajoutez d'autres modèles et méthodes si nécessaire pour d'autres tests
};

export default prismaMock;