// ==UserScript==
// @name        Prices in USD for onliner.by
// @namespace   name.sinkevitch.andrew
// @version     1.2.6
// @include     http://baraholka.onliner.by/*
// @include     https://baraholka.onliner.by/*
// @include     http://catalog.onliner.by/*
// @include     https://catalog.onliner.by/*
// @author      Andrew Sinkevitch
// @description Add prices in USD
// @grant       none
// ==/UserScript==


(function (window, undefined) {
    var w;
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
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.innerHTML = css;
            head.appendChild(style);
        }

        var css = '\
            .hk-usd { color:#5a9300; font-weight:bold; margin:0.3rem 0; font-size: 1rem; line-height: 1rem; } \
            .offers-description-configurations__price-value .hk-usd { margin: 0; font-size: 0.75rem; } \
            .ba-tbl-list__table .cost .hk-usd { font-size:0.75rem; } \
            .b-ba-topicdet .hk-usd { margin:0.5rem 0 0 10px; font-size:1.2rem; } \
        ';
        addGlobalStyle(css);

        var hkUsd = 2.5676;
        var hkCentsLimit = 500;

        function hkGetNumber(str, separator)
        {
            separator = separator || ',';
            str = str.replace(/руб./g, '');

            if (separator == '.')
            {
                str = str.replace(/[^0-9.\-]/g, '');
            }
            else
            {
                str = str.replace(/[^0-9,\-]/g, '');
                str = str.replace(',', '.');
            }

            return parseFloat(str);
        }

        function hkRound(number, decimal_points)
        {
            if(!decimal_points) return Math.round(number);
            if(number == 0) {
                var decimals = "";
                for(var i=0;i<decimal_points;i++) decimals += "0";
                return "0."+decimals;
            }
            var exponent = Math.pow(10,decimal_points);
            var num = Math.round((number * exponent)).toString();

            var numSlice = num.slice(0,-1*decimal_points);
            if (numSlice == "") numSlice = 0;

            return numSlice + "." + num.slice(-1*decimal_points);
        }

        function hkFormat(number)
        {
            return String(number).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
        }

        function hkGetFormattedUsdPrice(rub)
        {
            var usd = rub / hkUsd;
            var round = (usd >= hkCentsLimit) ? 0 : 2;
            usd = hkRound(usd, round);
            return hkFormat(usd);
        }

        function hkDetectUsd()
        {
            var usd = $('.b-top-navigation-informers__link span').text();
            usd = hkGetNumber(usd);
            if (usd > 1) hkUsd = usd;
        }

        function hkUpdateTablePricesInBaraholka()
        {
            $('.ba-tbl-list__table .cost').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).find('.price-primary').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInBaraholka()
        {
            var rub = $('.b-ba-topicdet .price-primary').first().text();
            rub = hkGetNumber(rub);
            if (isNaN(rub)) return;

            var usd = hkGetFormattedUsdPrice(rub);
            $('.b-ba-topicdet').append('<div class="hk-usd">$ ' + usd + '</div>');
        }

        function hkAddRangePriceCatalog(selRub)
        {
            var line = selRub.text();
            var parts = line.split(/[–-]/);
            if (parts.length > 1)
            {
                var rub1 = hkGetNumber(parts[0]);
                var rub2 = hkGetNumber(parts[1]);
                if (isNaN(rub1) || isNaN(rub2)) return;

                var usd1 = hkGetFormattedUsdPrice(rub1);
                var usd2 = hkGetFormattedUsdPrice(rub2);
                selRub.after('<div class="hk-usd">$ ' + usd1 + ' - $ ' + usd2 + '</div>');
            }
            else
            {
                var rub = hkGetNumber(line);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                selRub.after('<div class="hk-usd">$ ' + usd + '</div>');
            }
        }

        function hkUpdateTablePricesInCatalog()
        {
            $('.schema-product__group .schema-product__price-value_primary, ' +
              '.schema-product__group .schema-product__price-value_additional, ' +
              '.schema-product__group .schema-product__price-value_secondary').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).find('span').text();
                rub = hkGetNumber(rub);
                //console.log('rub', rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInCatalog()
        {
            // main price
            var selRub = $('.offers-description__price-group .offers-description__price_primary');
            if (selRub.length > 0 && $('.offers-description__price-group .hk-usd').length <= 0)
            {
                hkAddRangePriceCatalog(selRub);
            }

            // optional prices
            $('.offers-description-configurations__price-value').each(function(idx, el) {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });


            // side panel
            $('.product-aside__link').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).find('span').text();
                rub = hkGetNumber(rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });

            // different sellers
            $('.offers-list__part_price .offers-list__description .offers-list__description').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).text();
                rub = hkGetNumber(rub);
                //console.log('rub', rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            })

        }

        setTimeout(function(){

            hkDetectUsd();
            //console.log('detected usd', hkUsd);

            hkUpdateAdvertPriceInBaraholka();
            hkUpdateTablePricesInBaraholka();

            setInterval(hkUpdateTablePricesInCatalog, 2000);
            setInterval(hkUpdateAdvertPriceInCatalog, 2000);

        }, 1500);


    }

    var execute = function (body) {
        if (typeof body === "function") { body = "(" + body + ")();"; }
        var el = document.createElement("script");
        el.textContent = body;
        document.body.appendChild(el);
        return el;
    };

    execute(pricesOnliner);

})(window);
