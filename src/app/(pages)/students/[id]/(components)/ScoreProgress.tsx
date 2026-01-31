interface ScoreProgressProps {
  score: number;
  maxScore: number | null;
  cutline: number | null;
}

export const ScoreProgress = ({ score, maxScore, cutline }: ScoreProgressProps) => {
  const max = maxScore ?? 100;
  const percentage = Math.min((score / max) * 100, 100);
  const cutlinePercentage = cutline ? (cutline / max) * 100 : null;
  const isPassed = cutline !== null && score >= cutline;

  return (
    <div className="relative h-2 w-full overflow-hidden rounded-radius-full bg-components-fill-standard-tertiary">
      <div
        className={`absolute top-0 left-0 h-full rounded-radius-full transition-all ${
          isPassed ? "bg-solid-green" : cutline !== null ? "bg-solid-red" : "bg-solid-blue"
        }`}
        style={{ width: `${percentage}%` }}
      />
      {cutlinePercentage !== null && (
        <div
          className="absolute top-0 h-full w-0.5 bg-content-standard-tertiary"
          style={{ left: `${cutlinePercentage}%` }}
        />
      )}
    </div>
  );
};
