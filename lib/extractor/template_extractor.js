/**
 * Created by imsamurai on 25.01.2016.
 */
function TemplateExtractor(fieldSet, xpathExtractor) {
    this.run = function() {
        var fields = getFields();
        return [
            {
                "priority": "0",
                "mandatory": 0,
                "state": 1,
                "is_filled": 0,
                "output_format": ouputFormat(fields),
                "tags": tagsFromFields(fields),
                //"fields": fields
            }];
    };

    function getFields() {
        var fields = {};
        var fs = fieldSet.transpose();
        for (var n in fs.data) {
            var field = fs.data[n].filter(function(field) {
                return field !== null;
            })[0];
            if (field) {
                var name = field.type == 'text' ? field.name : field.type;
                fields[name] = field;
            }
        }
        return fields;
    }

    function ouputFormat(fields) {
       var format = {};
        var names = Object.keys(fields);
        for (var n=0;n<names.length;n++) {
            format[names[n]] = "%" + names[n] + "%";
        }
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

    function tagsFromFields(fields) {
        var tags = {};
        var names = Object.keys(fields);
        for (var n=0;n<names.length;n++) {
            var field = fields[names[n]];
            tags[names[n]] =  {
                "default": "",
                "begin": "",
                "end": "",
                "target": xpathExtractor.getXpath(field),
                "postProcessing": "",
                "join": "concat",
                "delimiter": " ",
                "canonicalizeURLs": 0,
                "mandatory": 0,
                "type": field.type,
                "format": ""
            }
        }
        return tags;
    }
}