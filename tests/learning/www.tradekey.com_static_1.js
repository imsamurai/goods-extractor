module.exports = [
        ['a.product_title > h2', 'innerText', {title: 1}],
        ['a.bigimg > img.image', 'data-src', {image: 1}],
        ['a.product_title', 'href', {link: 1}],
        ['li:nth-of-type(1) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(2) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(3) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(1) .attribute_table tr:nth-of-type(4) .attribute_value, li:nth-of-type(15) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(16) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(17) .attribute_table tr:nth-of-type(2) .attribute_value, li:nth-of-type(18) .attribute_table tr:nth-of-type(2) .attribute_value', 'innerText', {price: 1}],
        //['.noUnderLine', 'innerText', {}],
        //['.contact_now_link', 'href', {}]
    ];