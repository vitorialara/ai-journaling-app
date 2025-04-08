import React from 'react'

import GrowingFlower from "./GrowingFlower"
import GrowingCloud from "./GrowingCloud"
import GrowingFox from "./GrowingFox"
import GrowingCactus from "./GrowingCactus"
import GrowingButterfly from "./GrowingButterfly"

export function GrowingChooser({ emotion, growthStage, textLength, charsBeforeNextStep}: { emotion: any, growthStage: any, textLength: any, charsBeforeNextStep: any} ) {
    if (emotion === "calm") {
        return GrowingCactus({growthStage: growthStage, textLength: textLength, charsBeforeNextStep: charsBeforeNextStep});
    } else if (emotion === "happy") {
        return GrowingFlower({growthStage: growthStage, textLength: textLength, charsBeforeNextStep: charsBeforeNextStep});
    } else if (emotion === "sad") {
        return GrowingCloud({growthStage: growthStage, textLength: textLength, charsBeforeNextStep: charsBeforeNextStep});
    } else if (emotion === "angry") {
        return GrowingFox({growthStage: growthStage, textLength: textLength, charsBeforeNextStep: charsBeforeNextStep});
    } else {
        return GrowingButterfly({growthStage: growthStage, textLength: textLength, charsBeforeNextStep: charsBeforeNextStep});
    }

}