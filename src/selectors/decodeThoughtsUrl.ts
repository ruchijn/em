import { HOME_TOKEN } from '../constants'
import { componentToThought, hashContext, keyValueBy, owner } from '../util'
import { pathExists, rankThoughtsFirstMatch } from '../selectors'
import { State } from '../@types'

interface Options {
  // if true, check that all thoughts in the path exist, otherwise return null
  exists?: boolean

  // the url to decode and convert to a Path. Defaults to window.location.pathname.
  url?: string
}

/** Parses the thoughts from the url. */
const decodeThoughtsUrl = (state: State, { exists, url }: Options = {}) => {
  url = url || window.location.href
  const urlRelative = url.replace(/^(?:\/\/|[^/]+)*(\/)?/, '')
  const urlComponents = urlRelative.split('/')
  const urlOwner = urlComponents[0] || '~' // ~ represents currently authenticated user

  if (urlOwner !== owner()) {
    console.error(
      `decodeThoughtsUrl: owner does not match owner(). "${urlOwner}" !== "${owner()}". This is likely a regression, as they should always match.`,
    )
  }

  const urlPath = urlComponents.length > 1 ? urlComponents.slice(1) : [HOME_TOKEN]
  const pathUnranked = urlPath.map(componentToThought)
  const contextViews = keyValueBy(urlPath, (cur, i) =>
    /~$/.test(cur)
      ? {
          [hashContext(pathUnranked.slice(0, i + 1))]: true,
        }
      : null,
  )

  // infer ranks of url path so that url can be /A/a1 instead of /A_0/a1_0 etc
  // if exists is specified and the thoughts are not yet loaded into state, return null
  const path =
    !exists || pathExists(state, urlPath) ? rankThoughtsFirstMatch({ ...state, contextViews }, pathUnranked) : null

  return {
    contextViews,
    path: path,
    owner: urlOwner,
  }
}

export default decodeThoughtsUrl
