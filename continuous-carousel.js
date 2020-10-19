/*!
 * Continuous Carousel v0.2.0
 * Timed continuous carousel that uses vanilla JavaScript & CSS animations.
 *
 * @license Released under the MIT license.
 * @copyright 2020 Jon Chretien
 */

(() => {
  'use strict';

  const DIRECTION_HORIZONTAL = 'horizontal';
  const DIRECTION_VERTICAL = 'vertical';
  const CLASS_NAME_ITEM = '.c-carousel-item';
  const CLASS_NAME_GROUP = '.c-carousel-group';
  const SELECTOR_DIRECTION = 'data-direction';
  const SELECTOR_NUM_VISIBLE = 'data-num-visible';
  const TRANSITION_DURATION_INITIAL = '1s';
  const TRANSITION_DURATION_RESET = '0.001s';

  function ContinuousCarousel(element) {
    let position = 0;

    const container = document.getElementById(element);
    const direction = container
      .getAttribute(SELECTOR_DIRECTION)
      .toLowerCase()
      .trim();
    const numVisible = Number(
      container.getAttribute(SELECTOR_NUM_VISIBLE).trim()
    );
    const items = Array.from(container.querySelectorAll(CLASS_NAME_ITEM));
    const itemGroup = container.querySelector(CLASS_NAME_GROUP);
    const itemsLength = items.length;
    const itemGroupTransform = {
      [DIRECTION_HORIZONTAL]: function (position) {
        return `translate3d(${position}px, 0, 0)`;
      },
      [DIRECTION_VERTICAL]: function (position) {
        return `translate3d(0, ${position}px, 0)`;
      },
    };

    itemGroup.style.transitionDuration = TRANSITION_DURATION_INITIAL;

    function cloneNodes() {
      const fragment = document.createDocumentFragment();

      items.slice(0, numVisible).forEach((item) => {
        const node = item.cloneNode(true);
        fragment.appendChild(node);
      });

      itemGroup.appendChild(fragment);
    }

    function animateContainer(measurement, direction) {
      let endPosition = -(measurement * itemsLength);
      let isBypassingTimer = false;
      let isReadyToReset = false;

      function animate() {
        let timer = isBypassingTimer ? 100 : 2000;
        setTimeout(() => {
          if (position === endPosition) {
            isReadyToReset = true;
            isBypassingTimer = true;
          }

          if (position !== endPosition) {
            isBypassingTimer = false;
          }

          // normal animation
          if (!isReadyToReset) {
            position = position - measurement * numVisible;
            itemGroup.style.transitionDuration = TRANSITION_DURATION_INITIAL;
          }

          // reset container position & bypass timer
          if (isReadyToReset) {
            isReadyToReset = false;
            position = 0;
            itemGroup.style.transitionDuration = TRANSITION_DURATION_RESET;
          }
          itemGroup.style.transform = itemGroupTransform[direction](position);

          requestAnimationFrame(animate);
        }, timer);
      }

      requestAnimationFrame(animate);
    }

    function setHorizontalLayout() {
      // set item widths
      const containerWidth = container.offsetWidth;
      const itemWidth = containerWidth / numVisible;

      // set item group width
      itemGroup.setAttribute(
        'style',
        `width: ${itemWidth * (itemsLength + numVisible)}px`
      );
      items.forEach((item) => {
        item.setAttribute('style', `width: ${itemWidth}px`);
      });

      return { itemWidth };
    }

    function setVerticalLayout() {
      // set item height
      const containerHeight = container.offsetHeight;
      const itemHeight = containerHeight / numVisible;

      // set item group height
      itemGroup.setAttribute(
        'style',
        `height: ${itemHeight * (itemsLength + numVisible)}px`
      );
      items.forEach((item) => {
        item.setAttribute('style', `height: ${itemHeight}px`);
      });

      return { itemHeight };
    }

    switch (direction) {
      case DIRECTION_HORIZONTAL: {
        const { itemWidth } = setHorizontalLayout();
        cloneNodes();
        animateContainer(itemWidth, DIRECTION_HORIZONTAL);
        break;
      }
      case DIRECTION_VERTICAL: {
        const { itemHeight } = setVerticalLayout();
        cloneNodes();
        animateContainer(itemHeight, DIRECTION_VERTICAL);
        break;
      }
      default: {
        throw new Error(
          `Direction must be either ${DIRECTION_VERTICAL} or ${DIRECTION_HORIZONTAL}`
        );
      }
    }
  }

  /**
   * Expose `ContinuousCarousel`.
   */
  if (typeof define === 'function' && define.amd) {
    define(ContinuousCarousel);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = ContinuousCarousel;
  } else {
    window.ContinuousCarousel = ContinuousCarousel;
  }
})();
