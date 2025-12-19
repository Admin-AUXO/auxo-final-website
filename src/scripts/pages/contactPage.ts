import { setupPageAnimations } from "../sections/utils/pageUtils";

function setupContactForm(): void {
  const form = document.getElementById("contact-form-element");
  if (!form) return;

  const email = "hello@auxodata.com";

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

    window.location.href = `mailto:${email}?subject=${subjectLine}&body=${body}`;
  });
}

export function setupContactPage(): void {
  setupPageAnimations();
  setupContactForm();
}

