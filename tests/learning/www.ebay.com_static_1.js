module.exports = [
        ['.lvtitle > a.vip', 'innerText', {title: 1}],
        ['a.img > img.img', 'src', {image: 1}],
        ['.lvtitle > a.vip', 'href', {link: 1}],
        ['li.lvprice.prc span.bold', 'innerText', {price: 1}],
        ['.lvformat span, .lvdetails li:nth-of-type(1):not(.liBtn), .bfsp, .hotness-signal, .stk-thr', 'innerText', {}],
        ['.iconETRS1', 'src', {}]
    ];