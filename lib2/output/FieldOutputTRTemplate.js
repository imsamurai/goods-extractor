/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldOutputTRTemplate(xPathExtractor) {
    this.run = function (fieldCollection) {
        var nameCounter = {};
        var fieldGroups = fieldCollection.fieldGroups.map(function(fieldGroup) {
            if (fieldGroup.type == null) {
                return {item: fieldGroup, name: fieldGroup.name};
            }
            var name;
            if (nameCounter[fieldGroup.type]) {
                name = fieldGroup.type + '_' + nameCounter[fieldGroup.type];
                nameCounter[fieldGroup.type]++;
            } else {
                name = fieldGroup.type;
                nameCounter[fieldGroup.type] = 1;
            }
            return {item: fieldGroup, name: name};
        });
        return [
            {
                "priority": "0",
                "mandatory": 0,
                "state": 1,
                "is_filled": 0,
                "output_format": getOuputFormat(fieldGroups),
                "tags": getTags(fieldGroups)
            }];
    }

    function getOuputFormat(fieldGroups) {
        var format = fieldGroups.reduce(function (format, fieldGroup) {
            format[fieldGroup.name] = "%" + fieldGroup.name + "%";
            format[fieldGroup.name+'_xpath'] = "%" + fieldGroup.name + '_xpath' + "%";
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
        return fieldGroups.reduce(function (tags, fieldGroup) {
            tags[fieldGroup.name] = xPathExtractor.getMultiItemXpath(fieldGroup.item.fields.map(function(field) {
                return field.tree.node.DOMNode;
            }), mapType(fieldGroup.name)).map(function(path) {
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
                   "type": mapType(fieldGroup.name),
                   "format": mapFormat(fieldGroup.name)
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

