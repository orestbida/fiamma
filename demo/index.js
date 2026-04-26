import { Router, EnableProgressBar, EnablePrefetchVisible } from "../dist/fiamma.esm.js";

EnablePrefetchVisible();
EnableProgressBar(0);
Router();

function updateNav() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const links = navbar.querySelectorAll('.nav-links a');
    const indicator = navbar.querySelector('.nav-indicator');
    const current = location.pathname.split('/').pop() || 'index.html';

    let activeLink = null;

    links.forEach(link => {
        const href = link.getAttribute('href').split('/').pop();
        const isActive = href === current || (current === '' && href === 'index.html');
        link.setAttribute('aria-current', isActive ? 'page' : '');
        if (isActive) activeLink = link;
    });

    if (indicator && activeLink) {
        const navRect = navbar.getBoundingClientRect();
        const lr = activeLink.getBoundingClientRect();
        indicator.style.left  = (lr.left - navRect.left) + 'px';
        indicator.style.width =  lr.width + 'px';
    }
}

// Disable transition on initial placement so indicator doesn't fly in from 0
function initNav() {
    const indicator = document.querySelector('#navbar .nav-indicator');
    if (indicator) {
        indicator.style.transition = 'none';
        updateNav();
        requestAnimationFrame(() => requestAnimationFrame(() => {
            indicator.style.transition = '';
        }));
    } else {
        updateNav();
    }
}

initNav();
window.addEventListener('fiamma:end', updateNav);

let resizeTimer;
window.addEventListener('resize', () => {
    const indicator = document.querySelector('#navbar .nav-indicator');
    if (indicator) indicator.style.transition = 'none';
    updateNav();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (indicator) indicator.style.transition = '';
    }, 150);
});