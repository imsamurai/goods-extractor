/**
 * Created by imsamurai on 14.01.2016.
 */
function FieldsTaggerProduct(network, model) {
    this.run = function(field, seed, fieldNum, treeItems, tree) {
        var source = {seed: seed, fieldNum: fieldNum, treeItems: treeItems, tree: tree};
        if (!treeItems[0] || !field.value) {
            return field;
        }
        var m = new model(treeItems[0].DOMNode, field.value.toString(), network.dic);
        //console.info('tagger');
        //console.log(network.net.run(m.getSample()));
        var type = network.likely(m.getSample());
        if (type!==false) {
            //console.log(field.value);
            //console.log(treeItems[0].DOMNode);
            //console.log(type);
            field.type = type[0];
            field.typeRate = type[1];
        }
        //if (isPrice(field, source)) {
        //    field.type = 'price';
        //} else if (isImage(field, source)) {
        //    field.type = 'image';
        //} else if (isLink(field, source)) {
        //    field.type = 'link';
        //} else
        // if (isTitle(field, source)) {
        //    field.type = 'title';
        //}
        return field;
    }

    //function isTitle(field, source) {
    //    if (field.value.match && field.value.length >= 10
    //        && (source.tree.node.name.match(/^H\d+$/)
    //        || source.tree.node.class.match(/title/))) {
    //        return true;
    //    } else {
    //        return false;
    //    }
    //}
    //
    //function isLink(field, source) {
    //    if (source.seed.node.name == "A" && field.value.match && field.value.match(/^.{3,}:\/\/\S+$/)) {
    //        return true;
    //    } else {
    //        return false;
    //    }
    //}
    //
    //function isImage(field, source) {
    //    if (source.seed.node.name == "IMG" && source.tree.node.name === 'A') {
    //        return true;
    //    } else {
    //        return false;
    //    }
    //}
    //
    //function isPrice(field, source) {
    //    if (!field.value.match) {
    //        return false;
    //    }
    //    var price = field.value.match(/\d+[.,]\d+/);
    //    return price ? true : false;
    //}
}