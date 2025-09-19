'use client';

import React from 'react';
import { Card, CardContent } from './card';

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ 
  title = 'Erreur', 
  message, 
  suggestion, 
  onRetry, 
  onDismiss,
  variant = 'error'
}: ErrorMessageProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          container: 'border-yellow-200 bg-yellow-50',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          title: 'text-yellow-900',
          message: 'text-yellow-700',
          suggestion: 'text-yellow-600'
        };
      case 'info':
        return {
          container: 'border-blue-200 bg-blue-50',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          title: 'text-blue-900',
          message: 'text-blue-700',
          suggestion: 'text-blue-600'
        };
      default:
        return {
          container: 'border-red-200 bg-red-50',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          title: 'text-red-900',
          message: 'text-red-700',
          suggestion: 'text-red-600'
        };
    }
  };

  const styles = getVariantStyles();

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  return (
    <Card className={styles.container}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${styles.title}`}>
              {title}
            </h4>
            <p className={`${styles.message} mt-1`}>
              {message}
            </p>
            {suggestion && (
              <p className={`${styles.suggestion} text-sm mt-2`}>
                💡 {suggestion}
              </p>
            )}
            {(onRetry || onDismiss) && (
              <div className="flex gap-2 mt-3">
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className={`text-sm px-3 py-1 rounded border ${styles.icon} border-current hover:bg-opacity-10 transition-colors`}
                  >
                    Réessayer
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className={`text-sm px-3 py-1 rounded border ${styles.icon} border-current hover:bg-opacity-10 transition-colors`}
                  >
                    Fermer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
