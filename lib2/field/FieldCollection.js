/**
 * Created by imsamurai on 15.02.2016.
 */
function FieldCollection(fieldGroups, recordCollection, rate) {
    this.fieldGroups = fieldGroups;
    this.recordCollection = recordCollection;
    this.rate = rate;

    /**
     * Returns best groups by rate and type
     *
     * @returns FieldGroup[]
     */
    this.getBestGroups = function() {
        var filterType = {};
        return this.fieldGroups.filter(function(fieldGroup) {
            return fieldGroup.rate > 0;
        }).sort(function (fieldGroup1, fieldGroup2) {
            if (fieldGroup1.rate > fieldGroup2.rate) {
                return -1;
            } else if (fieldGroup1.rate < fieldGroup2.rate) {
                return 1;
            }
            return 0;
        }).filter(function (fieldGroup) {
            if (fieldGroup.rate === 0) {
                return false;
            }
            if (filterType[fieldGroup.type]) {
                return false;
            }
            filterType[fieldGroup.type] = 1;
            return true;
        })
    }
}

