import test from 'tape'
import { buildMarkdownTable } from '../utils/markdown'

const FIXTURES = {
  TABLE: [
    ['Color', 'Hex'],
    ['Red', '#FF0000'],
    ['Yellow', '#FFFF00'],
  ],
}

test('🧪 buildMarkdownTable() should return markdown table', (t) => {
  t.plan(1)
  const table = FIXTURES.TABLE
  t.equal(
    buildMarkdownTable(table),
    `| Color | Hex |\n| - | - |\n| Red | #FF0000 |\n| Yellow | #FFFF00 |`,
    'should return correctly formatted markdown table'
  )
  t.end()
})
