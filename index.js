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
        //  Return true if left side of element is after the left
        //  of the screen and its right side is before the end of the screen
        return rect.left >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
    }

    function scrollCarouselByDirection(direction) {
        // Early return if trying to go left of the first element or right on the last element
        if (
            (direction === "previous" && (currentVisibleVideoIndex === 0 || isInViewport(carouselItems[0]))) ||
            (direction === "next" &&
                (currentVisibleVideoIndex === carouselItems.length - 1 ||
                    isInViewport(carouselItems[carouselItems.length - 1])))
        )
            return;

        // Update current visible index and scroll carousel
        const newVisibleVideoIndex =
            direction === "previous" ? currentVisibleVideoIndex - 1 : currentVisibleVideoIndex + 1;
        currentVisibleVideoIndex = newVisibleVideoIndex;
        carousel.scrollLeft = carouselItems[newVisibleVideoIndex]?.offsetLeft;
    }

    function scrollCarouselByIndex(index) {
        // Early return if trying to go left of the first element or right on the last element
        if (
            (index === 0 && (currentVisibleVideoIndex === 0 || isInViewport(carouselItems[0]))) ||
            (index === carouselItems.length - 1 &&
                (currentVisibleVideoIndex === carouselItems.length - 1 ||
                    isInViewport(carouselItems[carouselItems.length - 1])))
        )
            return;

        // Update current visible index and scroll carousel
        currentVisibleVideoIndex = index;
        carousel.scrollLeft = carouselItems[index]?.offsetLeft;
    }

    function resetScrollBar() {
        if (!scrollBarThumb) return;

        const containerWidth = carouselWrapper.offsetWidth;
        const childWidth = carousel.scrollWidth;
        // Calculate scrollbar thumb width as percentage of the view width
        const thumbPercent = (containerWidth * 100) / childWidth;

        scrollBarThumb.style.pointerEvents = "none";
        scrollBarThumb.style.left = 0;
        scrollBarThumb.style.width = `${thumbPercent}%`;
    }

    function updateControlsAndScrollbarOnScroll() {
        if (nextButton && previousButton) {
            // Update buttons state depending on carousel position
            if (isInViewport(carouselItems[carouselItems.length - 1])) nextButton.disabled = true;
            else nextButton.disabled = false;
            if (isInViewport(carouselItems[0])) previousButton.disabled = true;
            else previousButton.disabled = false;
        }

        if (scrollBarThumb) {
            // Update scroll bar thumb position in relation with current carousel scroll state
            const childWidth = carousel.scrollWidth;
            const thumbOffsetPercent = (carousel.scrollLeft * 100) / childWidth;

            scrollBarThumb.style.left = `${thumbOffsetPercent}%`;
        }
    }

    function updateIndexOnScrollEnd() {
        // Recalculate current visible index after scroll. This is to avoid the last element
        // to be marked as current if previous element is also completely in view.
        let updated = false;
        carouselItems.forEach((item, index) => {
            if (updated) return;
            const itemX = item.offsetLeft - carousel.scrollLeft;
            if (itemX > 0) {
                updated = true;
                currentVisibleVideoIndex = index;
            }
        });
    }

    function makeScrollBarInteractive(ev) {
        if (!scrollBarThumb) return;

        // Calculate the percentage from the left of the click event
        const { offsetWidth, offsetLeft } = ev.target;
        const clickXPercent = ((ev.x - offsetLeft) * 100) / offsetWidth;

        // Define new item index depending on the click event.
        const newVisibleVideoIndex = Math.floor(clickXPercent / (100 / carouselItems.length));

        // Update index and scroll carousel
        currentVisibleVideoIndex = newVisibleVideoIndex;
        carousel.scrollLeft = carouselItems[newVisibleVideoIndex]?.offsetLeft;
    }

    function resetCarousel() {
        scrollCarouselByIndex(0);
        resetScrollBar();
        updateControlsAndScrollbarOnScroll();
    }

    resetCarousel();

    if (previousButton && nextButton) {
        previousButton.addEventListener("click", () => scrollCarouselByDirection("previous"));
        nextButton.addEventListener("click", () => scrollCarouselByDirection("next"));
    }

    if (scrollBar) {
        scrollBar.addEventListener("click", makeScrollBarInteractive);
    }

    carousel.addEventListener("scroll", updateControlsAndScrollbarOnScroll);
    carousel.addEventListener("scrollend", updateIndexOnScrollEnd);

    window.addEventListener("resize", resetCarousel);
}

window.addEventListener("load", () =>
    makeCarouselInteractive({
        sliderControlsClass: "my-custom-controls-class",
        sliderRowClass: "carousel",
        scrollbarClass: "my-custom-scrollbar-class"
    })
);
