const deepEqual = require('deep-equal');
const clonedeep = require('lodash.clonedeep');

export type JsonNativeElement = boolean | number | string | undefined;

export type JsonElementType = IJsonObject | Array<IJsonObject> | Array<JsonNativeElement> | JsonNativeElement;

export type JsonArrayElementType = Array<IJsonObject> | Array<JsonNativeElement>;

export interface IJsonObject {
    [index: string]: JsonElementType
}

export function isArray(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (typeof value === 'object') && (value.constructor === Array);
}

export function isBoolean(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (typeof value === 'boolean');
}

export function isDate(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (value instanceof Date);
}

export function isEmpty(document: JsonElementType | object): boolean {
  return (!document) || (Object.keys(document).length === 0 && document.constructor === Object);
}

export function isError(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (value instanceof Error) && (typeof value.message !== 'undefined');
}

export function isNumber(value: JsonElementType | object): boolean {
  // eslint-disable-next-line no-restricted-globals
  return ((value !== null) && ((value !== undefined))) && (typeof value === 'number') && isFinite(value);
}

export function isObject(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (typeof value === 'object') && (value.constructor === Object);
}

export function isRegExp(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && (typeof value === 'object') && (value.constructor === RegExp);
}

export function isString(value: JsonElementType | object): boolean {
  return ((value !== null) && ((value !== undefined))) && ((typeof value === 'string') || (value instanceof String));
}

export function isDefined(value: JsonElementType | object): boolean {
  return (value !== undefined);
}

export function isUndefined(value: JsonElementType | object): boolean {
  return (value === undefined);
}

export function append(document: JsonElementType, extensionDocument: JsonElementType): JsonElementType {
  const doc: any = document || {};
  const extensionDoc: any = extensionDocument || {};

  const sourceKeys: string[] = Object.keys(extensionDoc);

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sourceKeys.length; i++) {
    if (isArray(extensionDoc[sourceKeys[i]])) {
      if (Object.prototype.hasOwnProperty.call(doc, sourceKeys[i])) {
        const sourceSet = new Set(doc[sourceKeys[i]]);
        const extensionSet = new Set(extensionDoc[sourceKeys[i]]);
        const mergedSet = new Set([...Array.from(sourceSet), ...Array.from(extensionSet)]);

        doc[sourceKeys[i]] = [...Array.from(mergedSet)];
      } else {
        doc[sourceKeys[i]] = extensionDoc[sourceKeys[i]];
      }
    } else if (isObject(extensionDoc[sourceKeys[i]])) {
      if (Object.prototype.hasOwnProperty.call(doc, sourceKeys[i])) {
        append(doc[sourceKeys[i]], extensionDoc[sourceKeys[i]]);
      } else {
        doc[sourceKeys[i]] = extensionDoc[sourceKeys[i]];
      }
    } else {
      doc[sourceKeys[i]] = extensionDoc[sourceKeys[i]];
    }
  }

  return doc;
}

export function areEqual(firstObject: JsonElementType, secondObject: JsonElementType): boolean {
  return deepEqual(firstObject, secondObject);
}

export function redactUndefinedValues(document: JsonElementType) {
  if (isArray(document)) {
    // eslint-disable-next-line no-plusplus
    for (let index = (document as JsonArrayElementType).length - 1; index >= 0; index--) {
      if (isDefined((document as JsonArrayElementType)[index])) {
        redactUndefinedValues((document as JsonArrayElementType)[index]);
      } else {
        // eslint-disable-next-line no-param-reassign
        document = (document as JsonArrayElementType).splice(index, 1);
      }
    }
  } else if (isObject(document)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in (document as object)) {
      if (Object.prototype.hasOwnProperty.call(document, key)) {
        if (isDefined((document as IJsonObject)[key])) {
          redactUndefinedValues((document as IJsonObject)[key]);
        } else {
          // eslint-disable-next-line no-param-reassign
          delete (document as IJsonObject)[key];
        }
      }
    }
  }
}

export function clone(value: IJsonObject, shouldRedactUndefinedValues: boolean = true): IJsonObject {
  if (value) {
    const clonedDocument = clonedeep(value);

    if (shouldRedactUndefinedValues) {
      redactUndefinedValues(clonedDocument);
    }

    return clonedDocument;
  }

  return undefined;
}

export function stringify(obj: object, indent: number = 4, linePrefix: string = '', quoteFieldNames: boolean = true): string {
  const lines = JSON.stringify(obj, null, indent).split('\n');

  if (linePrefix !== '') {
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < lines.length; i++) {
      lines[i] = linePrefix + lines[i];
    }
  }

  if (!quoteFieldNames) {
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i < lines.length - 1; i++) {
      if ((lines[i].match(/:/g) || []).length > 0) {
        const valuePair = lines[i].split(':');
        valuePair[0] = valuePair[0].replace(/"/g, '');
        lines[i] = valuePair.join(':');
      }
    }
  }

  return lines.join('\n');
}

export function extractAndRedact(document: IJsonObject, propertyName: string): IJsonObject {
  if (Object.prototype.hasOwnProperty.call(document, propertyName)) {
    const value = JSON.parse(JSON.stringify(document[propertyName]));

    // eslint-disable-next-line no-param-reassign
    delete document[propertyName];

    return value;
  }

  return undefined;
}
