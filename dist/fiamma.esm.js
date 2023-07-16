const t=t=>t.host===location.host&&t.pathname!==location.pathname,e=e=>Array.from(e||document.querySelectorAll('a')).filter(t),o=(t,e,o)=>e.forEach((e=>t.addEventListener(e,o,{passive:!0}))),n={},c=t=>{const o=new IntersectionObserver((t=>{for(const e of t)if(e.isIntersecting){const{href:t,pathname:c}=e.target;n[c]||(n[c]=!0,fetch(t)),o.unobserve(e.target)}}));e(t).forEach((t=>o.observe(t)))},r=t=>{let c=!1;const r=new XMLHttpRequest;for(const s of e(t))o(s,['mouseenter','touchstart'],(()=>{const{href:t,pathname:e}=s;n[e]||(r.onload=r.onerror=()=>n[e]=!0,r.open('get',t),r.send(),c=!0)})),o(s,['mouseleave'],(()=>{c&&(c=!1,r.abort())}))},s='fiamma',i=`${s}:end`,a=history,l=window,u=(t,e=document)=>e.querySelectorAll(t),d=(t,e,o)=>t.addEventListener(e,o),f=(t,e)=>dispatchEvent(new CustomEvent(s+':'+t,e&&{detail:e})),m=t=>Array.from(t),p=t=>{const e=new URL(t||location.href).href;return'/'===e.slice(-1)||e.includes('.')?e:e+'/'},h=t=>{const e=(t||location).hash;e?document.getElementById(e.slice(1))?.scrollIntoView(t&&{behavior:'smooth'}):window.scrollTo({top:0})};let v;const w=(t=500)=>{v=document.createElement('div'),v.id=`${s}-progress`,document.body.appendChild(v);const e=v.style;let o;d(l,`${s}:progress`,(({detail:t})=>{const{loaded:o,total:n}=t,c=(o/n*100).toFixed(2);c>10&&(e.transform=`scaleX(${c}%)`)})),d(l,`${s}:fetch`,(()=>{e.transition='none',e.transform='scaleX(0)',clearTimeout(o),o=setTimeout((()=>{e.opacity='1',setTimeout((()=>{e.transition='',e.transform='scaleX(10%)'}),1)}),t>0?t:1)})),d(l,`${s}:end`,(()=>{clearTimeout(o),e.transform='scaleX(100%)',e.opacity='0'}))},$=(t,e=!1)=>{d(l,i,(()=>{if(r(t&&u(t)),e)for(const t in n)delete n[t]})),r(t&&u(t))},_=t=>{d(l,i,(()=>{c(t&&u(t))})),c(t&&u(t))},g=(t,e)=>t?.replaceWith(e),k=(t,e=0)=>{if(t.length===e)return;const o=t[e];if(o.hasAttribute(s+'-ignore'))return k(t,++e);const n=document.createElement('script'),c=m(o.attributes);for(const{name:t,value:e}of c)n.setAttribute(t,e);n.textContent=o.textContent,n.src?(n.onload=n.onerror=()=>k(t,++e),g(o,n)):(g(o,n),k(t,++e))};let X=!1;const L=new XMLHttpRequest,T=async t=>{let e=t?.t,o=t?.o;e&&o&&(f('fetch'),X&&L.abort(),L.onload=()=>{X=!1;const t=L.status;if(t>200||t<200)return void(location.href=o);'pop'!==e&&(t=>{a.state?.url!==t&&a.pushState({url:t},'internalLink',t)})(o);const n=(c=L.responseText,(new DOMParser).parseFromString(c,'text/html'));var c;(t=>{const e=t=>m(u(`:not([${s}-persist]`,t.head)),o=((t,e)=>{const o=[],n=[];let c=0,r=0;for(;c<t.length||r<e.length;){const s=t[c],i=e[r];if(s?.isEqualNode(i)){c++,r++;continue}const a=s?n.findIndex((t=>t.isEqualNode(s))):-1;if(-1!==a){n.splice(a,1),c++;continue}const l=i?o.findIndex((t=>t.isEqualNode(i))):-1;-1===l?(s&&o.push(s),i&&n.push(i),c++,r++):(o.splice(l,1),r++)}return{i:o,l:n}})(e(document),e(t));o.i.forEach((t=>t.remove())),document.head.append(...o.l)})(n),(t=>{const e=document.body;u(`[${s}-preserve][id]`,e).forEach((e=>g(t.getElementById(e.id),e))),v&&t.body.append(v),g(e,t.body)})(n),k(u(`script[${s}-reload]`,document.head)),k(u(`script:not([${s}-ignore])`,document.body)),h(),f('end')},L.onprogress=t=>f('progress',t),L.open('GET',o),L.send(),X=!0)},b=t=>T((t=>{const e=(t=>{let e=t;for(let o=t;o.parentNode;o=o.parentNode)if('A'===o.nodeName){e=o;break}return e})(t.target);if((t=>t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)(t)||(t=>'A'!==t.nodeName||t.host!==location.host||'_blank'===t.target||t.hasAttribute(s+'-off'))(e))return;t.preventDefault();const{href:o,hash:n,pathname:c}=e;return n&&location.pathname===c?(r=o,a.state?.url!==r&&a.replaceState({url:r},'internalLink',r),void h(e)):location.href!==o?{t:'link',o:p(o)}:void 0;var r})(t)),y=()=>T({t:'pop',o:p()}),A=()=>{d(document,'click',b),d(window,'popstate',y),h()};export{$ as EnablePrefetchHover,_ as EnablePrefetchVisible,w as EnableProgressBar,A as Router};