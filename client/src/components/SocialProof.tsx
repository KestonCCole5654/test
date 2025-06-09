import React from 'react';

interface SocialProofProps {}

const SocialProof: React.FC<SocialProofProps> = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto mt-12">
      <div className="flex -space-x-3">
        {[1, 2, 3, 4].map((n) => (
          <img
            key={n}
            src={`https://png.pngtree.com/thumb_back/fh260/background/20230615/pngtree-man-wearing-a-pair-of-yellow-sunglasses-in-front-of-a-image_2898170.jpg`}
            alt={`User ${n}`}
            className="w-12 h-12 rounded-full border-3 border-white shadow-sm"
          />
        ))}
      </div>
      <div className="text-center sm:text-left">
        <div className="flex justify-center sm:justify-start mb-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-yellow-600" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd"></path>
            </svg>
          ))}
        </div>
        <p className="text-gray-600 text-sm">
          Join <span className="font-semibold text-gray-900">250+</span> satisfied users
        </p>
      </div>
    </div>
  );
};

export default SocialProof; 