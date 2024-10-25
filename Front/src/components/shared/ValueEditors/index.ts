import TextEditor from './TextEditor.vue'
import NumericEditor from './NumericEditor.vue'
import AutocompleteEditor from './AutocompleteEditor.vue'
import MultiselectEditor from './MultiselectEditor.vue'
import CheckboxEditor from './CheckboxEditor.vue'
import DateEditor from './DateEditor.vue'
import RichTextEditor from './RichTextEditor.vue'

import type { Component } from 'vue'

/**
 * Export all editors so we can dynamically generate them.
 */
const Editors: Record<string, Component> = {
    // Default javascript string object editor
    string: TextEditor,
    // Default javascript numeric object editor
    number: NumericEditor,
    // Numeric-type Hot editor
    numeric: NumericEditor,
    // Boolean type
    boolean: CheckboxEditor,
    // Default javascript Date object editor
    Date: DateEditor,
    // Text editor
    'aibidia-text': TextEditor,
    'aibidia-textarea': TextEditor,
    // Autocomplete editor
    'aibidia-autocomplete': AutocompleteEditor,
    // Autocomplete Multiselect editor
    'aibidia-multiselect': MultiselectEditor,
    'aibidia-hot-multiselect': MultiselectEditor,
    //  Date editor
    'aibidia-date': DateEditor,
    // Rich Text editor for Dox42 descriptions
    richText: RichTextEditor,
}

export default Editors

export {
    TextEditor,
    NumericEditor,
    AutocompleteEditor,
    MultiselectEditor,
    CheckboxEditor,
    DateEditor,
    RichTextEditor,
}
