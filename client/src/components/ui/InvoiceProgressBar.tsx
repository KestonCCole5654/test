import React from 'react';
import { Eye, DollarSign, FileText, Mail, Check } from 'lucide-react';

interface InvoiceProgressBarProps {
  sendStatus?: string;
  paidStatus?: string;
}

const InvoiceProgressBar: React.FC<InvoiceProgressBarProps> = ({ sendStatus, paidStatus }) => {
  const steps = [
    {
      label: 'Invoice Created',
      done: true,
      icon: FileText,
      description: 'Invoice generated successfully'
    },
    {
      label: 'Email Sent',
      done: sendStatus === 'yes',
      icon: Mail,
      description: 'Invoice delivered to recipient'
    },
    {
      label: 'Email Opened',
      done: false,
      icon: Eye,
      description: 'Recipient viewed the invoice'
    },
    {
      label: 'Payment Received',
      done: paidStatus === 'Paid',
      icon: DollarSign,
      description: 'Invoice has been paid'
    }
  ];

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress container with relative positioning for the connecting line */}
        <div className="relative">
          {/* Background connecting line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 z-0"></div>

          {/* Active progress line */}
          <div
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 z-10 transition-all duration-700 ease-out"
            style={{"width": `${(steps.filter(step => step.done).length - 1) / (steps.length - 1) * 100}%`}}
          ></div>

          {/* Steps container */}
          <div className="relative z-20 flex justify-between items-start">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = step.done;
              const isNext = !isCompleted && steps.slice(0, idx).every(s => s.done);

              return (
                <div key={step.label} className="flex flex-col items-center group">
                  {/* Step circle with icon */}
                  <div className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 transform
                    ${isCompleted
                      ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-200 scale-110'
                      : isNext
                        ? 'bg-white border-emerald-400 shadow-md ring-4 ring-emerald-100 animate-pulse'
                        : 'bg-white border-gray-300 shadow-sm'
                    }
                    group-hover:scale-105 group-hover:shadow-lg
                  `}>
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white stroke-[3]" />
                    ) : (
                      <StepIcon className={`
                        w-5 h-5 transition-colors duration-300
                        ${isNext ? 'text-emerald-600' : 'text-gray-400'}
                      `} />
                    )}

                    {/* Animated ring for next step */}
                    {isNext && (
                      <div className="absolute inset-0 border-2 border-emerald-300 rounded-full animate-ping opacity-30"></div>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="mt-4 text-center max-w-[120px]">
                    <h3 className={`
                      text-sm font-semibold transition-colors duration-300 leading-tight
                      ${isCompleted
                        ? 'text-emerald-700'
                        : isNext
                          ? 'text-emerald-600'
                          : 'text-gray-500'
                      }
                    `}>
                      {step.label}
                    </h3>
                    <p className={`
                      text-xs mt-1 transition-colors duration-300 leading-tight
                      ${isCompleted
                        ? 'text-emerald-600'
                        : isNext
                          ? 'text-emerald-500'
                          : 'text-gray-400'
                      }
                    `}>
                      {step.description}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className="mt-2">
                    {isCompleted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 animate-fade-in">
                        Complete
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4 px-6 py-3 bg-gray-50 rounded-full">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {steps.filter(step => step.done).length} of {steps.length} steps completed
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm text-gray-500">
              {Math.round((steps.filter(step => step.done).length / steps.length) * 100)}% progress
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceProgressBar; 