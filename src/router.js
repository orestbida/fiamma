import {
    handleLinkClick,
    handlePopState,
    addEvent,
    scrollTo,
    EnableProgressBar,
    EnablePrefetchHover,
    EnablePrefetchVisible
} from './utils';

import { reconstructDOM } from './dom';

/**
 * @param  {MouseEvent} event
 * Handle clicks on links
 */
const onClick = (event) => reconstructDOM(handleLinkClick(event));

/**
 * @param  {PopStateEvent} event
 * Handle popstate events like back/forward
 */
const onPopState = () => reconstructDOM(handlePopState());

const Router = () => {
    addEvent(document, 'click', onClick);
    addEvent(window, 'popstate', onPopState);
    scrollTo();
}

export {
    Router,
    EnablePrefetchHover,
    EnablePrefetchVisible,
    EnableProgressBar
}