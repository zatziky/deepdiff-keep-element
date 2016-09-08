const deepDiff = require('deep-diff');
const R = require('ramda');

const KIND_ADDED = 'N';
const KIND_ARRAY = 'A';
const KIND_DELETED = 'D';
const KIND_EDITED = 'E';

class ObjectDiffer {

    diff(objLeft, objRight) {
        const diffs = deepDiff(objLeft, objRight);

        // verify change happened in an array

        return diffs.map(diff => {
            const isNestedChange = diff.path.length > 2;
            const isArrayElementEdited = R.any(R.is(Number), diff.path);
            if (!isNestedChange || !isArrayElementEdited || diff.kind !== KIND_EDITED) {
                return diff;
            }

            return this._createDiffForEditedArrayElement(objLeft, objRight, diff.path, diff);
        });
    }

    _createDiffForEditedArrayElement(objLeft, objRight, path, diff) {
        const elementPosition = R.findLastIndex(R.is(Number), path);
        const pathToElement = R.slice(0, elementPosition + 1, path);

        const elementModifiedLeft = R.path(pathToElement, objLeft);
        const elementModifiedRight = R.path(pathToElement, objRight);

        return {
            "kind": KIND_ARRAY,
            "path": pathToElement,
            "item": R.merge(diff, {
                elementLeft: elementModifiedLeft,
                elementRight: elementModifiedRight,
                path: R.slice(elementPosition + 1, Infinity, path)
            })
        };
    }
}

module.exports = new ObjectDiffer();
