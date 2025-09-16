'use client';

import React from 'react';
import { useOnboarding } from '../OnboardingProvider';

const steps = [
  { id: 'discordAuth', title: 'Discord', icon: '🎮' },
  { id: 'botCreation', title: 'Bot', icon: '🤖' },
  { id: 'serverSelection', title: 'Serveurs', icon: '🏠' },
  { id: 'channelSelection', title: 'Canaux', icon: '💬' },
  { id: 'obsidianConfig', title: 'Obsidian', icon: '📝' },
  { id: 'finalization', title: 'Final', icon: '✅' },
];

export function ProgressBar() {
  const { state } = useOnboarding();

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === state.currentStep;
          const isCompleted = state.steps[step.id as keyof typeof state.steps].completed;
          const isAccessible = index <= state.currentStep || isCompleted;

          return (
            <div key={step.id} className="flex flex-col items-center">
              {/* Cercle de l'étape */}
              <div
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                  transition-all duration-300 ease-in-out
                  ${isCompleted
                    ? 'bg-green-500 text-white shadow-lg'
                    : isActive
                    ? 'bg-blue-500 text-white shadow-lg scale-110'
                    : isAccessible
                    ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Titre de l'étape */}
              <span
                className={`
                  mt-2 text-sm font-medium text-center
                  ${isActive || isCompleted
                    ? 'text-gray-900'
                    : isAccessible
                    ? 'text-gray-600'
                    : 'text-gray-400'
                  }
                `}
              >
                {step.title}
              </span>

              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    absolute top-6 left-12 w-full h-0.5 -z-10
                    ${isCompleted
                      ? 'bg-green-500'
                      : isAccessible
                      ? 'bg-gray-300'
                      : 'bg-gray-200'
                    }
                  `}
                  style={{ width: 'calc(100% - 3rem)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Barre de progression globale */}
      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((state.currentStep + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Étape {state.currentStep + 1} sur {steps.length}</span>
          <span>{Math.round(((state.currentStep + 1) / steps.length) * 100)}% complété</span>
        </div>
      </div>
    </div>
  );
}
