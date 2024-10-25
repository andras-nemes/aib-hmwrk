export interface TableStyles {
    table: { [key: string]: string }
    tableCell: { [key: string]: string }
    tableHeader: { [key: string]: string }
    tableRow: { [key: string]: string }
}

export const defaultRichTextTableStyles: TableStyles = {
    table: {
        'margin-top': '0pt',
        'margin-bottom': '0pt',
        border: '0.75pt solid #cccccc',
        'border-collapse': 'collapse',
        width: '100%',
        'table-layout': 'fixed',
    },
    tableCell: {
        border: '2px solid #ced4da',
        'box-sizing': 'border-box',
        'min-width': '1em',
        padding: '3px 5px',
        position: 'relative',
        'vertical-align': 'top',
    },
    tableHeader: {
        'min-width': '1em',
        border: '2px solid #ced4da',
        padding: '3px 5px',
        'vertical-align': 'top',
        'box-sizing': 'border-box',
        position: 'relative',
        'font-weight': 'unset',
        'text-align': 'left',
        'background-color': '#f1f3f5',
    },
    tableRow: {},
}

export const objectToStyleString = (obj: { [key: string]: string } = {}): string =>
    Object.entries(obj)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
