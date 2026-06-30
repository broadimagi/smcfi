const menuBtn = document.getElementById("mobile-menu-btn");
const navList = document.getElementById("nav-list");

if (menuBtn && navList) {
  menuBtn.setAttribute("aria-expanded", "false");

  menuBtn.addEventListener("click", () => {
    const isOpen = navList.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
  });

  navList.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navList.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

const carousel = document.querySelector(".hero-carousel");

if (carousel) {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  const controls = document.querySelector(".hero-carousel-controls");
  let currentSlide = 0;
  let slideTimer;

  const showSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === currentSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentSlide);
    });
  };

  const startCarousel = () => {
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5500);
  };

  if (slides.length > 1) {
    controls?.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;

      const action = button.dataset.carouselAction;
      const dotIndex = button.dataset.carouselIndex;

      if (action === "prev") showSlide(currentSlide - 1);
      if (action === "next") showSlide(currentSlide + 1);
      if (dotIndex !== undefined) showSlide(Number(dotIndex));

      startCarousel();
    });

    startCarousel();
  }
}
