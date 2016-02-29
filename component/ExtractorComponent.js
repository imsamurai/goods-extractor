/**
 * Created by imsamurai on 19.01.2016.
 */

function ExtractorComponent() {
    var extRequire = require(__dirname+'/../utility/ext_require.js');
    extRequire(__dirname+"/../lib2/utility/lang/extensions.js");
    //var brain = require("brain");
    extRequire(__dirname+"/../lib2/neural/brain-0.6.3.js");
    extRequire(__dirname+"/../lib2/metric/TreeComparatorDeep.js");
    extRequire(__dirname+"/../lib2/tree/Tree.js");
    extRequire(__dirname+"/../lib2/tree/TreeNode.js");
    extRequire(__dirname+"/../lib2/tree/TreeNodeEmpty.js");
    extRequire(__dirname+"/../lib2/tree/TreeBuilder.js");
    extRequire(__dirname+"/../lib2/extractor/RecordsExtractor.js");
    extRequire(__dirname+"/../lib2/record/RecordCollection.js");
    extRequire(__dirname+"/../lib2/record/Record.js");
    extRequire(__dirname+"/../lib2/metric/TreeComparatorBi.js");
    extRequire(__dirname+"/../lib2/metric/TreeComparator.js");
    extRequire(__dirname+"/../lib2/metric/TreeComparatorFull.js");
    extRequire(__dirname+"/../lib2/metric/TreeComparatorFullBi.js");
    extRequire(__dirname+"/../lib2/metric/TreeComplexity.js");
    extRequire(__dirname+"/../lib2/metric/TreeComplexityBi.js");
    extRequire(__dirname+"/../lib2/metric/RecordsMetrics.js");
    extRequire(__dirname+"/../lib2/field/Field.js");
    extRequire(__dirname+"/../lib2/field/FieldVariant.js");
    extRequire(__dirname+"/../lib2/field/FieldCollection.js");
    extRequire(__dirname+"/../lib2/extractor/FieldsExtractor.js");
    extRequire(__dirname+"/../lib2/tagger/FieldsTagger.js");
    extRequire(__dirname+"/../lib2/field/FieldGroup.js");
    extRequire(__dirname+"/../lib2/extractor/Extractor.js");
    extRequire(__dirname+"/../lib2/extractor/FieldValueExtractor.js");
    extRequire(__dirname+"/../lib2/data/neural/dict.js");
    extRequire(__dirname+"/../lib2/data/neural/product.js");
    extRequire(__dirname+"/../lib2/neural/model/ProductModel.js");
    extRequire(__dirname+"/../lib2/metric/FieldsMetrics.js");
    extRequire(__dirname+"/../lib2/output/FieldOutputHTML.js");
    extRequire(__dirname+"/../lib2/output/FieldOutputTRTemplate.js");
    extRequire(__dirname+"/../lib2/extractor/XpathExtractor.js");

    extRequire(__dirname+"/../lib2/xpath/XPathAttr.js");
    extRequire(__dirname+"/../lib2/xpath/XPathEmptyNode.js");
    extRequire(__dirname+"/../lib2/xpath/XPathNode.js");
    extRequire(__dirname+"/../lib2/xpath/XPathParser.js");

    this.extractFields = function(window) {
        var fieldCollections = this.extract(window);
        var fieldOutputHTML = new FieldOutputHTML();

        return fieldCollections.slice(0,1).map(function(fieldCollection) {
                return fieldOutputHTML.run(fieldCollection);
            }).join('');
    };

    this.extractTemplate = function(window) {
        var fieldCollections = this.extract(window);
        var fieldOutputTRTemplate = new FieldOutputTRTemplate(new XpathExtractor(window.XPathRefine));

        return fieldCollections.slice(0,1).map(function(fieldCollection) {
            return fieldOutputTRTemplate.run(fieldCollection);
        })[0];
    };

    this.extract = function(window) {
        var compareRate = 0.38;
        var compareCutoff = 0.9;
        var findLikeCompareCutoff = 0.55;
        var alignIndexCompareCutoff = 0.9;
        var complexityRateNeighbour = 1;
        var complexityRateDeep = 2;
        var complexityCutoff = 0.51;
        var recordRateCutoff = 0.7;
        var recordSeedRateCutoff = 0.6;
        var fieldTaggerCutoff = 0.7;
        var fieldMetricsCutoff = 0.7;

        var treeBuilder = new TreeBuilder(window.document.body, new TreeComparatorFullBi(compareRate, alignIndexCompareCutoff), new TreeComparatorFullBi(compareRate, findLikeCompareCutoff));
        var tree = treeBuilder.build();

        var metricRate = new RecordsMetrics(new TreeComparatorFullBi(compareRate, compareCutoff), new TreeComplexityBi(complexityRateNeighbour, complexityRateDeep, complexityCutoff), recordRateCutoff);
        var metricSeedRate = new RecordsMetrics(new TreeComparatorFullBi(compareRate, compareCutoff), new TreeComplexityBi(complexityRateNeighbour, complexityRateDeep, complexityCutoff), recordSeedRateCutoff);
        var recordsExtractor = new RecordsExtractor(metricRate, metricSeedRate);


        var neuralNet = new brain.NeuralNetwork();
        neuralNet.fromJSON(getProductNeural());
        var productModel = new ProductModel(new Dict(), new TreeComplexity(complexityRateNeighbour, complexityRateDeep, complexityCutoff));

        var fieldsTagger = new FieldsTagger(neuralNet, productModel, fieldTaggerCutoff);

        var fieldValueExtractor = new FieldValueExtractor();
        var fieldMetrics = new FieldsMetrics(fieldMetricsCutoff);
        var fieldsExtractor = new FieldsExtractor(fieldValueExtractor, fieldsTagger, fieldMetrics);

        var extractor = new Extractor(recordsExtractor, fieldsExtractor);
        return extractor.run(tree);
    }
}

module.exports = new ExtractorComponent;