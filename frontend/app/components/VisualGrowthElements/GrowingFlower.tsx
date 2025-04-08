import React from 'react';

const GrowingFlower = ({ growthStage, textLength, charsBeforeNextStep}: { growthStage: any, textLength: any, charsBeforeNextStep: any }) => {
  const colors = {
    stem: '#2E8B57',
    leaf: '#3CB371',
    petalLight: '#FFB6C1',
    petalMedium: '#DB7093',
    petalDark: '#C71585',
    center: '#DAA520',
  };

  const styles = {
    flower: {
      width: '100px',
      height: '150px',
      transition: 'all 0.5s ease',
      display: 'block',
      margin: 'auto',
    },
  };

  return (
    <svg
      style={styles.flower}
      viewBox="0 0 100 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Stem */}
      <path
        d={`M50,150 Q48,120 50,100`}
        stroke={colors.stem}
        strokeWidth="4"
        fill="none"
        opacity={`${textLength / charsBeforeNextStep}`}
      />

      {/* Stem pt. 2 */}
      {growthStage > 0 && (
        <path
          d={`M50,150 Q48,120 50,100 T50,70`}
          stroke={colors.stem}
          strokeWidth="4"
          fill="none"
          opacity={`${(textLength - charsBeforeNextStep * 1) / charsBeforeNextStep}`}
        />
      )}

      {/* Leaves */}
      {growthStage > 1 && (
        <>
          <path
            d="M50,120 Q60,110 65,115 Q60,120 50,120"
            fill={colors.leaf}
            opacity={`${(textLength - charsBeforeNextStep * 2) / charsBeforeNextStep}`}
          />
          <path
            d="M50,100 Q40,90 35,95 Q40,100 50,100"
            fill={colors.leaf}
            opacity={`${(textLength - charsBeforeNextStep * 2) / charsBeforeNextStep}`}
          />
        </>
      )}

      {/* Flower head */}
      {growthStage > 0 && (
        <g transform="translate(50,70)">
          {/* Center */}
          <circle r="8" fill={colors.center} opacity={`${(textLength - charsBeforeNextStep * 1) / charsBeforeNextStep}`} />
          
          {/* Petals */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) * Math.PI / 180;
            const visible = growthStage > Math.floor(i / 2);
            if (!visible) return null;

            const x = Math.cos(angle) * 20;
            const y = Math.sin(angle) * 20;
            
            return (
              <g key={i} transform={`translate(${x},${y})`}>
                <path
                  d={`M0,0 Q5,-5 0,-10 Q-5,-5 0,0`}
                  fill={colors.petalLight}
                  transform={`rotate(${angle * 180 / Math.PI})`}
                  opacity={`${(textLength - charsBeforeNextStep * (1 + (i / 2))) / charsBeforeNextStep}`}
                />
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

export default GrowingFlower;