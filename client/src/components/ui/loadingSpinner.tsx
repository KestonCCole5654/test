export const LoadingSpinner = () => (
  <div className="flex flex-col justify-center items-center h-full gap-3">
    <div className="h-8 w-8 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

export default LoadingSpinner;