import { setupPageAnimations } from "../sections/utils/pageUtils";

// Contact form handler
function setupContactForm(): void {
  const form = document.getElementById("contact-form-element");
  const email = "hello@auxodata.com";

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("name") as HTMLInputElement)?.value || "";
    const userEmail = (document.getElementById("email") as HTMLInputElement)?.value || "";
    const company = (document.getElementById("company") as HTMLInputElement)?.value || "";
    const subject = (document.getElementById("subject") as HTMLInputElement)?.value || "";
    const message = (document.getElementById("message") as HTMLTextAreaElement)?.value || "";

    const subjectLine = encodeURIComponent(subject);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${userEmail}${company ? `\nCompany: ${company}` : ""}\n\nMessage:\n${message}`
    );

    const mailtoLink = `mailto:${email}?subject=${subjectLine}&body=${body}`;
    window.location.href = mailtoLink;
  });
}

// Contact page setup
export function setupContactPage(): void {
  setupPageAnimations();
  setupContactForm();
}

