// ==UserScript==
// @name        Prices in USD for onliner.by
// @namespace   name.sinkevitch.andrew
// @version     1.4.0
// @include     http://baraholka.onliner.by/*
// @include     https://baraholka.onliner.by/*
// @include     http://catalog.onliner.by/*
// @include     https://catalog.onliner.by/*
// @author      Andrew Sinkevitch
// @description Add prices in USD
// @grant       none
// @run-at      document-end
// ==/UserScript==


(function (window, undefined) {
    //console.log('point 1')
    // normalized window
    let localWindow;
    if (typeof unsafeWindow != undefined) {
        localWindow = unsafeWindow;
    } else {
        localWindow = window;
    }

    // do not run in frames
    if (localWindow.self != localWindow.top) {
        return;
    }

    function pricesOnliner()
    {
        function addGlobalStyle(css) {
            const head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            const style = document.createElement('style');
            style.innerHTML = css;
            head.appendChild(style);
        }

        const css = '\
            .hk-usd { color:#5a9300; font-weight:bold; margin:0.3rem 0; font-size: 1rem; line-height: 1rem; } \
            .offers-description-configurations__price-value .hk-usd { margin: 0; font-size: 0.75rem; } \
            .ba-tbl-list__table .cost .hk-usd { font-size:0.75rem; } \
            .b-ba-topicdet .hk-usd { margin:0.5rem 0 0 10px; font-size:1.2rem; } \
        ';
        addGlobalStyle(css);

        function qs(selector, root) {
            return (root || document).querySelector(selector);
        }

        function qsa(selector, root) {
            return Array.prototype.slice.call(
                (root || document).querySelectorAll(selector)
            );
        }

        let hkUsd = undefined;
        const hkCentsLimit = 500;

        function hkGetNumber(str, separator) {
            if (typeof str !== 'string') return NaN;
            separator = separator || ',';
            str = str.replace(/руб./g, '');

            if (separator == '.') {
                str = str.replace(/[^0-9.\-]/g, '');
            } else {
                str = str.replace(/[^0-9,\-]/g, '');
                str = str.replace(',', '.');
            }

            return parseFloat(str);
        }

        function hkRound(number, points) {
            if (!points) return Math.round(number);
            if (number == 0) {
                let decimals = "";
                for (let i=0; i < points; i++) decimals += "0";
                return "0." + decimals;
            }
            let exponent = Math.pow(10, points);
            let num = Math.round((number * exponent)).toString();

            let numSlice = num.slice(0, -1 * points);
            if (numSlice == "") numSlice = 0;

            return numSlice + "." + num.slice(-1 * points);
        }

        function hkFormat(number) {
            return String(number).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
        }

        function hkGetFormattedUsdPrice(rub) {
            let usd = rub / hkUsd;
            let round = (usd >= hkCentsLimit) ? 0 : 2;
            usd = hkRound(usd, round);
            return hkFormat(usd);
        }

        function hkAppendUsd(el, rub) {
            const usd = hkGetFormattedUsdPrice(rub);
            el.insertAdjacentHTML('beforeend', `<div class="hk-usd">$ ${usd}</div>`);
        }

        function hkDetectUsd() {
            const text = qs('.b-top-navigation-informers__link span')?.textContent;
            if (typeof text !== 'string' || !text.includes('$')) return; // not loaded yet
            const usd = hkGetNumber(text);
            if (usd > 1) hkUsd = usd;
        }

        function hkUpdateTablePricesInBaraholka() {
            qsa('.ba-tbl-list__table .cost').forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                let rub = qs('.price-primary', el)?.textContent
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });
        }

        function hkUpdateAdvertPriceInBaraholka() {
            const el = qs('.b-ba-topicdet');
            if (!el) return;

            let rub = qs('.price-primary', el)?.textContent;
            rub = hkGetNumber(rub);
            if (isNaN(rub)) return;

            hkAppendUsd(el, rub);
        }

        function hkUpdateTablePricesInCatalog() {
            qsa('.catalog-form__link span:not([class])'
                + ' '
                + ' '
            ).forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                const rub = hkGetNumber(el?.textContent);
                //console.log('rub', rub);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });
        }

        function hkUpdateAdvertPriceInCatalog() {
            let elMain = qs('.offers-description__price_primary');
            if (!elMain) elMain = qs('.offers-description__price_secondary');
            if (elMain) {
                const elMainUsd = qs('.hk-usd', elMain);
                if (!elMainUsd) {
                    let rubMain = qs('.js-description-price-link', elMain)?.textContent; // other pages
                    if (!rubMain) rubMain = elMain?.textContent; // all sellers page
                    rubMain = hkGetNumber(rubMain);
                    if (!isNaN(rubMain)) {
                        hkAppendUsd(elMain, rubMain);
                    }
                }
            }

            // side panel
            qsa('.product-aside__link.js-short-price-link').forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                let rub = qs('span', el)?.textContent;
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });

            // different sellers
            qsa('.offers-list__part_price .offers-list__description .offers-list__description').forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                const rub = hkGetNumber(el?.textContent);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });
        }

        function hkUpdateTablePricesInCatalogUsed() {
            qsa('.catalog-form__description .catalog-form__link_font-weight_bold').forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                const rub = hkGetNumber(el?.textContent);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });
        }

        function hkUpdateOneItemPricesInCatalogUsed() {
            // the same for table with multiple sellers and for one advert page
            qsa('.offers-list__price.offers-list__price_primary'
                + ', .offers-list__price_secondary'
            ).forEach(el => {
                const selUsd = qs('.hk-usd', el);
                if (selUsd) return;

                let rub = qs('span', el)?.textContent;
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                hkAppendUsd(el, rub);
            });
        }


        let waitTry = 0;
        const maxWaitTries = 100;
        let intervalWait = setInterval(() => {
            //console.log('waitTry', waitTry);
            waitTry++;
            if (waitTry === maxWaitTries) {
                clearInterval(intervalWait);
                intervalWait = null;
                console.log('hkDetectUsd failed');
                return;
            }

            hkDetectUsd();
            if (isNaN(hkUsd)) return; // one more try
            console.log('hkDetectUsd', hkUsd);
            clearInterval(intervalWait);
            intervalWait = null;

            // do the job

            // baraholka
            hkUpdateTablePricesInBaraholka();
            hkUpdateAdvertPriceInBaraholka();

            // catalogue new
            setInterval(hkUpdateTablePricesInCatalog, 1000);
            setInterval(hkUpdateAdvertPriceInCatalog, 1000);

            // catalogue used
            setInterval(hkUpdateTablePricesInCatalogUsed, 1000);
            setInterval(hkUpdateOneItemPricesInCatalogUsed, 1000);

        }, 500);

    }

    const execute = function(body) {
        if (typeof body === "function") { body = "(" + body + ")();"; }
        const el = document.createElement("script");
        el.textContent = body;
        document.body.appendChild(el);
        return el;
    };

    execute(pricesOnliner);

})(window);
