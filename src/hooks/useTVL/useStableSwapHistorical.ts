import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'
import { getBalance } from './helpers'

const STABLESWAP = '0x2a68d7c6ea986fa06b2665d08b4d08f5e7af960c'

export const stableSwapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/stableswap',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

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

const ssQueryNoBlock = gql`
  query($id: String!) {
    swap(id: $id) {
      lpTokenSupply
      cumulativeVolume
      balances
      tokens {
        name
        symbol
        decimals
        id
      }
    }
  }
`

export const useStableSwapDaily = () => {
  const [data, setData] = useState([])
  const stableswap = useCallback(async () => {
    try {
      const { data } = await stableSwapClient.query({
        query: ssQueryNoBlock,
        variables: {
          id: STABLESWAP.toLowerCase(),
        },
      })

      const BALANCE_MAP = {
        '0x620fd5fa44be6af63715ef4e65ddfa0387ad13f5': 1,
        '0x6a5f6a8121592becd6747a38d67451b310f7f156': 0,
        '0xfadbbf8ce7d5b7041be672561bba99f79c532e10': 2,
      }

      const results = await Promise.all(
        data?.swap?.tokens.map(async ({ id, name, symbol, decimals }) => {
          return {
            name,
            symbol,
            id,
            priceUSD: await getBalance(id),
            balance: parseFloat(data?.swap?.balances[BALANCE_MAP[id]]) / Math.pow(10, parseInt(decimals)),
            totalLiquidityUSD:
              (parseFloat(data?.swap?.balances[BALANCE_MAP[id]]) / Math.pow(10, parseInt(decimals))) *
              (await getBalance(id)),
          }
        })
      )

      setData(results)
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    stableswap()
  }, [stableswap])
  return data
}
