/**
 * @jest-environment ./src/e2e/puppeteer-environment.js
 */

import paste from '../../test-helpers/e2e-helpers/paste'
import getEditingText from '../../test-helpers/e2e-helpers/getEditingText'
import waitForEditable from '../../test-helpers/e2e-helpers/waitForEditable'
import waitForState from '../../test-helpers/e2e-helpers/waitForState'
import clickThought from '../../test-helpers/e2e-helpers/clickThought'
import initPage from '../../test-helpers/e2e-helpers/initPage'
import { Page } from 'puppeteer'

describe('Context view: edit context testing', () => {
  let page: Page

  beforeEach(async () => {
    page = await initPage()
  })

  afterEach(async () => {
    await page.browserContext().close()
  })

  it('edit context value', async () => {

    const importText = `
    - a
      - m
        - x
    - b
      - m`
    await paste(page, [''], importText)

    await waitForEditable(page, 'b')
    await clickThought(page, 'b')

    await waitForEditable(page, 'm')
    await clickThought(page, 'm')

    await waitForState(page, 'isPushing', false)

    await clickThought(page, 'toggleContextView')

    await clickThought(page, 'a')

    const thoughtValueInitial = await getEditingText(page)
    thoughtValueInitial?.replace('a', 'apple')

    await clickThought(page, 'b')
    await clickThought(page, 'm')

    const thoughtValue = await getEditingText(page)
    expect(thoughtValue === 'apple').toBeFalsy()
  })
})
