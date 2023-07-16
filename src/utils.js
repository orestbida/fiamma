import { prefetchHover, prefetchVisible, prefetchedLinks } from "@orestbida/link-prefetcher";

export const FIAMMA_LABEL = 'fiamma';
const FIAMMA_END_EVENT = `${FIAMMA_LABEL}:end`;

const locationHistory = history;
const WINDOW = window;

/**
 * @param {string} selector
 * @param {Element} root
 */
export const querySelectorAll = (selector, root=document) => root.querySelectorAll(selector);

/**
* @param {Document | Element} el
* @param {keyof WindowEventMap} event
* @param {(ev: Event) => {}} listener
*/
export const addEvent = (el, event, listener) => el.addEventListener(event, listener);

/**
 * @param {string} event
 * @param {any} [data]
 */
export const dispatchCustomEvent = (event, data) => dispatchEvent(new CustomEvent(FIAMMA_LABEL + ':' + event, data && {detail: data}));

/**
 * @param {NodeList | NamedNodeMap} iterable
 */
export const toArray = iterable => Array.from(iterable);

/**
 * @param  {string} [url]
 */
export const getURL = (url) => {
    const href = new URL(url || location.href).href;
    return href.slice(-1) === '/' || href.includes('.') ? href : href + '/';
}

/**
 * @param  {string} url
 * Writes URL to browser history
 */
export const addToPushState = (url) => {
    if (locationHistory.state?.url !== url)
        locationHistory.pushState({ url }, 'internalLink', url);
}

/**
 * @param {string} url
 */
export const replaceState = (url) => {
    if(locationHistory.state?.url !== url)
        locationHistory.replaceState({ url }, 'internalLink', url)
}

/**
 * Back/forward browser api
 * @param {PopStateEvent} event
 */
export const handlePopState = () => ({ _event: 'pop', _url: getURL() });

/**
 * @param {HTMLAnchorElement} anchor
 */
const invalidAnchor = anchor => anchor.nodeName !== 'A' ||
    anchor.host !== location.host   ||
    anchor.target === '_blank'      ||
    anchor.hasAttribute(FIAMMA_LABEL + '-off');

/**
 * @param {HTMLAnchorElement} [anchor]
 */
export const scrollTo = (anchor) => {
    const hash = (anchor || location).hash;
    hash
        ? document.getElementById(hash.slice(1))?.scrollIntoView(anchor && {behavior: 'smooth'})
        : window.scrollTo({ top: 0 })
}

/**
 * @param {MouseEvent} e
 */
const invalidClickEvent = (e) => e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    e.shiftKey;

/**
 * @param {Element} target
 */
const getAnchor = target => {
    let anchor = target;

    for (let n=target; n.parentNode; n=n.parentNode) {
        if (n.nodeName === 'A') {
            anchor = n;
            break;
        }
    }

    return anchor;
}

/**
 * @param  {MouseEvent} event
 * Organizes link clicks into types
 */
export const handleLinkClick = (event) => {

    /**
     * @type {HTMLAnchorElement}
     */
    const anchor = getAnchor(event.target)

    if(invalidClickEvent(event) || invalidAnchor(anchor))
        return;

    event.preventDefault();

    const { href, hash, pathname } = anchor;

    if(hash && location.pathname === pathname) {
        replaceState(href);
        scrollTo(anchor);
        return;
    }

    if(location.href === href)
        return;

    return { _event: 'link', _url: getURL(href) };
}

/**
 * @type {HTMLDivElement}
 */
export let progressBarElement;

/**
 * @param {number} [delay]
 */
export const EnableProgressBar = (delay=500) => {

    progressBarElement = document.createElement('div');
    progressBarElement.id = `${FIAMMA_LABEL}-progress`;
    document.body.appendChild(progressBarElement);

    const barStyle = progressBarElement.style;
    const initialPercentage = 10;

    let timeout;

    addEvent(WINDOW, `${FIAMMA_LABEL}:progress`, ({ detail }) => {
        const { loaded, total } = detail;
        const progressPercentage = ((loaded / total) * 100).toFixed(2);

        if(progressPercentage > initialPercentage)
            barStyle.transform = `scaleX(${progressPercentage}%)`;
    });

    addEvent(WINDOW, `${FIAMMA_LABEL}:fetch`, () => {

        /**
         * Reset progress bar
         */
        barStyle.transition = 'none';
        barStyle.transform = `scaleX(0)`;

        clearTimeout(timeout);

        timeout = setTimeout(()=> {
            barStyle.opacity = '1';

            setTimeout(() => {
                barStyle.transition = '';
                barStyle.transform = `scaleX(${initialPercentage}%)`;
            }, 1);

        }, delay > 0 ? delay : 1);
    });

    addEvent(WINDOW, `${FIAMMA_LABEL}:end`, () => {
        clearTimeout(timeout);
        barStyle.transform = `scaleX(100%)`;
        barStyle.opacity = '0';
    });
}

/**
 * @param {string} [selector]
 * @param {boolean} [alwaysPrefetch]
 */
export const EnablePrefetchHover = (selector, alwaysPrefetch=false) => {
    addEvent(WINDOW, FIAMMA_END_EVENT, () => {
        prefetchHover(selector && querySelectorAll(selector));

        /**
         * Delete all prefetched links so that they can re-fetched again
         */
        if(alwaysPrefetch) {
            for(const href in prefetchedLinks) {
                delete prefetchedLinks[href];
            }
        }
    });

    prefetchHover(selector && querySelectorAll(selector));
}

/**
 * @param {string} [selector]
 */
export const EnablePrefetchVisible = (selector) => {
    addEvent(WINDOW, FIAMMA_END_EVENT, () => {
        prefetchVisible(selector && querySelectorAll(selector));
    });

    prefetchVisible(selector && querySelectorAll(selector));
}