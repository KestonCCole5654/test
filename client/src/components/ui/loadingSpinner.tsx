export const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-full gap-3">
    <div className="relative h-8 w-8">
      <div className="absolute inset-0 rounded bg-green-700/20 animate-ping"></div>
      <div className="relative h-full w-full rounded bg-green-700 flex items-center justify-center animate-pulse">
        <img src="/icon1.svg" alt="SheetBills Logo" className="h-6 w-auto" />
      </div>
    </div>
    <span className="text-gray-500 font-cal-sans font-normal">Just a moment ...</span>
  </div>
);

export default LoadingSpinner;