import { hashContext, headRank, pathToContext } from '../util'
import { Path } from '../types'

/** Returns the editable DOM node of the given thoughts. Also selects dividers. */
export const editableNode = (path: Path): HTMLElement | null => {
  const rank = headRank(path)
  const context = hashContext(pathToContext(path), rank)
  return document.getElementsByClassName('editable-' + context)[0] as HTMLElement || null
}
