import React from 'react';

interface SocialProofProps {}

const SocialProof: React.FC<SocialProofProps> = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-transparent max-w-md mx-auto ">
      <div className="flex -space-x-2">
        {[
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop'
        ].map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              alt={`User ${index + 1}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm hover:scale-110 transition-transform duration-200"
            />
            {index === 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <span className="text-white text-xs font-medium">+46</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center sm:text-left">
        <div className="flex justify-center sm:justify-start mb-2">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd"></path>
            </svg>
          ))}
        </div>
        <p className="text-gray-600 text-sm">
          Join <span className="font-semibold text-gray-900">46+</span> satisfied users
        </p>
      </div>
    </div>
  );
};

export default SocialProof; 