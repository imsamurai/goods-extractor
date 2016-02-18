/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldOutputTRTemplate(xPathExtractor) {
    this.run = function (fieldCollection) {
        return [
            {
                "priority": "0",
                "mandatory": 0,
                "state": 1,
                "is_filled": 0,
                "output_format": getOuputFormat(fieldCollection.fieldGroups),
                "tags": getTags(fieldCollection.fieldGroups)
            }];
    }

    function getOuputFormat(fieldGroups) {
        var format = fieldGroups.reduce(function(format, fieldGroup) {
            format[fieldGroup.type] = "%" + fieldGroup.type + "%";
            return format;
        }, {});
        return {
            "type": "template",
            "name": "json",
            "header": "[\n",
            "items_header": "",
            "item": JSON.stringify(format),
            "items_footer": "",
            "footer": "]\n"
        };
    }

    function getTags(fieldGroups) {
        return fieldGroups.reduce(function(tags, fieldGroup) {
            tags[fieldGroup.type] = [{
                "default": "",
                "begin": "",
                "end": "",
                "target": xPathExtractor.getXpath(fieldGroup.tree.node.DOMNode, fieldGroup.type),
                "postProcessing": "",
                "join": "concat",
                "delimiter": " ",
                "canonicalizeURLs": 0,
                "mandatory": 0,
                "type": fieldGroup.type,
                "format": ""
            }];
            return tags;
        }, {});
    }
}

exports = FieldOutputTRTemplate;