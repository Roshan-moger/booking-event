export const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-500 bg-opacity-20">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
)

// Alternative loading component with skeleton
 export const SkeletonLoader: React.FC = () => (
  <div className="p-6 space-y-4 animate-pulse bg-gray-500 bg-opacity-20 min-h-screen">
    <div className="h-8 bg-gray-400 bg-opacity-30 rounded w-3/4"></div>
    <div className="h-4 bg-gray-400 bg-opacity-30 rounded w-1/2"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-48 bg-gray-400 bg-opacity-30 rounded-lg"></div>
      ))}
    </div>
  </div>
)