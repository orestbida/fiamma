# fiamma
A tweaked fork of [flamethrower](https://github.com/fireship-io/flamethrower).

## Installation & Usage
Install via npm:
```
npm i fiamma
```

Add a `script` tag in the `head`section:
```html
<html>
    <head>
        <script type="module">
            import { Router } from "dist/fiamma.esm.js";

            Router();
        </script>
    </head>
    ...
</html>
```

## Events
Available events:

* `fiamma-fetch` page fetch started
* `fiamma-end` page fetch ended

Example:
```javascript
window.addEventListener('fiamma-fetch', ()=> {
    // page fetch started
});

window.addEventListener('fiamma-end', ()=> {
    // page fetch ended
});
```

## Prefetch links
You can prefetch links via `EnablePrefetchHover` or `EnablePrefetchVisible`.

```javascript
import { Router, EnablePrefetchVisible } from "dist/fiamma.esm.js";

EnablePrefetchVisible();
Router();
```

## `fiamma-` attributes

### `fiamma-reload`

By default `script` tags in the `head` section are executed once.
Specify this attribute to re-execute them after each page load event.

```html
<head>
    <!-- ... -->

    <script fiamma-reload>
        console.log("hello world")
    </script>
</head>
```

### `fiamma-persist`

Dynamically injected tags in the `head` section can persist across multiple page loads.

E.g. load the analytics script after consent:

```javascript
const script = document.createElement('script');
script.src="path-to-analytics.js";
script.setAttribute('fiamma-persist', '');
document.head.appendChild(script);
```

### `fiamma-preserve`
By default the `body` element is replaced with the new fetched body. You can however preserve any html element in the `body` section across multiple pages. The element(s) must:

* exist in the new page
* have a unique `id`

E.g.: given the following 2 pages, then everything inside the div with `id="shared-div"` will be carried over to the other page.

```html
<!--- index.html -->
<html>
    <head></head>
    <body>
        <div fiamma-preserve id="shared-div"></div>
    </body>
</html>
```

```html
<!--- about.html -->
<html>
    <head></head>
    <body>
        <div fiamma-preserve id="shared-div"></div>
    </body>
</html>
```

You can also dynamically inject markup inside `shared-div`.

### `fiamma-off`

Anchor tags (`a`) with this attribute are skipped by `fiamma` and will cause a full page reload when visited.

E.g.: disable fiamma when visiting a :subdomain
```html
<a href="https://subdomain.mydomain.com" fiamma-off>Subdomain</a>
```

## Progress bar

1. Add stylesheet

    ```css
    #fiamma-progress {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        transform: scaleX(0);
        background-color: #f3754a;
        transition: transform .3s ease, opacity .3s ease;
        transform-origin: left;
        z-index: 2147483647;
    }
    ```
2. Import `EnableProgressBar` function:

    ```javascript
    import { Router, EnableProgressBar } from 'fiamma.esm.js';

    EnableProgressBar();
    Router();
    ```

## License
Distributed under the MIT License. See [LICENSE](/LICENSE.md) for more information.
