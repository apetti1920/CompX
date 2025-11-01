import _ from 'lodash';

import { CompXErrorJson, ErrorTypeStrings } from '../Network/ErrorHandling';

export class CompXError extends Error {
  private errorType: (typeof ErrorTypeStrings)[number];
  private compxStack?: CompXError;

  // Create the error from a json
  static fromJSON(json: CompXErrorJson): CompXError {
    const tmpErr = new CompXError(json.errorType, json.name, json.message);
    if (json.stack !== undefined) tmpErr.compxStack = CompXError.fromJSON(json.stack);
    return tmpErr;
  }

  // basic constructor
  constructor(errorType: (typeof ErrorTypeStrings)[number], errorName: string, message: string) {
    super(message);
    Object.setPrototypeOf(this, CompXError.prototype);

    this.errorType = errorType;
    this.name = errorName;
    this.message = message;
  }

  // Add a new error to the top of the call stack
  public AddToStack(err: CompXError) {
    const tmpErr: CompXError = _.cloneDeep(this);
    this.errorType = err.errorType;
    this.name = err.name;
    this.message = err.message;
    this.compxStack = tmpErr;
  }

  // Serializes the error object as JSON
  public ToJson(): CompXErrorJson {
    const json = {
      errorType: this.errorType,
      name: this.name,
      message: this.message,
      stack: this.compxStack?.ToJson()
    };

    if (json.stack === undefined) delete json.stack;
    return json;
  }
}

export { ErrorTypeStrings };
