/**
 * Builds a very simple Markdown table for the given table data.
 *
 * ```javascript
 * const tableData = [
 *  ['Color', 'Hex'],
 *  ['Red', '#FF0000'],
 *  ['Yellow', '#FFFF00']
 * ]
 *
 * console.log(buildMarkdownTable(tableData))
 *
 * // | Color | Hex |
 * // | - | - |
 * // | Red | #FF0000 |
 * // | Yellow | #FFF00 |
 * ```
 * @param tableData Table data
 * @returns Markdown table string
 */
export const buildMarkdownTable = (
  tableData: Array<Array<string>> | Readonly<Array<Array<string>>>
): string => {
  const lines = tableData.map((row) => {
    return `| ${row.join(' | ')} |`
  })
  lines.splice(1, 0, `| ${Array.from(tableData[1]).fill('').join('- | -')} |`)
  return lines.join('\n')
}
