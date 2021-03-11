
  const paintme = document.querySelector("#paintme");
  const btnPaintme = document.querySelector("#paintme-button");
  const canvas = document.querySelector("#canvas");
  const btnCloseModal = document.querySelectorAll(".btn-close-modal-size");
  const btnCloseModalBg = document.querySelectorAll(".btn-close-modal-bg");
 
  const btnBgTransparent = document.querySelector("#opt1");
  const btnBgWhite = document.querySelector("#opt2");
  const btnBgSquared = document.querySelector("#opt3");
  const btnBgLined = document.querySelector("#opt4");

  const modalSize = document.querySelector("#size-modal");
  const modalBg = document.querySelector("#bg-modal");

  const btnClose = document.querySelector(".btn-close");

  const btnShape = document.getElementById("fill-toggle");
  const btnBg = document.querySelector("#btn-bg");

  const btnSize = document.querySelector(".btn-si");


  btnCloseModal.forEach((buttonCloseModal) => {
    buttonCloseModal.addEventListener("click", () => {
      modalSize.classList.remove("show");
      modalBg.classList.remove("show");
    });
  });

  btnCloseModalBg.forEach((buttonCloseModal) => {
    buttonCloseModal.addEventListener("click", () => {
      modalBg.classList.remove("show");
      modalSize.classList.remove("show");
    });
  });
 
  btnBg.addEventListener("click", () => {
    modalBg.classList.toggle("show");
    modalSize.classList.remove("show");
  });

  btnPaintme.addEventListener("click", () => {
    console.log("Test")
    paintme.classList.toggle("show");
  });

  btnBgTransparent.addEventListener("click", () => {
    canvas.style.background = "transparent";
  });
  btnBgWhite.addEventListener("click", () => {
    canvas.style.background = "white";
    canvas.style.backgroundImage =
      "url('https://raw.githubusercontent.com/codechappie/paintme/master/assets/images/white.png')";
  });
  btnBgSquared.addEventListener("click", () => {
    canvas.style.background = "white";
    canvas.style.backgroundSize = "200px 200px";
    canvas.style.backgroundImage =
      "url('https://raw.githubusercontent.com/codechappie/paintme/master/assets/images/grid-pattern.png')";
    canvas.style.transition = "background .2s ease-in-out";
  });
  btnBgLined.addEventListener("click", () => {
    canvas.style.background = "white";
    canvas.style.backgroundSize = "600px 600px";
    canvas.style.backgroundImage =
      "url('https://raw.githubusercontent.com/codechappie/paintme/master/assets/images/lined.png')";
    canvas.style.transition = "background .2s ease-in-out";
  });

  btnShape.addEventListener("click", () => {
    console.log("active");
    btnShape.classList.toggle("active");
  });

  btnClose.addEventListener("click", () => {
    paintme.classList.toggle("show");
  });

  btnSize.addEventListener("click", () => {
    modalSize.classList.toggle("show");
    modalBg.classList.remove("show");
  });


// Get a regular interval for drawing to the screen
window.requestAnimFrame = (function (callback) {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimaitonFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();
