import type {
    HotCellValue,
    HotColumnProperties,
} from 'components/shared/CrudTableEditor/HotTable/types/HotColumnProperties'
import { i18n } from 'layout/lib/i18n'

/** Generic Validation error when cell value does not meet some requirement */
export class ValidationError extends Error {
    constructor(message: string) {
        super(message)
        Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    }
}

/** When value does not exist */
export class NotExistingValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.not-exist') as string)
    }
}

/** When value is required, but empty */
export class ValueRequiredError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.is-required') as string)
    }
}

/** When value is duplicate of some other row */
export class UniqueValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.must-be-unique') as string)
    }
}

/** When value should not be equal to another column */
export class NotEqualToError extends ValidationError {
    column: HotColumnProperties
    conflictValue: HotCellValue

    constructor(column: HotColumnProperties, conflictValue: HotCellValue) {
        super(
            i18n.global.t('errors.validation.cannot-equal-column', {
                column: column.label,
            }) as string
        )

        this.column = column
        this.conflictValue = conflictValue
    }
}

/** When value should be numeric */
export class NumericValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.not-numeric') as string)
    }
}

/** When HTML input reports invalid value */
export class HTMLValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.invalid') as string)
    }
}

/** When value should be within range */
export class NumericRangeError extends ValidationError {
    min?: number
    max?: number

    constructor(min: number | undefined, max: number | undefined) {
        if (min === undefined) {
            super(i18n.global.t('errors.validation.less-or-equal-to', { max: max }) as string)
        } else if (max === undefined) {
            super(i18n.global.t('errors.validation.greater-or-equal-to', { min: min }) as string)
        } else {
            super(i18n.global.t('errors.validation.between', { min: min, max: max }) as string)
        }

        this.min = min
        this.max = max
    }
}

/** When value should be an integer */
export class IntegerValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.not-integer') as string)
    }
}

/** When value string length should be within range */
export class MaxLengthError extends ValidationError {
    constructor(maxLength: number, valueLength: number) {
        super(
            i18n.global.t('errors.validation.max-length-exceeded', {
                maxLength: maxLength,
                valueLength: valueLength,
            }) as string
        )
    }
}

/** When value should be a valid date */
export class DateValueError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.invalid-date') as string)
    }
}

// TODO should refactor the pattern someDateAfterSomeDate into a general class.
/** When effective date should be before term expiration date */
export class EffectiveDateAfterTermExpirationError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.effective-date-after-term-expiration') as string)
    }
}

/** When start date should be before end date */
export class StartDateAfterEndDateError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.start-date-after-end-date') as string)
    }
}

/** When start year should be before end year */
export class StartYearAfterEndYearError extends ValidationError {
    constructor() {
        super(i18n.global.t('errors.validation.start-year-after-end-year') as string)
    }
}
