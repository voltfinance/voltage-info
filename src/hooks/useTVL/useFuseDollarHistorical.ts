import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'
import { getBalance, getBalanceAtBlock } from './helpers'
import { HttpLink } from '@apollo/client'

const FUSD_V2 = '0xd0ce1b4a349c35e61af02f5971e71ac502441e49'
const FUSD_V3 = '0xce86a1cf3cff48139598de6bf9b1df2e0f79f86f'

const fusdV2Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/fusd-subgraph',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
})

const fusdV3Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/fusd-v3',
  }) as any,

  cache: new InMemoryCache(),
  shouldBatch: true,
})

const fusdQuery = gql`
  query($id: String!, $block: Int!) {
    masset(id: $id, block: { number: $block }) {
      totalSupply {
        simple
      }
    }
  }
`
const fusdQueryWithoutBlock = gql`
  query($id: String!) {
    masset(id: $id) {
      totalSupply {
        simple
      }
    }
  }
`

export const useFuseDollarHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])

  const fusd = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])
    const results = await Promise.all(
      blocks.map(async (block) => {
        try {
          const fusdV2 = await fusdV2Client.query({
            query: fusdQuery,
            variables: {
              id: FUSD_V2.toLowerCase(),
              block,
            },
          })
          const fusdV3 = await fusdV3Client.query({
            query: fusdQuery,
            variables: {
              id: FUSD_V3.toLowerCase(),
              block,
            },
          })
          const fusdV2Balance = await getBalanceAtBlock(FUSD_V2, block)
          const fusdV3Balance = await getBalanceAtBlock(FUSD_V3, block)
          return (
            parseFloat(fusdV2?.data?.masset?.totalSupply?.simple) * fusdV2Balance +
            parseFloat(fusdV3?.data?.masset?.totalSupply?.simple) * fusdV3Balance
          )
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])

  useEffect(() => {
    fusd()
  }, [fusd])
  return historical
}

export const useFuseDollarDaily = () => {
  const [historical, setHistorical] = useState([])

  const fusd = useCallback(async () => {
    try {
      const fusdV2 = await fusdV2Client.query({
        query: fusdQueryWithoutBlock,
        variables: {
          id: FUSD_V2.toLowerCase(),
        },
      })
      const fusdV3 = await fusdV3Client.query({
        query: fusdQueryWithoutBlock,
        variables: {
          id: FUSD_V3.toLowerCase(),
        },
      })
      const fusdV2Balance = await getBalance(FUSD_V2)
      const fusdV3Balance = await getBalance(FUSD_V3)

      setHistorical([
        {
          name: 'fUSD V2',
          symbol: 'fUSD_V2',
          priceUSD: fusdV2Balance,
          balance: fusdV2?.data?.masset?.totalSupply?.simple,
          totalLiquidityUSD: parseFloat(fusdV2?.data?.masset?.totalSupply?.simple) * fusdV2Balance,
        },
        {
          name: 'fUSD V3',
          symbol: 'fUSD_V3',
          priceUSD: fusdV3Balance,
          balance: fusdV2?.data?.masset?.totalSupply?.simple,
          totalLiquidityUSD: parseFloat(fusdV3?.data?.masset?.totalSupply?.simple) * fusdV3Balance,
        },
      ])
    } catch (e) {
      return 0
    }
  }, [])

  useEffect(() => {
    fusd()
  }, [fusd])
  return historical
}
