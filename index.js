function makeCarouselInteractive({ sliderControlsClass, sliderRowClass, scrollbarClass }) {
    let currentVisibleVideoIndex = 0;
    const previousButton = document.querySelector(`.${sliderControlsClass} button[data-id="previous-btn"`);
    const nextButton = document.querySelector(`.${sliderControlsClass} button[data-id="next-btn"`);
    const carouselWrapper = document.querySelector(`.${sliderRowClass}`);
    const carousel = document.querySelector(`.${sliderRowClass} .col`);
    const carouselItems = [...carousel.querySelectorAll(`.${sliderRowClass} .col > .child_column`)];
    const scrollBar = document.querySelector(`.${scrollbarClass}`);
    const scrollBarThumb = document.querySelector(`.${scrollbarClass} .custom-scroll-bar-inner`);

    if (!carouselWrapper || !carousel || !carouselItems?.length) return;

    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }

    function scrollCarousel(direction) {
        if (
            (direction === "previous" && (currentVisibleVideoIndex === 0 || isInViewport(carouselItems[0]))) ||
            (direction === "next" &&
                (currentVisibleVideoIndex === carouselItems.length - 1 ||
                    isInViewport(carouselItems[carouselItems.length - 1])))
        )
            return;

        const newVisibleVideoIndex =
            direction === "previous" ? currentVisibleVideoIndex - 1 : currentVisibleVideoIndex + 1;
        currentVisibleVideoIndex = newVisibleVideoIndex;
        carousel.scrollLeft = carouselItems[newVisibleVideoIndex]?.offsetLeft;
    }

    function resetScrollBar() {
        if (!scrollBarThumb) return;

        const containerWidth = carouselWrapper.offsetWidth;
        const childWidth = carousel.scrollWidth;
        const thumbPercent = (containerWidth * 100) / childWidth;

        scrollBarThumb.style.pointerEvents = "none";
        scrollBarThumb.style.left = 0;
        scrollBarThumb.style.width = `${thumbPercent}%`;
    }

    function resetCarousel() {
        currentVisibleVideoIndex = 0;
        carousel.scrollLeft = carouselItems[0]?.offsetLeft;

        resetScrollBar();

        if (!previousButton || !nextButton) return;
        previousButton.disabled = true;
        if (isInViewport(carouselItems[carouselItems.length - 1])) nextButton.disabled = true;
        else nextButton.disabled = false;
    }

    function updateControlsAndScrollbarOnScroll() {
        if (nextButton && previousButton) {
            if (isInViewport(carouselItems[carouselItems.length - 1])) nextButton.disabled = true;
            else nextButton.disabled = false;
            if (isInViewport(carouselItems[0])) previousButton.disabled = true;
            else previousButton.disabled = false;
        }

        carouselItems.forEach((item, index) => {
            if (
                item.offsetLeft - carousel.scrollLeft > 0 &&
                item.offsetLeft - carousel.scrollLeft < item.clientWidth / 4
            )
                currentVisibleVideoIndex = index;
        });

        if (scrollBarThumb) {
            const childWidth = carousel.scrollWidth;
            const thumbOffsetPercent = (carousel.scrollLeft * 100) / childWidth;

            scrollBarThumb.style.left = `${thumbOffsetPercent}%`;
        }
    }

    function makeScrollBarInteractive(ev) {
        if (!scrollBarThumb) return;

        const { offsetWidth, offsetLeft } = ev.target;
        const clickXPercent = ((ev.x - offsetLeft) * 100) / offsetWidth;

        const newVisibleVideoIndex = Math.floor(clickXPercent / (100 / carouselItems.length));

        currentVisibleVideoIndex = newVisibleVideoIndex;
        carousel.scrollLeft = carouselItems[newVisibleVideoIndex]?.offsetLeft;
    }

    resetCarousel();

    if (previousButton && nextButton) {
        previousButton.addEventListener("click", () => scrollCarousel("previous"));
        nextButton.addEventListener("click", () => scrollCarousel("next"));
    }

    if (scrollBar) {
        scrollBar.addEventListener("click", makeScrollBarInteractive);
    }

    carousel.addEventListener("scroll", updateControlsAndScrollbarOnScroll);

    window.addEventListener("resize", resetCarousel);
}

window.addEventListener("load", () =>
    makeCarouselInteractive({
        sliderControlsClass: "my-custom-controls-class",
        sliderRowClass: "carousel",
        scrollbarClass: "my-custom-scrollbar-class"
    })
);
