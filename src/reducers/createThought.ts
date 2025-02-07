import _ from 'lodash'
import { updateThoughts } from '../reducers'
import { getNextRank, getLexeme, getAllChildren } from '../selectors'
import { createId, equalThoughtRanked, hashContext, hashThought, head, timestamp } from '../util'
import { Child, Context, Index, Lexeme, Parent, State } from '../@types'
import { getSessionId } from '../util/sessionManager'

interface Payload {
  context: Context
  value: string
  rank: number
  id?: string
  addAsContext?: boolean
}
/**
 * Creates a new thought with a known context and rank. Does not update the cursor. Use the newThought reducer for a higher level function.
 *
 * @param addAsContext Adds the given context to the new thought.
 */
const createThought = (state: State, { context, value, rank, id, addAsContext }: Payload) => {
  id = id || createId()

  // create thought if non-existent
  const lexeme: Lexeme = {
    ...(getLexeme(state, value) || {
      value,
      contexts: [],
      created: timestamp(),
      lastUpdated: timestamp(),
      updatedBy: getSessionId(),
    }),
  }

  const contextActual = addAsContext ? [value] : context

  // store children indexed by the encoded context for O(1) lookup of children
  const contextEncoded = hashContext(contextActual)
  const contextIndexUpdates: Index<Parent> = {}

  if (context.length > 0) {
    const newContextChild: Child = {
      value: addAsContext ? head(context) : value,
      rank: addAsContext ? getNextRank(state, [value]) : rank,
      id,
      lastUpdated: timestamp(),
    }
    const children = getAllChildren(state, contextActual)
      .filter(child => !equalThoughtRanked(child, newContextChild))
      .concat(newContextChild)
    contextIndexUpdates[contextEncoded] = {
      ...contextIndexUpdates[contextEncoded],
      context: contextActual,
      children,
      lastUpdated: timestamp(),
      updatedBy: getSessionId(),
    }
  }

  // if adding as the context of an existing thought
  let lexemeNew: Lexeme | undefined // eslint-disable-line fp/no-let
  if (addAsContext) {
    const lexemeOld = getLexeme(state, head(context))
    lexemeNew = {
      ...lexemeOld!,
      contexts: (lexemeOld?.contexts || []).concat({
        context: [value],
        id,
        rank: getNextRank(state, [value]),
      }),
      created: lexemeOld?.created || timestamp(),
      lastUpdated: timestamp(),
      updatedBy: getSessionId(),
    }
  } else {
    lexeme.contexts = !lexeme.contexts
      ? []
      : // floating thought (no context)
      context.length > 0
      ? [
          ...lexeme.contexts,
          {
            context,
            id,
            rank,
          },
        ]
      : lexeme.contexts
  }

  const thoughtIndexUpdates = {
    [hashThought(lexeme.value)]: lexeme,
    ...(lexemeNew
      ? {
          [hashThought(lexemeNew.value)]: lexemeNew,
        }
      : null),
  }

  return updateThoughts(state, { thoughtIndexUpdates, contextIndexUpdates })
}

export default _.curryRight(createThought)
