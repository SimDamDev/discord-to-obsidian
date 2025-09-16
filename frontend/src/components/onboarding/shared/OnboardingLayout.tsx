'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressBar } from './ProgressBar';
import { StepNavigation } from './StepNavigation';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  nextText?: string;
  previousText?: string;
  showNext?: boolean;
  showPrevious?: boolean;
}

export function OnboardingLayout({
  children,
  title,
  description,
  icon,
  onNext,
  onPrevious,
  nextDisabled = false,
  previousDisabled = false,
  nextText,
  previousText,
  showNext = true,
  showPrevious = true,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Discord to Obsidian
          </h1>
          <p className="text-lg text-gray-600">
            Configuration guidée de votre surveillance Discord
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar />

        {/* Main Content */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              {icon && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                  {icon}
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {title}
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 mt-2">
              {description}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {children}

            {/* Navigation */}
            <StepNavigation
              onNext={onNext}
              onPrevious={onPrevious}
              nextDisabled={nextDisabled}
              previousDisabled={previousDisabled}
              nextText={nextText}
              previousText={previousText}
              showNext={showNext}
              showPrevious={showPrevious}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Besoin d'aide ? Consultez notre{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 underline">
              guide d'utilisation
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
