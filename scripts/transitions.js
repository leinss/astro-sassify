// Enhanced page transitions
document.addEventListener("astro:page-load", () => {
  // Add a class to html to indicate the site is loaded
  document.documentElement.classList.add('astro-site-loaded');

  // Ensure the page is fully visible
  const pageWrapper = document.getElementById('page-wrapper');
  if (pageWrapper) {
    // Remove transitioning class if it exists
    pageWrapper.classList.remove('page-transitioning');
    // Force a repaint to prevent flashing
    void pageWrapper.offsetWidth;
    // Add loaded class
    pageWrapper.classList.add('page-loaded');
  }

  // Apply content-animate class to main sections
  const mainSections = document.querySelectorAll('main > section');
  mainSections.forEach((section, index) => {
    section.classList.add('content-animate');
    // Add staggered animation classes
    if (index > 0) {
      section.classList.add(`stagger-${Math.min(index, 3)}`);
    }
    // Add loaded class with a small delay
    setTimeout(() => {
      section.classList.add('loaded');
    }, 100);
  });

  // Add animation classes to elements with data-animate attribute
  const animatedElements = document.querySelectorAll("[data-animate]");

  animatedElements.forEach((element, index) => {
    const animationType = element.getAttribute("data-animate");
    const delay = element.getAttribute("data-delay") || index * 100;

    // Set animation delay
    element.style.animationDelay = `${delay}ms`;

    // Add animation class based on data-animate attribute
    setTimeout(() => {
      element.classList.add(animationType);
      element.classList.add("animated");
    }, 10);
  });

  // Parallax effect for elements with data-parallax attribute
  const parallaxElements = document.querySelectorAll("[data-parallax]");

  if (parallaxElements.length > 0) {
    const handleParallax = () => {
      parallaxElements.forEach((element) => {
        const speed = element.getAttribute("data-parallax") || 0.1;
        const yPos = -(window.scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    };

    window.addEventListener("scroll", handleParallax);
  }

  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const offsetTop =
          targetElement.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  // Page transition effects
  const pageTransitionElements = document.querySelectorAll(
    "[data-page-transition]",
  );

  pageTransitionElements.forEach((element) => {
    const transitionType = element.getAttribute("data-page-transition");
    element.classList.add(`transition-${transitionType}`);
  });
});

// Handle navigation events
document.addEventListener(
  "astro:before-preparation",
  ({ from, to }) => {
    // Add transitioning class to start the animation
    const pageWrapper = document.getElementById('page-wrapper');
    if (pageWrapper) {
      pageWrapper.classList.add('page-transitioning');
      pageWrapper.classList.remove('page-loaded');
    }

    // Remove loaded class from all content-animate elements
    const animatedElements = document.querySelectorAll('.content-animate');
    animatedElements.forEach(el => {
      el.classList.remove('loaded');
    });

    // Store navigation direction in localStorage to use it after page load
    if (from && to) {
      const fromPath = new URL(from).pathname;
      const toPath = new URL(to).pathname;

      // Determine navigation direction based on path depth
      const fromDepth = fromPath.split("/").filter(Boolean).length;
      const toDepth = toPath.split("/").filter(Boolean).length;

      let navDirection = "same";

      if (toDepth > fromDepth) {
        navDirection = "deeper";
      } else if (toDepth < fromDepth) {
        navDirection = "shallower";
      }

      localStorage.setItem("navigationDirection", navDirection);
    }
  },
);

// Handle navigation direction
document.addEventListener("astro:page-load", () => {
  const navDirection = localStorage.getItem("navigationDirection");

  if (navDirection) {
    document.documentElement.setAttribute("data-navigation", navDirection);

    // Clean up after transition completes
    setTimeout(() => {
      localStorage.removeItem("navigationDirection");
    }, 1000);
  }
});
