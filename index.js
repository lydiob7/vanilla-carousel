function makeCarouselInteractive({ scrollbarClass }) {
    let currentVisibleVideoIndex = 0;
    const previousButtons = [...document.querySelectorAll(`.controls-wrapper .previous-btn`)];
    const nextButtons = [...document.querySelectorAll(`.controls-wrapper .next-btn`)];
    const carouselWrapper = document.querySelector(`.carousel`);
    const carousel = document.querySelector(`.carousel .carousel-items-wrapper`);
    const carouselItems = [...carousel.querySelectorAll(`.carousel .carousel-items-wrapper > .carousel-item`)];
    const scrollBar = document.querySelector(`.${scrollbarClass}`);
    const scrollBarThumb = document.querySelector(`.${scrollbarClass} .custom-scroll-bar-inner`);

    if (!carouselWrapper || !carousel || !carouselItems?.length) return;

    let updatedScrollBarThumbPosition = false;

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

    function toggleButtons(buttons, bool) {
        buttons.forEach((btn) => {
            if (bool) btn.classList.add("disabled");
            else btn.classList.remove("disabled");
        });
    }

    function updateControlsAndScrollbarOnScroll() {
        if (nextButtons?.length && previousButtons?.length) {
            // Update buttons state depending on carousel position
            if (isInViewport(carouselItems[carouselItems.length - 1])) toggleButtons(nextButtons, true);
            else toggleButtons(nextButtons, false);
            if (isInViewport(carouselItems[0])) toggleButtons(previousButtons, true);
            else toggleButtons(previousButtons, false);
        }

        if (scrollBarThumb) {
            if (!updatedScrollBarThumbPosition) {
                // Update scroll bar thumb position in relation with current carousel scroll state
                const childWidth = carousel.scrollWidth;
                const thumbOffsetPercent = (carousel.scrollLeft * 100) / childWidth;

                scrollBarThumb.style.left = `${thumbOffsetPercent}%`;
            }
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

    // ============================== Scroll bar ============================ //

    function makeScrollBarInteractive() {
        if (!scrollBar || !scrollBarThumb) return;
        const scrollBarClient = scrollBar.getBoundingClientRect();
        const scrollBarStart = scrollBarClient.x;
        const scrollBarWidth = scrollBarClient.width;
        const scrollBarEnd = scrollBarStart + scrollBarWidth;
        const scrollBarThumbWidth = scrollBarThumb.getBoundingClientRect().width;

        let isScrollBarMoving = false;
        let scrollX = scrollBarClient.x;

        function getUpdatedScrollX() {
            return scrollX;
        }

        function startScrollBarThumbMove(ev) {
            isScrollBarMoving = true;
        }

        function moveScrollBarThumb(ev) {
            if (!isScrollBarMoving) return;

            if (ev.clientX > scrollBarStart && ev.clientX < scrollBarEnd) {
                scrollX = ev.clientX;

                // Update scroll bar thumb position in relation with mouse position
                const thumbOffsetPercent = ((ev.clientX - scrollBarStart) * 100) / scrollBarWidth;
                const thumbOffset = (thumbOffsetPercent * (scrollBarWidth - scrollBarThumbWidth)) / 100;

                scrollBarThumb.style.left = `${thumbOffset}px`;
                updatedScrollBarThumbPosition = true;
            }
        }

        function endScrollBarThumbMove(ev) {
            if (!isScrollBarMoving) return;

            // Calculate the percentage from the left of the click event
            const clickXPercent = ((getUpdatedScrollX() - scrollBarStart) * 100) / scrollBarWidth;

            // Define new item index depending on the click event.
            const newVisibleVideoIndex = Math.floor(clickXPercent / (100 / carouselItems.length));

            // Update index and scroll carousel
            currentVisibleVideoIndex = newVisibleVideoIndex;
            carousel.scrollLeft = carouselItems[newVisibleVideoIndex]?.offsetLeft;

            isScrollBarMoving = false;
            setTimeout(() => {
                updatedScrollBarThumbPosition = false;
            }, 1000);
        }

        scrollBar.addEventListener("mousedown", startScrollBarThumbMove);
        window.addEventListener("mousemove", moveScrollBarThumb);
        window.addEventListener("mouseup", endScrollBarThumbMove);
    }

    // ================================ Reset carousel ============================== //

    function resetCarousel() {
        scrollCarouselByIndex(0);
        resetScrollBar();
        updateControlsAndScrollbarOnScroll();
    }

    resetCarousel();

    if (previousButtons?.length && nextButtons?.length) {
        previousButtons.forEach((previousButton) => {
            previousButton.addEventListener("click", () => scrollCarouselByDirection("previous"));
        });
        nextButtons.forEach((nextButton) => {
            nextButton.addEventListener("click", () => scrollCarouselByDirection("next"));
        });
    }

    makeScrollBarInteractive();

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
