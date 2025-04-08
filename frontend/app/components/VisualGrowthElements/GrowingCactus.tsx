import React from 'react';

const GrowingCactus = ({ growthStage, textLength, charsBeforeNextStep }: { growthStage: number; textLength: number; charsBeforeNextStep: number}) => {
  const colors = {
    body: '#4CAF50',     // Main green for the cactus body and arms
    flower: '#FFC107',   // Bright yellow for the blooming flower
    spinies: '#7f807f',      // Gray color for spinies
  };

  const styles: React.CSSProperties = {
    width: '150px',
    height: '150px',
    transition: 'all 0.5s ease',
    display: 'block',
    margin: 'auto',
  };

  /**
   * Calculates the opacity for a given stage based on textLength.
   * Once textLength passes (stageIndex * charsBeforeNextStep),
   * the element begins to fade in.
   */
  const getOpacity = (stageIndex: number): number => {
    const start = stageIndex * charsBeforeNextStep;
    const rawValue = (textLength - start) / charsBeforeNextStep;
    return Math.min(1, Math.max(0, rawValue));
  };

  return (
    <svg style={styles} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      {/* 
        STAGE 1: Main cactus body 
        A rounded rectangle representing the cactus.
      */}
      {growthStage >= 0 && (
        <rect
          x="80"
          y="40"
          width="40"
          height="120"
          rx="15"
          fill={colors.body}
          opacity={getOpacity(0)}
        />
      )}

      {/* 
        STAGE 2: Left arm of the cactus 
        An ellipse representing the left arm.
      */}
      {growthStage >= 1 && (
        <ellipse
          cx="70"
          cy="90"
          rx="15"
          ry="25"
          fill={colors.body}
          opacity={getOpacity(1)}
        />
      )}

      {/* 
        STAGE 3: Right arm of the cactus 
        An ellipse representing the right arm.
      */}
      {growthStage >= 2 && (
       <g opacity={getOpacity(2)}>
        <ellipse
            cx="145"
            cy="85"
            rx="15"
            ry="25"
            fill={colors.body}
            />
        <ellipse
            cx="130"
            cy="100"
            rx="25"
            ry="15"
            fill={colors.body}
        />
        </g>
      )}

      {/* 
        STAGE 4: A blooming flower on top of the cactus 
        A small circle representing a flower.
      */}
      {growthStage >= 3 && (
        <circle
          cx="100"
          cy="35"
          r="8"
          fill={colors.flower}
          opacity={getOpacity(3)}
        />
      )}

      {/* 
        STAGE 5: Terracotta pot at the bottom 
        A rectangle representing the pot.
      */}
      {growthStage >= 4 && (
        <g>
        {[...Array(4)].map((_, i) => {
            const visible = growthStage > Math.floor(i / 2);
            if (!visible) return null;
            return (
                <g key={i} transform={`translate(0, ${20 * i})`} opacity={`${(textLength - charsBeforeNextStep * (4 + i / 4)) / charsBeforeNextStep}`}>
                <line x1="92" y1="70" x2="87" y2="60" stroke={colors.spinies} strokeWidth="1.5" />
                <line x1="107" y1="70" x2="112" y2="60" stroke={colors.spinies} strokeWidth="1.5" />
                </g>
            )
         })}
        </g>
      )}
    </svg>
  );
};

export default GrowingCactus;
