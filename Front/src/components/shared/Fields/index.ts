// Editors
import LabelField from './LabelField.vue'
import TextareaField from './TextareaField.vue'
import TextField from './TextField.vue'
import NumericField from './NumericField.vue'
import SelectField from './SelectField.vue'
import MultiSelectField from './MultiSelectField.vue'
import SwitchField from './SwitchField.vue'
import CheckboxField from './CheckboxField.vue'
import ActionField from './ActionField.vue'
import DayMonthField from './DayMonthField.vue'
import DateField from './DateField.vue'
import SubtitleField from './SubtitleField.vue'
import AttachmentsField from './AttachmentsField.vue'
import RichTextField from './RichTextField.vue'

import type BaseField from './BaseField.vue'
import * as ValidationErrors from './ValidationErrors'

type FieldsRecordType = Record<string, typeof BaseField>

/**
 * Export all form field so we can dynamically generate them.
 */

const FormFields: FieldsRecordType = {
    /** Label editor, shows text representation of the value which can not be edited */
    Label: LabelField,
    /** Section header or subtitle is used to divide fields in tooltips */
    Subtitle: SubtitleField,
    /** Textarea fields with many rows to edit */
    Textarea: TextareaField,
    /** Text field with only one string to edit */
    Text: TextField,
    /** Rich text field to edit string values which can contain formatting such as bullet points and numbered lists */
    RichText: RichTextField,
    /** Text field to edit numeric values */
    Numeric: NumericField,
    /** Selects value using autocomplete from list of items */
    Select: SelectField,
    /** Selects value using autocomplete from list of items */
    MultiSelect: MultiSelectField,
    /** Switch for quickly switching boolean state on/off using switch slider style */
    Switch: SwitchField,
    /** Toggle for quickly switching boolean state on/off using checkbox style */
    Checkbox: CheckboxField,
    /** Field to layout button to form */
    Action: ActionField,
    /** Two dropdowns, for selecting month and day in single field */
    DayMonth: DayMonthField,
    /** Date object selector field */
    Date: DateField,
    /** Attachments field primarily used in tooltips */
    Attachments: AttachmentsField,
}

export default FormFields

export {
    LabelField,
    SubtitleField,
    TextareaField,
    TextField,
    NumericField,
    SelectField,
    MultiSelectField,
    SwitchField,
    CheckboxField,
    ActionField,
    DayMonthField,
    DateField,
    AttachmentsField,
    RichTextField,
    ValidationErrors,
}
