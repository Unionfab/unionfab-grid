import { GridOptions } from '@ag-grid-community/core'
import { DoublingEditor } from './doublingEditor_typescript'
import { MoodRenderer } from './moodRenderer_typescript'
import { MoodEditor } from './moodEditor_typescript'
import { NumericEditor } from './numericEditor_typescript'

const gridOptions: GridOptions = {
  columnDefs: [
    {
      headerName: 'Doubling',
      field: 'number',
      cellEditorComp: DoublingEditor,
      editable: true,
      width: 300,
    },
    {
      field: 'mood',
      cellRendererComp: MoodRenderer,
      cellEditorComp: MoodEditor,
      editable: true,
      width: 300,
    },
    {
      headerName: 'Numeric',
      field: 'number',
      cellEditorComp: NumericEditor,
      editable: true,
      width: 280,
    },
  ],
  rowData: [
    { name: 'Bob', mood: 'Happy', number: 10 },
    { name: 'Harry', mood: 'Sad', number: 3 },
    { name: 'Sally', mood: 'Happy', number: 20 },
    { name: 'Mary', mood: 'Sad', number: 5 },
    { name: 'John', mood: 'Happy', number: 15 },
    { name: 'Jack', mood: 'Happy', number: 25 },
    { name: 'Sue', mood: 'Sad', number: 43 },
    { name: 'Sean', mood: 'Sad', number: 1335 },
    { name: 'Niall', mood: 'Happy', number: 2 },
    { name: 'Alberto', mood: 'Happy', number: 123 },
    { name: 'Fred', mood: 'Sad', number: 532 },
    { name: 'Jenny', mood: 'Happy', number: 34 },
    { name: 'Larry', mood: 'Happy', number: 13 },
  ],
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new agGrid.Grid(gridDiv, gridOptions)
})
