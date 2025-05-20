export const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="flex items-center justify-center gap-3">
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded bg-green-700/20 animate-ping"></div>
        <div className="relative h-full w-full rounded bg-green-700 flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-lg">SB</span>
        </div>
      </div>
    </div>
  </div>
);