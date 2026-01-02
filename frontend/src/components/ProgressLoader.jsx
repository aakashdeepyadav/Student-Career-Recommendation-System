import { useEffect, useState } from 'react';
import { CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const STEPS = [
  {
    id: 'riasec',
    title: 'Calculating Your RIASEC Profile',
    description: 'Analyzing your interests and personality traits...',
    icon: '🎯',
  },
  {
    id: 'cluster',
    title: 'Finding Your Career Cluster',
    description: 'Matching your profile to the best career cluster...',
    icon: '🔍',
  },
  {
    id: 'mapping',
    title: 'Mapping to Careers',
    description: 'Connecting your profile to relevant career paths...',
    icon: '🗺️',
  },
  {
    id: 'recommendations',
    title: 'Generating Recommendations',
    description: 'Calculating best career matches for you...',
    icon: '⭐',
  },
  {
    id: 'skill-gaps',
    title: 'Analyzing Skill Gaps',
    description: 'Identifying areas for improvement...',
    icon: '📊',
  },
  {
    id: 'visualization',
    title: 'Creating Visualizations',
    description: 'Generating interactive charts and graphs...',
    icon: '📈',
  },
];

function ProgressLoader({ currentStep = 0, isComplete = false }) {
  const [animatedSteps, setAnimatedSteps] = useState([]);

  useEffect(() => {
    // Animate steps as they complete
    if (currentStep > 0) {
      setAnimatedSteps((prev) => {
        const newSteps = [...prev];
        for (let i = 0; i < currentStep; i++) {
          if (!newSteps.includes(i)) {
            newSteps.push(i);
          }
        }
        return newSteps;
      });
    }
  }, [currentStep]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="relative w-full max-w-md mx-auto px-4">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 mb-3 animate-pulse">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isComplete ? 'Almost Done!' : 'Processing Your Profile'}
            </h2>
            <p className="text-sm text-gray-600">
              {isComplete
                ? 'Finalizing your personalized career recommendations...'
                : 'This will only take a moment'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep && !isComplete;
              const isCompleted = index < currentStep || isComplete;
              const isPending = index > currentStep && !isComplete;
              const isAnimated = animatedSteps.includes(index);

              return (
                <div
                  key={step.id}
                  className={`relative flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-md scale-[1.02]'
                      : isCompleted
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200 opacity-60'
                  }`}
                  style={{
                    animation: isAnimated && isCompleted ? 'slideInLeft 0.5s ease-out' : 'none',
                  }}
                >
                  {/* Step Number/Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md animate-pulse'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIconSolid className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">{step.icon}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold mb-0.5 transition-colors duration-300 text-sm ${
                        isActive
                          ? 'text-blue-700'
                          : isCompleted
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs transition-colors duration-300 ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Loading Spinner for Active Step */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Progress Bar - Connection Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute left-5 top-11 w-0.5 h-10 transition-all duration-500 ${
                        isCompleted ? 'bg-green-400' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Overall Progress</span>
              <span className="font-semibold">
                {isComplete ? '100%' : `${Math.min(Math.round(((currentStep + 1) / STEPS.length) * 100), 100)}%`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{
                  width: isComplete ? '100%' : `${Math.min(((currentStep + 1) / STEPS.length) * 100, 100)}%`,
                }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          {isComplete && (
            <div className="mt-4 text-center animate-fadeIn">
              <p className="text-green-600 font-semibold text-sm flex items-center justify-center space-x-2">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Redirecting to your results...</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressLoader;

