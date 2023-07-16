import {
    querySelectorAll,
    toArray,
    dispatchCustomEvent,
    addToPushState,
    scrollTo,
    FIAMMA_LABEL,
    progressBarElement
} from './utils'

/**
 * Convert an HTML string to new Document
 * @param {string} html
 */
export const formatNextDocument = html => new DOMParser().parseFromString(html, 'text/html');

/**
 * @param {Element} currNode
 * @param {Element} newNode
 */
export const replaceNode = (currNode, newNode) => currNode?.replaceWith(newNode);

/**
 * @param  {Document} nextDoc
 * Replace Body
 */
export const replaceBody = (nextDoc) => {

    const body = document.body;

    /**
     * All nodes with 'fiamma-preserve'
     */
    const nodesToPreserve = querySelectorAll(`[${FIAMMA_LABEL}-preserve][id]`, body);

    /**
     * Replace all nodes in the new body with the current (older) node
     * to preserve the same object instance and any attached listeners
     * @param {Element} oldNode
     */
    const replace = (oldNode) => replaceNode(nextDoc.getElementById(oldNode.id), oldNode);

    nodesToPreserve.forEach(replace);

    progressBarElement && nextDoc.body.append(progressBarElement);

    /**
     * Replace current body with the new updated
     * body (where we moved the older nodes)
     */
    replaceNode(body, nextDoc.body);
}

/**
 * @param {Element[]} oldNodes
 * @param {Element[]} nextNodes
 */
const partitionNodes = (oldNodes, nextNodes) => {
    /**
     * @type {Element[]}
     */
    const _staleNodes = [];

    /**
     * @type {Element[]}
     */
    const _freshNodes = [];

    let oldMark = 0;
    let nextMark = 0;

    while (oldMark < oldNodes.length || nextMark < nextNodes.length) {
        const old = oldNodes[oldMark];
        const next = nextNodes[nextMark];

        if (old?.isEqualNode(next)) {
            oldMark++;
            nextMark++;
            continue;
        }

        const oldInFresh = old
            ? _freshNodes.findIndex((node) => node.isEqualNode(old))
            : -1;

        if (oldInFresh !== -1) {
            _freshNodes.splice(oldInFresh, 1);
            oldMark++;
            continue;
        }

        const nextInStale = next
            ? _staleNodes.findIndex((node) => node.isEqualNode(next))
            : -1;

        if (nextInStale !== -1) {
            _staleNodes.splice(nextInStale, 1);
            nextMark++;
            continue;
        }

        old && _staleNodes.push(old);
        next && _freshNodes.push(next);
        oldMark++;
        nextMark++;
    }

    return { _staleNodes, _freshNodes };
}

/**
 * @param  {Document} nextDoc
 * Merge new head data
 */
export const mergeHead = (nextDoc) => {
    /**
     * @param {Document} doc
     */
    const getValidNodes = doc => toArray(querySelectorAll(`:not([${FIAMMA_LABEL}-persist]`, doc.head));

    const oldNodes = getValidNodes(document);
    const nextNodes = getValidNodes(nextDoc);
    const nodes = partitionNodes(oldNodes, nextNodes);

    nodes._staleNodes.forEach((node) => node.remove());
    document.head.append(...nodes._freshNodes);
}

/**
 * @param {NodeListOf<HTMLScriptElement>} scripts
 * @param {number} index
 */
const loadScriptSync = (scripts, index=0) => {

    if(scripts.length === index)
        return;

    const oldScript = scripts[index];
    const ignoreScript = oldScript.hasAttribute(FIAMMA_LABEL + '-ignore');

    if(ignoreScript)
        return loadScriptSync(scripts, ++index)

    const script = document.createElement('script');

    /**
     * @type {Attr[]}
     */
    const attrs = toArray(oldScript.attributes);

    /**
     * Copy over all attributes
     */
    for (const { name, value } of attrs)
        script.setAttribute(name, value);

    script.textContent = oldScript.textContent;

    if(script.src){
        script.onload = script.onerror = () => loadScriptSync(scripts, ++index);
        replaceNode(oldScript, script);
    } else {
        replaceNode(oldScript, script);
        loadScriptSync(scripts, ++index)
    }
}

export const runScripts = () => {
    loadScriptSync(querySelectorAll(`script[${FIAMMA_LABEL}-reload]`, document.head));
    loadScriptSync(querySelectorAll(`script:not([${FIAMMA_LABEL}-ignore])`, document.body));
}

let fetchStarted = false;

const xhr = new XMLHttpRequest();

/**
 * @param {Object} params
 * @param {'pop' | 'link' } [params._event]
 * @param {string} [params._url]
 */
export const reconstructDOM = async (params) => {

    let event = params?._event;
    let url = params?._url;

    if (event && url) {

        dispatchCustomEvent('fetch');

        if(fetchStarted)
            xhr.abort();

        xhr.onload = () => {
            fetchStarted = false;

            const statusCode = xhr.status;

            /**
             * Hard reload if status code not ok
             */
            if(statusCode > 200 || statusCode < 200) {
                location.href = url;
                return;
            }

            if (event !== 'pop')
                addToPushState(url);

            const html = xhr.responseText;
            const nextDoc = formatNextDocument(html);

            mergeHead(nextDoc);
            replaceBody(nextDoc);
            runScripts();
            scrollTo();

            dispatchCustomEvent('end');
        }

        xhr.onprogress = event => dispatchCustomEvent('progress', event);

        xhr.open('GET', url);
        xhr.send();

        fetchStarted = true;
    }
}