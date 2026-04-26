import {
    querySelectorAll,
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
    // Fast path: skip matching prefix (free when pages share ordered head nodes)
    let i = 0;
    const oLen = oldNodes.length, nLen = nextNodes.length;
    while (i < Math.min(oLen, nLen) && oldNodes[i].isEqualNode(nextNodes[i])) i++;

    if (i === oLen && i === nLen)
        return { _staleNodes: [], _freshNodes: [] };

    // Map pass over remaining unmatched nodes only
    const oldCounts = new Map();
    for (let j = i; j < oLen; j++) {
        const k = oldNodes[j].outerHTML;
        oldCounts.set(k, (oldCounts.get(k) || 0) + 1);
    }
    const newCounts = new Map();
    for (let j = i; j < nLen; j++) {
        const k = nextNodes[j].outerHTML;
        newCounts.set(k, (newCounts.get(k) || 0) + 1);
    }

    const _staleNodes = [];
    for (let j = i; j < oLen; j++) {
        const k = oldNodes[j].outerHTML;
        const c = newCounts.get(k);
        c > 0 ? newCounts.set(k, c - 1) : _staleNodes.push(oldNodes[j]);
    }
    const _freshNodes = [];
    for (let j = i; j < nLen; j++) {
        const k = nextNodes[j].outerHTML;
        const c = oldCounts.get(k);
        c > 0 ? oldCounts.set(k, c - 1) : _freshNodes.push(nextNodes[j]);
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
    const getValidNodes = doc => querySelectorAll(`:not([${FIAMMA_LABEL}-persist])`, doc.head);

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

    for (const { name, value } of oldScript.attributes)
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
            if(statusCode < 200 || statusCode >= 300) {
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

        xhr.onerror = () => { location.href = url; };
        xhr.onprogress = event => dispatchCustomEvent('progress', event);

        xhr.open('GET', url);
        xhr.send();

        fetchStarted = true;
    }
}