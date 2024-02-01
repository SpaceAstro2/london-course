fu = (function () {
  const HTML_FORM_ELEMENTS = ['input', 'textarea', 'select', 'option', 'label'];

  /**
   *
   * @param {HTMLFormElement} form
   * @returns {Array<ChildNode>}
   */
  const getAllFormControlElements = (form) => {
    const elements = [];

    elements.push(...getAllChildElements(form.childNodes));

    return elements;
  };

  /**
   *
   * @param {Document} document
   * @param {object} expected
   * @returns
   */
  const verifyAllFormControlElements = (document, expected) => {
    const result = [];

    for (let i = 0; i < expected.length; i++) {
      const field = expected[i];
      let element;

      if (field.id != null) {
        element = document.getElementById(field.id);
      } else {
        if (field.type === 'label') {
          const elements = document.getElementsByTagName('label');
          for (let j = 0; j < elements.length; j++) {
            if (elements[j].attributes['for']?.value === field.for) {
              element = elements[j];
            }
          }
        } else if (field.type === 'option') {
          const elements = document.getElementsByTagName('option');
          for (let j = 0; j < elements.length; j++) {
            if (elements[j].value === field.value) {
              element = elements[j];
            }
          }
        } else if (field.type === 'submit') {
          element = document.getElementsByTagName('button')[0];
        }
      }

      const comment = verifyFormControlElement(element, field);
      if (comment != null) {
        result.push(comment);
      }
    }

    return result;
  };

  /**
   *
   * @param {object} field
   */
  const getFieldId = (field) => {
    switch (field.type) {
      case 'submit':
        return field.type;
      case 'label':
        return `${field.type}[for=${field.for}]`;
      default:
        return field.id;
    }
  };

  /**
   *
   * @param {HTMLElement} element
   * @param {object} field
   * @returns
   */
  const verifyFormControlElement = (element, field) => {
    const fieldId = getFieldId(field);

    console.log({ field, element });

    if (element == null) {
      return `Field ${fieldId} (${field.type}) not found`;
    } else {
      if (field.type !== 'submit' && field.type !== 'label' && field.type !== 'option') {
        const name = element.attributes['name']?.value;
        if (name == null) {
          return `Field ${fieldId} (${field.type}) has no name: Expected it to be ${field.name}`;
        }
        if (name !== field.name) {
          return `Field ${fieldId} (${field.type}) has the wrong name: Expected ${field.name}, but found ${name}`;
        }
      }
      switch (field.type) {
        case 'select':
          if (element.tagName.toLocaleLowerCase() !== 'select') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected select, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          break;
        case 'radio':
          if (element.tagName.toLocaleLowerCase() !== 'input') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected input, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.attributes['name']?.value !== field.name) {
            return `Field ${fieldId} (${field.type}) is the wrong name: Expected ${field.name}, but found ${element.attributes['name']?.value}`;
          }
          if (element.value !== field.value) {
            return `Field ${fieldId} (${field.type}) is the wrong value: Expected ${field.value}, but found ${element.value}`;
          }
          break;
        case 'option':
          if (element.tagName.toLocaleLowerCase() !== 'option') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected option, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.parentElement.name !== field.parent) {
            return `Field ${fieldId} (${field.type}) is not within the correct select list: Expected select list to be ${field.parent}`;
          }
          break;
        case 'textbox':
          if (element.tagName.toLocaleLowerCase() !== 'input') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected input, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.type !== 'text') {
            return `Field ${fieldId} (${field.type}) is the wrong type of form control: Expected text, but found ${element.type}`;
          }
          break;
        case 'password':
          if (element.tagName.toLocaleLowerCase() !== 'input') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected input, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.type !== 'password') {
            return `Field ${fieldId} (${field.type}) is the wrong type of form control: Expected password, but found ${element.type}`;
          }
          break;
        case 'label':
          if (element.tagName.toLocaleLowerCase() !== 'label') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected label, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.attributes['for']?.value !== field.for) {
            return `Field ${fieldId} (${field.type}) is associated with the wrong form control: Expected ${field.for}, but found ${element.attributes['for']?.value}`;
          }
          break;
        case 'submit':
          if (element.tagName.toLocaleLowerCase() !== 'button') {
            return `Field ${fieldId} (${field.type}) is the wrong tag: Expected button, but found ${element.tagName.toLocaleLowerCase()}`;
          }
          if (element.type !== 'submit') {
            return `Field ${fieldId} (${field.type}) is the wrong type of form control: Expected submit, but found ${element.type}`;
          }
          break;
      }
    }
  };

  /**
   *
   * @param {NodeListOf<ChildNode>} children
   */
  const getAllChildElements = (children) => {
    const elements = [];

    // console.log(children);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (HTML_FORM_ELEMENTS.includes(child.tagName?.toLocaleLowerCase())) {
        elements.push(child);
      }
      if (child.childNodes != null) {
        elements.push(...getAllChildElements(child.childNodes));
      }
    }

    return elements;
  };

  /**
   *
   * @param {SubmitEvent} event
   * @param {Document} document The page's document object, e.g. window.document
   * @param {string} formId The id of the form to check
   */
  const submitHandler = (event, document, formId) => {
    console.log('submitHandler');
    event.preventDefault();
    const formData = [];

    if (document === null) {
      throw new Error("Required parameter 'document' not supplied");
    }
    if (formId === null) {
      throw new Error("Required parameter 'formId' not supplied");
    }

    const form = document.querySelector(`#${formId}`);
    if (form === null) {
      throw new Error(`Unable to find form #${formId} in the document`);
    }
    if (form.tagName.toLocaleLowerCase() !== 'form') {
      throw new Error(`Element #${formId} is not a form, but a ${form.tagName}`);
    }

    const formElements = getAllFormControlElements(form);

    for (let i = 0; i < formElements.length; i++) {
      formData.push(extractFormControlData(formElements[i]));
    }

    console.log({ formData });

    return formData;
  };

  /**
   *
   * @param {SubmitEvent} event
   * @param {Document} document The page's document object, e.g. window.document
   * @param {string} formId The id of the form to check
   * @param {Array<any>} expected The expected fields
   */
  const submitHandler2 = (event, document, formId, expected) => {
    console.log('submitHandler2');

    if (event === null) {
      throw new Error("Required parameter 'event' not supplied");
    }
    if (document === null) {
      throw new Error("Required parameter 'document' not supplied");
    }
    if (formId === null) {
      throw new Error("Required parameter 'formId' not supplied");
    }

    event.preventDefault();

    const form = document.querySelector(`#${formId}`);
    if (form === null) {
      throw new Error(`Unable to find form #${formId} in the document`);
    }
    if (form.tagName.toLocaleLowerCase() !== 'form') {
      throw new Error(`Element #${formId} is not a form, but a ${form.tagName}`);
    }

    const result = verifyAllFormControlElements(document, expected);

    buildReport(document, result);

    return result;
  };

  /**
   *
   * @param {Document} document
   * @param {object} result
   */
  const buildReport = (document, result) => {
    let reportHeaderMsg = "Congratulations, you've done it! Well done 🎉˚ ༘ ೀ⋆.˚🥳🎊";

    if (result.length !== 0) {
      reportHeaderMsg = "Oh dear, it looks like you've got a few issues you need to resolve:";
    }

    const reportHeader = document.createElement('h3');
    reportHeader.appendChild(document.createTextNode(reportHeaderMsg));
    document.body.appendChild(reportHeader);

    //Remove the old report, if it exists
    const reportEl = document.getElementById('report');
    if (reportEl !== null) {
      reportEl.remove();
    }

    const listEl = document.createElement('ol');
    listEl.setAttribute('id', 'report');
    for (let i = 0; i < result.length; i++) {
      const listItemEl = document.createElement('li');
      listItemEl.appendChild(document.createTextNode(result[i]));
      listEl.appendChild(listItemEl);
    }

    document.body.appendChild(listEl);
  };

  /**
   *
   * @param {HTMLElement} control
   */
  const extractFormControlData = (control) => {
    switch (control.tagName.toLocaleLowerCase()) {
      case 'input':
        return extractInputControlData(control);
      case 'select':
        return extractSelectControlData(control);
    }
  };

  const extractInputControlData = (control) => {
    switch (control.attributes['type'].value) {
      case 'text':
      case 'password':
      case 'email':
        return {
          type: 'textbox',
          id: control.id,
          name: control.attributes['name']?.value,
          value: control.attributes['value']?.value,
        };
    }
  };

  const extractSelectControlData = (control) => {
    let value;

    for (let i = 0; i < control.length; i++) {
      const option = control[i];
      if (option.attributes['selected'] != null) {
        value = option.id;
        break;
      }
    }
    return {
      type: 'select',
      id: control.id,
      name: control.attributes['name']?.value,
      value,
    };
  };

  return {
    getAllFormControlElements,
    submitHandler,
    submitHandler2,
  };
})();

if (typeof window !== 'undefined') {
  window.fu = fu;
}

if (typeof module !== 'undefined') {
  module.exports = fu;
}
