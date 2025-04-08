import React from 'react';

const GrowingButterfly = ({ growthStage, textLength, charsBeforeNextStep}: { growthStage: number, textLength: number, charsBeforeNextStep: number }) => {
  const colors = {
    body: '#333333',          // Dark gray for the butterfly's body
    wingTop: '#B39DDB',   // A soft purple for the upper wings
    wingBottom: '#D1C4E9', // A lighter purple for the lower wings
  };

  const styles: React.CSSProperties = {
    width: '150px',
    height: '150px',
    transition: 'all 0.5s ease',
    display: 'block',
    margin: 'auto',
  };

  // Helper function to calculate opacity for each stage
  const getOpacity = (stageIndex: number): string => {
    const start = stageIndex * charsBeforeNextStep;
    const rawValue = (textLength - start) / charsBeforeNextStep;
    const opacityValue = Math.min(1, Math.max(0, rawValue)); // Clamped between 0 and 1
    return isNaN(opacityValue) ? "0" : opacityValue.toString(); // Convert to string and handle NaN
  };

  return (
    <svg style={styles} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* Stage 1: Butterfly Body */}
      {growthStage >= 0 && (
        <rect
          x="95"
          y="80"
          width="10"
          height="40"
          fill={colors.body}
          rx="5"
          opacity={getOpacity(0)}
        />
      )}

      {/* Stage 2: Left Upper Wing */}
      {growthStage >= 1 && (
        <ellipse
          cx="75"
          cy="85"
          rx="15"
          ry="25"
          fill={colors.wingTop}
          opacity={getOpacity(1)}
          transform="rotate(135 75 85)"
        />
      )}

      {/* Stage 3: Right Upper Wing */}
      {growthStage >= 2 && (
        <ellipse
          cx="125"
          cy="85"
          rx="15"
          ry="25"
          fill={colors.wingTop}
          opacity={getOpacity(2)}
          transform="rotate(45 125 85)"
        />
      )}

      {/* Stage 4: Left Lower Wing */}
      {growthStage >= 3 && (
        <ellipse
          cx="75"
          cy="115"
          rx="15"
          ry="25"
          fill={colors.wingTop}
          opacity={getOpacity(3)}
          transform="rotate(45 75 115)"
        />
      )}

      {/* Stage 5: Right Lower Wing */}
      {growthStage >= 4 && (
        <ellipse
          cx="125"
          cy="115"
          rx="15"
          ry="25"
          fill={colors.wingTop}
          opacity={getOpacity(4)}
          transform="rotate(135 125 115)"
        />
      )}
    </svg>
  );
};

export default GrowingButterfly;
