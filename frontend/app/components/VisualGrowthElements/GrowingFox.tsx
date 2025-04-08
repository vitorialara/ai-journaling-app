import React from 'react';

/**
 * Grows a cartoon fox in 5 stages:
 * 1. Orange circular face
 * 2. Orange triangular ears
 * 3. Black triangular nose
 * 4. Black eyes
 * 5. Gray whiskers
 *
 * The `growthStage` prop indicates which stage(s) should be visible,
 * and each stage's opacity also fades in based on textLength.
 */
const GrowingFox = ({ growthStage, textLength, charsBeforeNextStep}: { growthStage: number; textLength: number; charsBeforeNextStep: number;
}) => {
  // Basic color palette
  const colors = {
    face: '#ff9400',
    whiskers: '#7f807f',
    black: '#000000',
  };

  const styles: React.CSSProperties = {
    width: '150px',
    height: '150px',
    transition: 'all 0.5s ease',
    display: 'block',
    margin: 'auto',
  };

  /**
   * Returns a smooth opacity for the given stage index.
   * - Once textLength has passed (stageIndex * charsBeforeNextStep),
   *   the shape begins to fade in.
   */
  const getOpacity = (stageIndex: number): number => {
    const start = stageIndex * charsBeforeNextStep;
    const rawValue = (textLength - start) / charsBeforeNextStep;
    return Math.min(1, Math.max(0, rawValue)); // clamp between 0 and 1
  };

  return (
    <svg
      style={styles}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 
        STAGE 1: Orange circular face 
        (Visible if growthStage >= 0)
      */}
      {growthStage >= 0 && (
        <circle
          cx="100"
          cy="100"
          r="50"
          fill={colors.face}
          opacity={getOpacity(0)}
        />
      )}

      {/* 
        STAGE 2: Orange triangular ears 
        (Visible if growthStage >= 1)
      */}
      {growthStage >= 1 && (
        <g opacity={getOpacity(1)}>
        {/* Left ear - droopy */}
        <polygon
          points="65,30 85,65 52,85"
          fill={colors.face}
        />
        {/* Right ear */}
        <polygon
          points="135,30 115,65 148,85"
          fill={colors.face}
        />
      </g>
      )}

      {/* 
        STAGE 3: Triangular nose
        (Visible if growthStage >= 2)
      */}
      {growthStage >= 2 && (
        <polygon
          points="100,119 93,110 107,110"
          fill={colors.black}
          opacity={getOpacity(2)}
        />
      )}

      {/* 
        STAGE 4: Black eyes 
        (Visible if growthStage >= 3)
      */}
      {growthStage >= 3 && (
        <g opacity={getOpacity(3)}>
          {/* Left eye */}
          <circle cx="80" cy="85" r="5" fill={colors.black} />
          {/* Right eye */}
          <circle cx="120" cy="85" r="5" fill={colors.black} />
        </g>
      )}

      {/* 
        STAGE 5: Gray whiskers
        (Visible if growthStage >= 4)
      */}
      {growthStage >= 4 && (
        <g opacity={getOpacity(4)}>
          <line x1="85" y1="115" x2="50" y2="105" stroke={colors.whiskers} strokeWidth="1.5" />
          <line x1="85" y1="120" x2="45" y2="115" stroke={colors.whiskers} strokeWidth="1.5" />
          <line x1="85" y1="125" x2="48" y2="130" stroke={colors.whiskers} strokeWidth="1.5" />
        
          <line x1="115" y1="115" x2="150" y2="105" stroke={colors.whiskers} strokeWidth="1.5" />
          <line x1="115" y1="120" x2="155" y2="115" stroke={colors.whiskers} strokeWidth="1.5" />
          <line x1="115" y1="125" x2="152" y2="130" stroke={colors.whiskers} strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
};

export default GrowingFox;
