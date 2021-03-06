import { withClientState } from 'apollo-link-state'
import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { ApolloLink } from 'apollo-link'

import { WATCHED_KEY, FAV_KEY, getStorage, setStorage } from './state'

const defaultState = {
    favorites: getStorage(FAV_KEY),
    watched: getStorage(WATCHED_KEY),
    hideViewed: false,
    search: '',
    searchSpeakers: ''
}

const cache = new InMemoryCache()

const stateLink = withClientState({
    defaults: defaultState,
    cache,
    resolvers: {
        Mutation: {
            addFavorite: (_, { id }, { cache }) => {
                const query = gql`
                    query GetFavorites {
                        favorites @client
                    }
                `

                const previous = cache.readQuery({ query })
                const data = {
                    favorites: [...previous.favorites, id]
                }

                setStorage(FAV_KEY, data.favorites)

                cache.writeQuery({ query, data })
            },
            removeFavorite: (_, { id }, { cache }) => {
                const query = gql`
                    query GetFavorites {
                        favorites @client
                    }
                `

                const previous = cache.readQuery({ query })
                const data = {
                    favorites: previous.favorites.filter(a => a !== id)
                }

                setStorage(FAV_KEY, data.favorites)

                cache.writeQuery({ query, data })
            },
            addWatched: (_, { id }, { cache }) => {
                const query = gql`
                    query GetWatched {
                        watched @client
                    }
                `

                const previous = cache.readQuery({ query })
                const data = {
                    watched: [...previous.watched, id]
                }

                setStorage(WATCHED_KEY, data.watched)

                cache.writeQuery({ query, data })
            },
            removeWatched: (_, { id }, { cache }) => {
                const query = gql`
                    query GetWatched {
                        watched @client
                    }
                `

                const previous = cache.readQuery({ query })
                const data = {
                    watched: previous.watched.filter(a => a !== id)
                }

                setStorage(WATCHED_KEY, data.watched)

                cache.writeQuery({ query, data })
            }
        }
    }
})

export default new ApolloClient({
    connectToDevTools: process.browser,
    ssrMode: !process.browser,
    link: ApolloLink.from([
        stateLink,
        new HttpLink({
            uri: 'https://api.graphcms.com/simple/v1/cjhdcwrb98if90109o4pzawaq'
        })
    ]),
    cache:
        typeof window !== 'undefined'
            ? new InMemoryCache().restore(window.__APOLLO_STATE__)
            : new InMemoryCache()
})
