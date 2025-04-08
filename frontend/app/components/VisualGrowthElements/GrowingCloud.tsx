import React from 'react';

const GrowingCloud = ({ growthStage, textLength, charsBeforeNextStep }: { growthStage: any, textLength: any, charsBeforeNextStep: any }) => {
  const colors = {
    cloud: '#c4c4c4',      // main white color for the cloud
    raindrop: '#87CEEB',   // sky blue for raindrops if added later
    outline: '#24a6db',    // darker blue outline for raindrops
    sun: '#fff400',    // bright yellow for the sun
  };

  const styles = {
    cloud: {
      width: '100px',
      height: '150px',
      transition: 'all 0.5s ease',
      display: 'block',
      margin: 'auto',
    },
  };

  return (
    <svg style={styles.cloud} viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
    {/* Sun (Stage 4) */}
    {growthStage >= 0 && (
        <circle
        cx="90"
        cy="15"
        r="80"
        fill={colors.sun}
        opacity={textLength < (charsBeforeNextStep * 4) ? 0 : `${(textLength - charsBeforeNextStep * 4) / charsBeforeNextStep}`}
      />
      )}

      {/* Base cloud shape (Stage 0) */}
      <circle
        cx="90"
        cy="60"
        r="60"
        fill={colors.cloud}

        opacity={`${(textLength) / charsBeforeNextStep}`}
      />
      
      {/* Left puff (Stage 1) */}
      {growthStage >= 1 && (
        <circle
          cx="40"
          cy="70"
          r="40"
          fill={colors.cloud}
          opacity={`${(textLength - charsBeforeNextStep * 1) / charsBeforeNextStep}`}
        />
      )}

      {/* Right puff (Stage 2) */}
      {growthStage >= 2 && (
        <circle
          cx="140"
          cy="70"
          r="40"
          fill={colors.cloud}
          opacity={`${(textLength - charsBeforeNextStep * 2) / charsBeforeNextStep}`}
        />
      )}

      {/* Raindrops (Stage 3) */}
      {growthStage >= 3 && (
        <g>
        {[...Array(3)].map((_, i) => {
            const visible = growthStage > Math.floor(i / 2);
            if (!visible) return null;
            return (
                <g key={i} transform={`translate(${-20 + (40 * i)}, ${(20 * i) % 40})`}>
                    <path d="M10 2 C16 8, 18 16, 18 22 C18 27.4, 14.4 30, 10 30 C5.6 30, 2 27.4, 2 22 C2 16, 4 8, 10 2 Z" 
                    transform="translate(60, 110)"
                    fill={colors.raindrop} 
                    stroke={colors.outline} 
                    strokeWidth="1"
                    opacity={`${(textLength - charsBeforeNextStep * (3 + i / 3)) / charsBeforeNextStep}`}
                    />
                </g>
            )
        })}
        </g>
    )}
    </svg>
  );
};

export default GrowingCloud;