import { useEffect, useState } from "react";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid";

const STEPS = [
  {
    id: "riasec",
    title: "Calculating Your RIASEC Summary",
    description: "Analyzing your interests and personality traits...",
    icon: "🎯",
  },
  {
    id: "cluster",
    title: "Finding Your Career Cluster",
    description: "Matching your responses to the best career cluster...",
    icon: "🔍",
  },
  {
    id: "mapping",
    title: "Mapping to Careers",
    description: "Connecting your assessment to relevant career paths...",
    icon: "🗺️",
  },
  {
    id: "recommendations",
    title: "Generating Recommendations",
    description: "Calculating best career matches for you...",
    icon: "⭐",
  },
  {
    id: "skill-gaps",
    title: "Analyzing Skill Gaps",
    description: "Identifying areas for improvement...",
    icon: "📊",
  },
  {
    id: "visualization",
    title: "Creating Visualizations",
    description: "Generating interactive charts and graphs...",
    icon: "📈",
  },
];

function ProgressLoader({ currentStep = 0, isComplete = false }) {
  const [animatedSteps, setAnimatedSteps] = useState([]);
  const safeStep = Math.max(0, Math.min(currentStep, STEPS.length - 1));
  const progress = isComplete
    ? 100
    : Math.max(8, Math.min(((safeStep + 1) / STEPS.length) * 100, 98));
  const activeStep = STEPS[safeStep];

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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div className="relative w-full max-w-lg mx-auto px-4">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-7 animate-scaleIn border border-slate-200/70">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.09em] text-cyan-700 mb-1">
                  Processing Submission
                </p>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {isComplete ? "Finalizing Results" : "Preparing Your Report"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isComplete
                    ? "Final checks are done. Opening results now..."
                    : activeStep?.description || "Please wait a moment."}
                </p>
              </div>

              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#loaderGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 276.46} 276.46`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient
                      id="loaderGradient"
                      x1="0"
                      y1="0"
                      x2="100"
                      y2="100"
                    >
                      <stop offset="0%" stopColor="#0f4f63" />
                      <stop offset="100%" stopColor="#0f766e" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-cyan-700" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>
                Step {isComplete ? STEPS.length : safeStep + 1} of{" "}
                {STEPS.length}
              </span>
              <span className="font-semibold text-slate-700">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-700 to-teal-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isComplete
                ? "Ready. Redirecting to your personalized report..."
                : activeStep?.title}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-2.5">
            {STEPS.map((step, index) => {
              const isActive = index === safeStep && !isComplete;
              const isCompleted = index < currentStep || isComplete;
              const isAnimated = animatedSteps.includes(index);

              return (
                <div
                  key={step.id}
                  className={`relative flex items-start space-x-3 p-3.5 rounded-xl transition-all duration-500 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 shadow-sm"
                      : isCompleted
                        ? "bg-emerald-50 border border-emerald-200"
                        : "bg-slate-50 border border-slate-200 opacity-70"
                  }`}
                  style={{
                    animation:
                      isAnimated && isCompleted
                        ? "slideInLeft 0.5s ease-out"
                        : "none",
                  }}
                >
                  {/* Step Number/Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all duration-500 ${
                      isActive
                        ? "bg-gradient-to-br from-cyan-700 to-teal-600 text-white shadow-sm"
                        : isCompleted
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-300 text-slate-600"
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
                          ? "text-cyan-800"
                          : isCompleted
                            ? "text-emerald-700"
                            : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-xs transition-colors duration-300 ${
                        isActive
                          ? "text-cyan-700"
                          : isCompleted
                            ? "text-emerald-600"
                            : "text-slate-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  {/* Loading Spinner for Active Step */}
                  {isActive && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Progress Bar - Connection Line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`absolute left-5 top-11 w-0.5 h-10 transition-all duration-500 ${
                        isCompleted ? "bg-emerald-400" : "bg-slate-200"
                      }`}
                      style={{ zIndex: -1 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Message */}
          {isComplete && (
            <div className="mt-4 text-center animate-fadeIn">
              <p className="text-emerald-600 font-semibold text-sm flex items-center justify-center space-x-2">
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
