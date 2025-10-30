const initNavClusters = () => {
  const clusters = document.querySelectorAll('[data-nav-cluster]');
  if (!clusters.length) {
    return;
  }

  clusters.forEach((cluster) => {
    const trigger = cluster.querySelector('[data-menu-trigger]');
    const panel = cluster.querySelector('[data-menu-panel]');
    const subTriggers = cluster.querySelectorAll('[data-submenu-trigger]');

    if (!trigger || !panel) {
      return;
    }

    const getSubmenu = (subTrigger) => {
      const targetId = subTrigger.getAttribute('aria-controls');
      return targetId ? document.getElementById(targetId) : null;
    };

    const closeSubmenus = (exception) => {
      subTriggers.forEach((subTrigger) => {
        if (exception && subTrigger === exception) {
          return;
        }
        subTrigger.setAttribute('aria-expanded', 'false');
        const submenu = getSubmenu(subTrigger);
        if (submenu) {
          submenu.hidden = true;
        }
      });
    };

    const openSubmenu = (subTrigger) => {
      const submenu = getSubmenu(subTrigger);
      if (!submenu) {
        return;
      }
      closeSubmenus(subTrigger);
      subTrigger.setAttribute('aria-expanded', 'true');
      submenu.hidden = false;
    };

    const openMenu = () => {
      trigger.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      cluster.setAttribute('data-menu-open', 'true');
      if (subTriggers.length) {
        const currentlyOpen = Array.from(subTriggers).find(
          (button) => button.getAttribute('aria-expanded') === 'true'
        );
        if (!currentlyOpen) {
          openSubmenu(subTriggers[0]);
        }
      }
    };

    const closeMenu = () => {
      trigger.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      cluster.removeAttribute('data-menu-open');
      closeSubmenus();
    };

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
        trigger.focus();
      }
    });

    subTriggers.forEach((subTrigger) => {
      subTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        const isExpanded = subTrigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          subTrigger.setAttribute('aria-expanded', 'false');
          const submenu = getSubmenu(subTrigger);
          if (submenu) {
            submenu.hidden = true;
          }
        } else {
          if (panel.hidden) {
            openMenu();
          }
          openSubmenu(subTrigger);
        }
      });
    });

    const handleDocumentClick = (event) => {
      if (!cluster.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('click', handleDocumentClick);

    cluster.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && trigger.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        closeMenu();
        trigger.focus();
      }
    });

    cluster.addEventListener('focusout', (event) => {
      const next = event.relatedTarget;
      window.requestAnimationFrame(() => {
        if (!cluster.contains(document.activeElement) && (!next || !cluster.contains(next))) {
          closeMenu();
        }
      });
    });
  });
};

const initProductCarousel = () => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  const track = carousel.querySelector('[data-carousel-track]');
  const prev = carousel.querySelector('[data-carousel-prev]');
  const next = carousel.querySelector('[data-carousel-next]');

  if (track && prev && next) {
    const getGap = () => {
      const style = window.getComputedStyle(track);
      const gapValue = style.columnGap || style.gap || '0';
      const parsed = parseFloat(gapValue);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const getScrollAmount = () => {
      const firstItem = track.querySelector('[data-product]');
      if (!firstItem) {
        return track.clientWidth;
      }
      const itemWidth = firstItem.getBoundingClientRect().width;
      return itemWidth + getGap();
    };

    const updateButtons = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= maxScrollLeft;
    };

    const scrollByAmount = (direction) => {
      const amount = getScrollAmount() * direction;
      track.scrollBy({ left: amount, behavior: 'smooth' });
    };

    prev.addEventListener('click', () => {
      scrollByAmount(-1);
    });

    next.addEventListener('click', () => {
      scrollByAmount(1);
    });

    track.addEventListener('scroll', () => {
      window.requestAnimationFrame(updateButtons);
    });

    window.addEventListener('resize', updateButtons);

    updateButtons();
  }

  const productCards = carousel.querySelectorAll('[data-product]');
  productCards.forEach((product) => {
    const addButton = product.querySelector('[data-add]');
    const removeButton = product.querySelector('[data-remove]');
    const display = product.querySelector('[data-quantity-display]');

    if (!addButton || !removeButton || !display) {
      return;
    }

    let quantity = 0;

    const updateDisplay = () => {
      display.textContent = String(quantity);
      removeButton.disabled = quantity === 0;
    };

    addButton.addEventListener('click', () => {
      quantity += 1;
      updateDisplay();
    });

    removeButton.addEventListener('click', () => {
      if (quantity > 0) {
        quantity -= 1;
        updateDisplay();
      }
    });

    updateDisplay();
  });
};

const ready = () => {
  initNavClusters();
  initProductCarousel();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ready);
} else {
  ready();
}
