document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".alert")
    .forEach((a) => setTimeout(() => (a.style.opacity = ".95"), 3500));
});
