import winston from 'winston';
import path from 'path';

// Créer le dossier logs s'il n'existe pas
const logDir = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.prettyPrint()
  ),
  defaultMeta: { 
    service: 'discord-to-obsidian',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Fichier pour les erreurs
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Fichier pour tous les logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
        return `${timestamp} [${service}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    )
  }));
}

// Logger spécialisé pour les métriques
export const metricsLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'discord-to-obsidian-metrics',
    type: 'metric'
  },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'metrics.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 3,
    }),
  ],
});

// Logger spécialisé pour l'audit
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'discord-to-obsidian-audit',
    type: 'audit'
  },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Fonctions utilitaires pour le logging
export const logError = (error: Error, context?: any) => {
  logger.error('Erreur détectée', {
    error: error.message,
    stack: error.stack,
    context
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarning = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

export const logMetric = (metric: string, value: number, tags?: any) => {
  metricsLogger.info('Métrique enregistrée', {
    metric,
    value,
    tags,
    timestamp: new Date().toISOString()
  });
};

export const logAudit = (action: string, userId: string, details?: any) => {
  auditLogger.info('Action d\'audit', {
    action,
    userId,
    details,
    timestamp: new Date().toISOString(),
    ip: details?.ip,
    userAgent: details?.userAgent
  });
};

export default logger;


