const deepDiff = require('deep-diff');
const objectDiffer = require('../main');
const expect = require('chai').expect;

const KIND_ADDED = 'N';
const KIND_ARRAY = 'A';
const KIND_DELETED = 'D';
const KIND_EDITED = 'E';

describe('ObjectDiffer', () => {
    describe('._createDiffForEditedArrayElement()', () => {
        it('maps deep-diff.diff to our version of diff', () => {
            const objA = {array: [{a: 1}]};
            const objB = {array: [{a: 2}]};

            const diffFromDeepDiff = deepDiff(objA, objB)[0];

            expect(objectDiffer._createDiffForEditedArrayElement(objA, objB, diffFromDeepDiff.path, diffFromDeepDiff))
                .to.deep.equal({
                "kind": KIND_ARRAY,
                "path": ["array", 0],
                "item": {
                    "kind": KIND_EDITED,
                    "path": ["a"],
                    "elementLeft": {a: 1},
                    "elementRight": {a: 2},
                    "lhs": 1,
                    "rhs": 2
                }
            });
        });
    });

    describe('.diff()', () => {
        it('maps deep-diff.diff to our version of diff', () => {
            const objA = {array: [{a: 1}]};
            const objB = {array: [{a: 2}]};
            const diff = objectDiffer.diff(objA, objB);

            expect(diff.length).to.equal(1);
            expect(diff[0]).to.deep.equal({
                "kind": KIND_ARRAY,
                "path": ["array", 0],
                "item": {
                    "kind": KIND_EDITED,
                    "path": ["a"],
                    "elementLeft": {a: 1},
                    "elementRight": {a: 2},
                    "lhs": 1,
                    "rhs": 2
                }
            });
        });

        describe('deep-diff.diff() <=> objectDiffer.diff()', () => {
            it('should has the diffs an edit of a scalar in an object', () => {
                const objA = {field: 3};
                const objB = {field: 0};


                const resultDeepDiff = deepDiff(objA, objB);
                const resultObjectDiffer = objectDiffer.diff(objA, objB);

                expect(resultObjectDiffer).to.deep.equal(resultDeepDiff);
                expect(resultObjectDiffer).to.deep.equal([{
                    "kind": "E",
                    "lhs": 3,
                    "path": ["field"],
                    "rhs": 0
                }]);
            });

            it('diffs an element added to an array', () => {
                const objA = {array: []};
                const objB = {array: [{a: 1}]};

                const resultDeepDiff = deepDiff(objA, objB);
                const resultObjectDiffer = objectDiffer.diff(objA, objB);

                expect(resultObjectDiffer).to.deep.equal(resultDeepDiff);
                expect(resultObjectDiffer).to.deep.equal([{
                    "index": 0,
                    "item": {
                        "kind": KIND_ADDED,
                        "rhs": {"a": 1}
                    },
                    "kind": KIND_ARRAY,
                    "path": ["array"]
                }]);
            });

            it('diff element removed from an array', () => {
                const objA = {array: [{a: 1}]};
                const objB = {array: []};

                const resultDeepDiff = deepDiff(objA, objB);
                const resultObjectDiffer = objectDiffer.diff(objA, objB);

                expect(resultObjectDiffer).to.deep.equal(resultDeepDiff);
                expect(resultObjectDiffer).to.deep.equal([{
                    "index": 0,
                    "item": {
                        "kind": KIND_DELETED,
                        "lhs": {"a": 1}
                    },
                    "kind": KIND_ARRAY,
                    "path": ["array"]
                }]);
            });

            it('diff element in an array edited key', () => {
                const objA = {array: [{a: {c: 2}}]};
                const objB = {array: [{b: {c: 2}}]};

                const resultDeepDiff = deepDiff(objA, objB);
                const resultObjectDiffer = objectDiffer.diff(objA, objB);

                expect(resultObjectDiffer).to.deep.equal(resultDeepDiff);
                expect(resultObjectDiffer).to.deep.equal([
                    {
                        kind: KIND_DELETED,
                        "lhs": {c: 2},
                        "path": ["array", 0, "a"],
                    },
                    {
                        "kind": KIND_ADDED,
                        "path": ["array", 0, "b"],
                        "rhs": {'c': 2}
                    }]);
            });
        });
    });
});