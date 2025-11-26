import type { ServicesContent } from './types';
import { servicesGeneral } from './general';
import { foundationReadiness } from './details/foundation-readiness';
import { reportingReset } from './details/reporting-reset';
import { performanceDiagnostics } from './details/performance-diagnostics';
import { forecastingLab } from './details/forecasting-lab';
import { decisionPlaybooks } from './details/decision-playbooks';
import { smartAutomation } from './details/smart-automation';
import { augmentedIntelligenceStudio } from './details/augmented-intelligence-studio';
import { autonomyReadinessReview } from './details/autonomy-readiness-review';

export const servicesContent: ServicesContent = {
  ...servicesGeneral,
  details: [
    foundationReadiness,
    reportingReset,
    performanceDiagnostics,
    forecastingLab,
    decisionPlaybooks,
    smartAutomation,
    augmentedIntelligenceStudio,
    autonomyReadinessReview,
  ],
};

export type { ServiceDetail, ServicesContent } from './types';
