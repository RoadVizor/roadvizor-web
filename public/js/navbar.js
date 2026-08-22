var menuToggle = document.getElementById("menu-toggle");
var menuIcon = document.getElementById("menu-icon");
var mobileMenu = document.getElementById("mobile-menu");

var isMenuOpen = false;

function openMenu() {
  isMenuOpen = true;
  mobileMenu.classList.remove("hidden");
  menuIcon.classList.remove("ph-list");
  menuIcon.classList.add("ph-x");
}

function closeMenu() {
  isMenuOpen = false;
  mobileMenu.classList.add("hidden");
  menuIcon.classList.remove("ph-x");
  menuIcon.classList.add("ph-list");
}

menuToggle.addEventListener("click", function () {
  if (isMenuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

var mobileMenuLinks = mobileMenu.querySelectorAll("a");
mobileMenuLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    closeMenu();
  });
});

window.addEventListener("resize", function () {
  if (window.innerWidth >= 1024 && isMenuOpen) {
    closeMenu();
  }
});
