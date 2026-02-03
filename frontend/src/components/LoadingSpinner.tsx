/**
 * Loading spinner component for lazy loaded modules
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-hagen-700"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}
