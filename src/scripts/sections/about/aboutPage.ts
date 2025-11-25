import { initCodeCarousel } from "./codeSection";
import { initMissionVisionCarousel } from "./missionVisionSection";
import { initGlobalMetricsCarousel } from "./globalSection";
import { setupPageAnimations } from "../utils/pageUtils";

export function setupAboutPageAnimations() {
  setupPageAnimations([
    initCodeCarousel,
    initMissionVisionCarousel,
    initGlobalMetricsCarousel,
  ]);
}

