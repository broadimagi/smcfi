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
