;(function ($) {
  'use strict';

  // Scroll to top
  $(window).on('scroll', function () {
    $('.backtop').toggleClass('reveal', $(window).scrollTop() > 70);
  });

  // Slick sliders
  $('.portfolio-single-slider').slick({ infinite: true, arrows: false, autoplay: true, autoplaySpeed: 2000 });
  $('.clients-logo').slick({
    infinite: true, arrows: false, autoplay: true,
    slidesToShow: 6, slidesToScroll: 6, autoplaySpeed: 6000,
    responsive: [{ breakpoint: 900, settings: { slidesToShow: 4, slidesToScroll: 4 } },
                 { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2 } }]
  });
  $('.testimonial-wrap').slick({ slidesToShow: 1, infinite: true, dots: true, arrows: false, autoplay: true, vertical: true, verticalSwiping: true, autoplaySpeed: 6000 });
  $('.testimonial-wrap-2').slick({ slidesToShow: 2, slidesToScroll: 2, infinite: true, dots: true, arrows: false, autoplay: true, autoplaySpeed: 6000 });

  // ==== Google Maps ====
  function initMap() {
    const mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(50.97797, -114.10771),
    };
    const mapCanvas = document.getElementById('map');
    if (mapCanvas) new google.maps.Map(mapCanvas, mapOptions);
  }
  window.initMap = initMap;

  // ==== Counter ====
  $('.counter-stat span').counterUp({ delay: 10, time: 1000 });

  // ==== Shuffle.js ====
  const shuffleContainer = document.querySelector('.shuffle-wrapper');
  if (shuffleContainer) {
    const myShuffle = new window.Shuffle(shuffleContainer, { itemSelector: '.shuffle-item', buffer: 1 });
    $('input[name="shuffle-filter"]').on('change', function (evt) {
      if (evt.currentTarget.checked) myShuffle.filter(evt.currentTarget.value);
    });
  }

  // ==== Backend API ====
  async function loadData() {
    try {
      const backendUrl =
        window.location.hostname === "localhost"
          ? "http://localhost:5000/api"
          : "http://backend:5000/api";
      const response = await fetch(backendUrl);
      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error calling backend:", error);
    }
  }

  $(document).ready(loadData);
})(jQuery);
