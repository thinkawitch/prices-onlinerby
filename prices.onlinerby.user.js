// ==UserScript==
// @name        Prices in USD for onliner.by
// @namespace   name.sinkevitch.andrew
// @version     1.3.0
// @include     http://baraholka.onliner.by/*
// @include     https://baraholka.onliner.by/*
// @include     http://catalog.onliner.by/*
// @include     https://catalog.onliner.by/*
// @author      Andrew Sinkevitch
// @description Add prices in USD
// @grant       none
// ==/UserScript==


(function (window, undefined) {
    let w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }

    if (w.self != w.top) {
        //return; //stop working on baraholka advert page
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

        let hkUsd = undefined;
        const hkCentsLimit = 500;

        function hkGetNumber(str, separator) {
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

        function hkRound(number, decimal_points) {
            if (!decimal_points) return Math.round(number);
            if (number == 0) {
                let decimals = "";
                for (let i=0; i < decimal_points; i++) decimals += "0";
                return "0." + decimals;
            }
            let exponent = Math.pow(10, decimal_points);
            let num = Math.round((number * exponent)).toString();

            let numSlice = num.slice(0, -1 * decimal_points);
            if (numSlice == "") numSlice = 0;

            return numSlice + "." + num.slice(-1 * decimal_points);
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

        function hkDetectUsd() {
            let usd = $('.b-top-navigation-informers__link span').text();
            usd = hkGetNumber(usd);
            if (usd > 1) hkUsd = usd;
            console.log('hkDetectUsd', hkUsd);
        }

        function hkUpdateTablePricesInBaraholka() {
            $('.ba-tbl-list__table .cost').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).find('.price-primary').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                let usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInBaraholka() {
            let rub = $('.b-ba-topicdet .price-primary').first().text();
            rub = hkGetNumber(rub);
            if (isNaN(rub)) return;

            let usd = hkGetFormattedUsdPrice(rub);
            $('.b-ba-topicdet').append('<div class="hk-usd">$ ' + usd + '</div>');
        }

        function hkAddRangePriceCatalog(selRub) {
            let line = selRub.text();
            let parts = line.split(/[–-]/);
            if (parts.length > 1) {
                const rub1 = hkGetNumber(parts[0]);
                const rub2 = hkGetNumber(parts[1]);
                if (isNaN(rub1) || isNaN(rub2)) return;

                const usd1 = hkGetFormattedUsdPrice(rub1);
                const usd2 = hkGetFormattedUsdPrice(rub2);
                selRub.after('<div class="hk-usd">$ ' + usd1 + ' - $ ' + usd2 + '</div>');
            } else {
                const rub = hkGetNumber(line);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                selRub.after('<div class="hk-usd">$ ' + usd + '</div>');
            }
        }

        function hkUpdateTablePricesInCatalog() {
            $('.schema-product__group .schema-product__price-value_primary, ' +
              '.schema-product__group .schema-product__price-value_additional, ' +
              '.schema-product__group .schema-product__price-value_secondary').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).find('span').text();
                rub = hkGetNumber(rub);
                //console.log('rub', rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInCatalog() {
            // main price
            const selRub = $('.offers-description__price-group .offers-description__price_primary');
            if (selRub.length > 0 && $('.offers-description__price-group .hk-usd').length <= 0) {
                hkAddRangePriceCatalog(selRub);
            }

            // optional prices
            $('.offers-description-configurations__price-value').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });


            // side panel
            $('.product-aside__link').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).find('span').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });

            // different sellers
            $('.offers-list__part_price .offers-list__description .offers-list__description').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).text();
                rub = hkGetNumber(rub);
                //console.log('rub', rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            })

        }

        function hkUpdateTablePricesInCatalogUsed() {
            $('#schema-second-offers .schema-product__price-group .schema-product__button').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).find('strong').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateOneItemPricesInCatalogUsed() {
            // the same for table with multiple sellers and for one advert page
            $('.b-offers-list-line-table__table .offers-list__price').each(function(idx, el) {
                const selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                let rub = $(el).find('span').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                const usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }


        let waitTry = 0;
        const maxWaitTries = 100;
        const waitUsd = setInterval(function() {
            waitTry++;
            if (waitTry === maxWaitTries) {
                clearInterval(waitUsd);
                return;
            }

            hkDetectUsd();
            if (isNaN(hkUsd)) return; // one more try
            clearInterval(waitUsd);

            // do the job

            // baraholka
            hkUpdateAdvertPriceInBaraholka();
            hkUpdateTablePricesInBaraholka();

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
