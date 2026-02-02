interface OptimizeButtonProps {
  loading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function OptimizeButton({ loading, onClick, disabled }: OptimizeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full py-2.5 px-4 rounded-lg font-medium text-sm
        transition-all duration-200
        ${
          loading
            ? "bg-hagen-200 text-hagen-600 cursor-wait"
            : disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-hagen-600 text-white hover:bg-hagen-700 active:bg-hagen-800"
        }
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Optimisation...
        </span>
      ) : (
        "Optimiser les tournées"
      )}
    </button>
  );
}
