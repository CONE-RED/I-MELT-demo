/**
 * ConfidenceRingIndicator.tsx  
 * LazyFlow Component: Large, visual trust signal that builds user confidence
 * 
 * Philosophy: Users need to trust AI decisions - make confidence visually obvious
 */

import { cn } from '@/lib/utils';

interface ConfidenceRingIndicatorProps {
  confidence: number;
  size?: 'small' | 'medium' | 'large' | 'hero';
  showLabel?: boolean;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export default function ConfidenceRingIndicator({ 
  confidence, 
  size = 'medium',
  showLabel = true,
  showPercentage = true,
  variant = 'default',
  className 
}: ConfidenceRingIndicatorProps) {
  
  // LazyFlow: Determine variant automatically if not specified
  const autoVariant = variant === 'default' ? getAutoVariant(confidence) : variant;
  
  // Ring dimensions based on size
  const dimensions = {
    small: { size: 40, stroke: 3, text: 'text-xs' },
    medium: { size: 60, stroke: 4, text: 'text-sm' },
    large: { size: 80, stroke: 5, text: 'text-base' },
    hero: { size: 120, stroke: 6, text: 'text-lg font-semibold' }
  };

  const { size: ringSize, stroke, text } = dimensions[size];
  
  // Calculate circle geometry
  const radius = (ringSize - stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  // Colors based on confidence level and variant
  const colors = getVariantColors(autoVariant, confidence);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Main confidence ring */}
      <div className="relative inline-flex items-center justify-center">
        <svg 
          width={ringSize} 
          height={ringSize} 
          className="transform -rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            className="text-gray-200"
          />
          
          {/* Progress ring */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-out",
              colors.ring
            )}
          />
        </svg>
        
        {/* Center percentage */}
        {showPercentage && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            text,
            colors.text
          )}>
            {Math.round(confidence)}%
          </div>
        )}
      </div>

      {/* Confidence label */}
      {showLabel && (
        <div className="flex flex-col items-center gap-1">
          <span className={cn(
            "font-medium",
            size === 'hero' ? 'text-base' : 'text-sm',
            colors.text
          )}>
            {getConfidenceLabel(confidence)}
          </span>
          
          {/* Trust indicator for hero size */}
          {size === 'hero' && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              {getTrustIndicator(confidence)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LazyFlow Helper: Auto-determine variant based on confidence level
 */
function getAutoVariant(confidence: number): 'success' | 'warning' | 'danger' {
  if (confidence >= 85) return 'success';
  if (confidence >= 70) return 'warning';
  return 'danger';
}

/**
 * LazyFlow Helper: Get colors for different variants
 */
function getVariantColors(variant: string, confidence: number) {
  const baseColors = {
    success: {
      ring: 'text-green-500',
      text: 'text-green-700',
      bg: 'bg-green-50'
    },
    warning: {
      ring: 'text-yellow-500', 
      text: 'text-yellow-700',
      bg: 'bg-yellow-50'
    },
    danger: {
      ring: 'text-red-500',
      text: 'text-red-700', 
      bg: 'bg-red-50'
    }
  };

  return baseColors[variant as keyof typeof baseColors] || baseColors.success;
}

/**
 * LazyFlow Helper: Human-friendly confidence labels
 */
function getConfidenceLabel(confidence: number): string {
  if (confidence >= 95) return 'Excellent';
  if (confidence >= 90) return 'Very High';
  if (confidence >= 85) return 'High';
  if (confidence >= 75) return 'Good';
  if (confidence >= 65) return 'Moderate';
  if (confidence >= 50) return 'Low';
  return 'Very Low';
}

/**
 * LazyFlow Helper: Trust indicators with icons
 */
function getTrustIndicator(confidence: number): React.ReactNode {
  if (confidence >= 90) {
    return (
      <>
        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Highly Trusted</span>
      </>
    );
  }
  
  if (confidence >= 75) {
    return (
      <>
        <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>Reliable</span>
      </>
    );
  }
  
  return (
    <>
      <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <span>Verify Manually</span>
    </>
  );
}

/**
 * Hero Confidence Ring: Special large version for mission control
 */
export function HeroConfidenceRing({ 
  confidence, 
  title,
  subtitle,
  className 
}: {
  confidence: number;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <ConfidenceRingIndicator 
        confidence={confidence} 
        size="hero"
        showLabel={false}
        showPercentage={true}
      />
      
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-1 text-sm text-gray-600">
        {getTrustIndicator(confidence)}
      </div>
    </div>
  );
}