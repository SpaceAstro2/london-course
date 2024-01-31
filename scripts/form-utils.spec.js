const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const HTMLParser = require('fast-html-parser');

const { getAllFormControlElements, submitHandler } = require('./form-utils');

const EVENT = { preventDefault: () => {} };

const EMPTY_DOC = HTMLParser.parse('<!DOCTYPE html><html />');
const DOC_WITH_WRONG_ELEMENT = HTMLParser.parse(
  '<!DOCTYPE html><html><head /><body><ul id="list"><li>Hello World</li></ul></body></html>'
);
const DOC_WITH_EMPTY_FORM = HTMLParser.parse(
  '<!DOCTYPE html><html><head /><body><form id="form-1"></form></body></html>'
);
const DOC_WITH_SIMPLE_FORM = HTMLParser.parse(
  '<!DOCTYPE html><html><head /><body><form id="form-1"><input type="text" id="text-1" name="text-1" value="Some text" /></form></body></html>'
);
const DOC_WITH_COMPLEX_FORM = HTMLParser.parse(
  '<!DOCTYPE html><html><head /><body><form id="form-1"><input type="text" id="text-1" name="text-1" value="Some text" /><div><select id="select-1" name="select-1"><option id="option-1" name="option-1">1st option</option><option id="option-2" name="option-2" selected>2nd option</option></select></div></form></body></html>'
);

describe.only('submitHandler', () => {
  it('fails if the document is not passed in', () => {
    try {
      submitHandler(EVENT, null, null);
      assert.fail('Expected to throw an error');
    } catch (e) {
      assert.equal(e.message, "Required parameter 'document' not supplied");
    }
  });
  it('fails if the formId is not passed in', () => {
    try {
      submitHandler(EVENT, EMPTY_DOC, null);
      assert.fail('Expected to throw an error');
    } catch (e) {
      assert.equal(e.message, "Required parameter 'formId' not supplied");
    }
  });
  it('fails if the element with formId cannot be found', () => {
    try {
      submitHandler(EVENT, EMPTY_DOC, 'non-existant-element');
      assert.fail('Expected to throw an error');
    } catch (e) {
      assert.equal(e.message, 'Unable to find form #non-existant-element in the document');
    }
  });
  it('fails if the element is not a form', () => {
    try {
      submitHandler(EVENT, DOC_WITH_WRONG_ELEMENT, 'list');
      assert.fail('Expected to throw an error');
    } catch (e) {
      assert.equal(e.message, 'Element #list is not a form, but a ul');
    }
  });
  it('success result', () => {
    const result = submitHandler(EVENT, DOC_WITH_COMPLEX_FORM, 'form-1');
    assert.equal(result, []);
  });
  it.only('success result', () => {
    const result = submitHandler(EVENT, DOC_WITH_COMPLEX_FORM, 'form-1', [{ type: 'textbox' }]);
    assert.equal(result, []);
  });
});

describe('getAllFormControlElements', () => {
  it('return an empty array when there are no form elements found', () => {
    const formElements = getAllFormControlElements(DOC_WITH_EMPTY_FORM.querySelector('#form-1'));
    assert.equal(formElements.length, 0);
    assert.deepStrictEqual(formElements, []);
  });
  it('return an array with 1 form element', () => {
    const formElements = getAllFormControlElements(DOC_WITH_SIMPLE_FORM.querySelector('#form-1'));
    assert.equal(formElements.length, 1);
    assert.deepStrictEqual(formElements, [
      {
        childNodes: [],
        classNames: [],
        id: 'text-1',
        rawAttrs: 'type="text" id="text-1" name="text-1" value="Some text" ',
        tagName: 'input',
      },
    ]);
  });
  it('return an array with 3 form elements', () => {
    const formElements = getAllFormControlElements(DOC_WITH_COMPLEX_FORM.querySelector('#form-1'));
    assert.equal(formElements.length, 4);
    assert.deepStrictEqual(formElements, [
      {
        childNodes: [],
        classNames: [],
        id: 'text-1',
        rawAttrs: 'type="text" id="text-1" name="text-1" value="Some text" ',
        tagName: 'input',
      },
      {
        childNodes: [],
        classNames: [],
        id: 'select-1',
        rawAttrs: 'id="select-1" name="select-1"',
        tagName: 'select',
      },
      {
        childNodes: [],
        classNames: [],
        id: 'option-1',
        rawAttrs: 'id="option-1" name="option-1"',
        tagName: 'option',
      },
      {
        childNodes: [],
        classNames: [],
        id: 'option-2',
        rawAttrs: 'id="option-2" name="option-2" selected',
        tagName: 'option',
      },
    ]);
  });
});
