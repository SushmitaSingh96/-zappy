

// Smooth fade-in animation
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.15,
  }
);

document
  .querySelectorAll(
    ".hero-copy, .hero-visual, .section-heading, .demo-card, .problem-card, .wordcloud-card, .solution-card, .about-card, blockquote"
  )
  .forEach((el) => observer.observe(el));

// Active navbar link while scrolling
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".site-nav a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;

    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");

    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Smooth scrolling for navigation
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = link.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Subtle parallax effect for hero card
const heroVisual = document.querySelector(".hero-visual");

window.addEventListener("mousemove", (e) => {
  if (!heroVisual) return;

  const x = (window.innerWidth / 2 - e.clientX) / 80;
  const y = (window.innerHeight / 2 - e.clientY) / 80;

  heroVisual.style.transform = `translate(${x}px, ${y}px)`;
});