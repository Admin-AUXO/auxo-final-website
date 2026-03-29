function updateConnectionStatus(): void {
  const statusElement = document.querySelector(".status-indicator");
  if (!statusElement) return;

  if (navigator.onLine) {
    statusElement.classList.remove("offline");
    statusElement.classList.add("online");
    statusElement.textContent = "Back Online";
    window.setTimeout(() => {
      window.location.reload();
    }, 2000);
    return;
  }

  statusElement.classList.remove("online");
  statusElement.classList.add("offline");
  statusElement.textContent = "Offline";
}

function bindRetryButton(): void {
  const retryButton = document.getElementById("offline-retry-button");
  if (!retryButton) return;

  retryButton.addEventListener("click", () => {
    window.location.reload();
  });
}

function initOfflinePage(): void {
  bindRetryButton();
  updateConnectionStatus();
}

if (!window.__auxoOfflinePageBound) {
  window.__auxoOfflinePageBound = true;
  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
  document.addEventListener("astro:page-load", initOfflinePage);
}

initOfflinePage();
