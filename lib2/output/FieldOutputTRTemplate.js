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
                "tags": getTags(fieldCollection)
            }];
    }

    function getOuputFormat(fieldGroups) {
        var format = fieldGroups.reduce(function (format, fieldGroup) {
            format[fieldGroup.type] = "%" + fieldGroup.type + "%";
            format[fieldGroup.type+'_xpath'] = "%" + fieldGroup.type + '_xpath' + "%";
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

    function getTags(fieldCollection) {
        return fieldCollection.fieldGroups.reduce(function (tags, fieldGroup) {
            tags[fieldGroup.type] = xPathExtractor.getMultiItemXpath(fieldGroup.fields.map(function(field) {
                return field.tree.node.DOMNode;
            }), mapType(fieldGroup.type)).map(function(path) {
               return {
                   "default": "",
                   "begin": "",
                   "end": "",
                   "target": path,
                   "postProcessing": "",
                   "join": "concat",
                   "delimiter": " ",
                   "canonicalizeURLs": 0,
                   "mandatory": 0,
                   "type": mapType(fieldGroup.type),
                   "format": mapFormat(fieldGroup.type)
               }
            });
            return tags;
        }, {});
    }

    function mapType(type) {
        var knownTypes = ['link', 'image'];
        if (knownTypes.indexOf(type) === -1) {
            return 'text';
        }
        return type;
    }

    function mapFormat(type) {
        switch(mapType(type)) {
            case 'image': return 'URL';
            default: return "";
        };
    }
}

