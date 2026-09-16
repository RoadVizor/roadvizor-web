var menuToggle = document.getElementById("menu-toggle");
var menuIcon = document.getElementById("menu-icon");
var mobileMenu = document.getElementById("mobile-menu");
var header = document.getElementById("header");

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

var headerHeight = header.offsetHeight;
var isHeaderFixed = false;

function handleHeaderScroll() {
  if (window.scrollY > headerHeight && !isHeaderFixed) {
    isHeaderFixed = true;
    header.classList.add("header-fixed");
    document.body.style.paddingTop = headerHeight + "px"; 
  } else if (window.scrollY <= headerHeight && isHeaderFixed) {
    isHeaderFixed = false;
    header.classList.remove("header-fixed");
    document.body.style.paddingTop = "";
  }
}

window.addEventListener("scroll", handleHeaderScroll);

window.addEventListener("resize", function () {
  if (!isHeaderFixed) {
    headerHeight = header.offsetHeight;
  }
});
