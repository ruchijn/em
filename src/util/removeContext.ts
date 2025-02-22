import { timestamp } from './timestamp'
import { equalArrays } from './equalArrays'
import { notNull } from './notNull'
import { getSessionId } from './sessionManager'
import { Context, Lexeme, Timestamp } from '../@types'

/** Returns a new Lexeme without the given context. */
export const removeContext = (
  lexeme: Lexeme,
  context: Context,
  rank: number,
  lastUpdated: Timestamp = timestamp(),
): Lexeme => {
  return Object.assign(
    {},
    lexeme,
    notNull({
      contexts: lexeme.contexts
        ? lexeme.contexts.filter(
            parent => !(equalArrays(parent.context, context) && (rank == null || parent.rank === rank)),
          )
        : [],
      created: lexeme.created || lastUpdated,
      lastUpdated: lastUpdated,
      updatedBy: getSessionId(),
    }),
  )
}
