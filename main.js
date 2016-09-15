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
            const isArrayElementChange = R.any(R.is(Number), diff.path);
            if (!isNestedChange || !isArrayElementChange || diff.kind === KIND_ARRAY || diff.kind === KIND_EDITED || diff.kind === KIND_DELETED) {
                return diff;
            }

            return this._createDiffForChangedArrayElement(objLeft, objRight, diff.path, diff);
        }).reduce((diffs, diff) => {
            const isArrayElementChange = R.any(R.is(Number), diff.path);
            if ((diff.kind === KIND_DELETED || diff.kind === KIND_ARRAY || diff.kind === KIND_EDITED) && isArrayElementChange/*TODO && R.last(diffs) ===  diff*/) {
                const diffAdapted = this._createDiffForChangedArrayElement(objLeft, objRight, diff.path, diff);
                if (R.equals(
                        R.dissocPath(['item','path'], R.dissocPath(['item', 'lhs'], diffAdapted)),
                        R.dissocPath(['item','path'], R.dissocPath(['item', 'lhs'], R.last(diffs) || {}))
                    )
                ){
                    return diffs;
                }
                return R.append(diffAdapted, diffs);
            }

            return R.append(diff, diffs);
        }, []);
    }

    _createDiffForChangedArrayElement(objLeft, objRight, path, diff) {
        const elementPosition = R.findLastIndex(R.is(Number), path);
        const pathToElement = R.slice(0, elementPosition + 1, path);

        const elementModifiedLeft = R.path(pathToElement, objLeft);
        const elementModifiedRight = R.path(pathToElement, objRight);

        return {
            "kind": KIND_ARRAY,
            "path": pathToElement,
            "item": R.merge(diff, {
                lhs: elementModifiedLeft,
                rhs: elementModifiedRight,
                path: R.slice(elementPosition + 1, Infinity, path)
            })
        };
    }
}

module.exports = new ObjectDiffer();
