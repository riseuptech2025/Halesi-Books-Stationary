// client/src/components/StarRating.jsx
export default function StarRating({
  value = 0,
  size = 16,
  onChange = null,
  readOnly = true,
}) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => {
        const filled = value >= s;
        const half = !filled && value >= s - 0.5;
        const Icon = filled ? "full" : half ? "half" : "empty";

        return (
          <button
            key={s}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(s)}
            className={`transition ${
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            {Icon === "full" && (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="#facc15">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
            {Icon === "half" && (
              <svg width={size} height={size} viewBox="0 0 24 24">
                <defs>
                  <linearGradient id={`half-${s}-${size}`}>
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${s}-${size})`}
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            )}
            {Icon === "empty" && (
              <svg width={size} height={size} viewBox="0 0 24 24" fill="#e5e7eb">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}