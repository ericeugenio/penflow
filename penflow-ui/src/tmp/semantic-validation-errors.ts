/************************************************************************/
/* TYPES                                                                */
/************************************************************************/

export type ValidationError = {
    code: string,
    message: string,
    origin: string,
};

/************************************************************************/
/* HELPERS                                                              */
/************************************************************************/

export function validate(
    errors: ValidationError[],
    error: ValidationError,
    condition: boolean,
): ValidationError[] {
    let localErrors = [...errors];

    if (condition) {
        if (localErrors.find((err) => err.code === error.code) === undefined) {
            // New error, add
            localErrors = [...localErrors, error];
        } else {
            // Old error, update
            localErrors = localErrors.map((err) => err.code === error.code ? error : err);
        }
    } else {
        // Old error, remove
        localErrors = localErrors.filter((err) => err.code != error.code);
    }

    return localErrors;
}

/************************************************************************/
/* VALIDATION_ERRORS                                                    */
/************************************************************************/

export const ERR_REQUIRED_FIELD = (origin: string, name: string): ValidationError => {
    return {
        code: "ERR_REQUIRED",
        message: `Required field "${name}" is missing`,
        origin: origin
    }
};

export const ERR_INVALID_FIELD_TYPE = (origin: string, expected_type: string): ValidationError => {
    return {
        code: "ERR_INVALID_FIELD_TYPE",
        message: `Field is expecting a ${expected_type}`,
        origin: origin
    }
};

export const ERR_RESERVED_KEYWORD = (origin: string, keyword: string): ValidationError => {
    return {
        code: "ERR_RESERVED_KEYWORD",
        message: `"${keyword}" is a reserved keyword`,
        origin: origin
    }
};

export const ERR_INVALID_VARIABLE = (origin: string, name: string): ValidationError => {
    return {
        code: "ERR_INVALID_VARIABLE",
        message: `Cannot find variable ${name}`,
        origin: origin
    }
};

export const ERR_FORWARD_REFERENCE_VARIABLE = (origin: string, name: string): ValidationError => {
    return {
        code: "ERR_FORWARD_REFERENCE_VARIABLE",
        message: `Variable ${name} is used before its declaration.`,
        origin: origin
    }
};

export const ERR_REDECLARED_VARIABLE = (origin: string, name: string): ValidationError => {
    return {
        code: "ERR_REDECLARED_VARIABLE",
        message: `Cannot redeclare variable "${name}" under the same scope`,
        origin: origin
    }
};

export const ERR_INVALID_VARIABLE_TYPE = (origin: string, expected_type: string, got_type: string): ValidationError => {
    return {
        code: "ERR_INVALID_VARIABLE_TYPE",
        message:  `Expected type (${expected_type}) does not match variable type (${got_type})`,
        origin: origin
    }
};
