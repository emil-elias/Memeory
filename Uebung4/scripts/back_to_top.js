//Back to top button
let backToTopButton = document.getElementById("backToTop");
backToTopButton.onclick = topFunction;

//button anzeigen, wenn der user scrollt
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0; // Für Safari
  document.documentElement.scrollTop = 0; // Für Chrome, Firefox, IE und Opera
}