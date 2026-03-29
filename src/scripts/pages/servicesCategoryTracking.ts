import { trackServiceCategoryView } from "@/scripts/analytics/ga4";

const isServicesRoute =
  window.location.pathname === "/services" ||
  window.location.pathname === "/services/";

if (isServicesRoute) {
  trackServiceCategoryView("data-analytics-services");
}
