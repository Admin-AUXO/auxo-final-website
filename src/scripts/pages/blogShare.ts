const X_SELECTOR = "#share-twitter, #share-twitter-mobile";
const LINKEDIN_SELECTOR = "#share-linkedin, #share-linkedin-mobile";
const COPY_SELECTOR = "#share-copy, #share-copy-mobile";

function openShareWindow(url: string): void {
  window.open(url, "_blank");
}

function handleShareClick(event: Event): void {
  const target = event.target as Element | null;
  if (!target) return;

  if (target.closest(X_SELECTOR)) {
    event.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    openShareWindow(`https://twitter.com/intent/tweet?url=${url}&text=${title}`);
    return;
  }

  if (target.closest(LINKEDIN_SELECTOR)) {
    event.preventDefault();
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    openShareWindow(
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    );
    return;
  }

  const copyButton = target.closest(COPY_SELECTOR) as HTMLElement | null;
  if (!copyButton) return;

  event.preventDefault();
  navigator.clipboard
    .writeText(window.location.href)
    .then(() => {
      const icon = copyButton.querySelector("svg");
      if (!icon) return;
      icon.style.color = "var(--accent-green)";
      window.setTimeout(() => {
        icon.style.color = "";
      }, 2000);
    })
    .catch((error) => {
      console.error("Failed to copy", error);
    });
}

if (!window.__auxoBlogShareBound) {
  window.__auxoBlogShareBound = true;
  document.addEventListener("click", handleShareClick);
}
