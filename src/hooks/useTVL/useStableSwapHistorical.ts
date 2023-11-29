import { HttpLink } from '@apollo/client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'

const STABLESWAP = '0x2a68d7c6ea986fa06b2665d08b4d08f5e7af960c'

export const stableSwapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/stableswap',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
})

const ssQuery = gql`
  query($block: Int!, $id: String!) {
    swap(id: $id, block: { number: $block }) {
      lpTokenSupply
      cumulativeVolume
    }
  }
`

export const useStableSwapHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const stableswap = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      blocks.map(async (block) => {
        try {
          const { data } = await stableSwapClient.query({
            query: ssQuery,
            variables: {
              id: STABLESWAP.toLowerCase(),
              block,
            },
          })
          return parseFloat(data?.swap?.lpTokenSupply) / 1e18
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])
  useEffect(() => {
    stableswap()
  }, [stableswap])
  return historical
}
