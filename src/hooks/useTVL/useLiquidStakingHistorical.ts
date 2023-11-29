import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'
import { getBalanceAtBlock } from './helpers'
import { HttpLink } from '@apollo/client'

const WFUSE = '0x0be9e53fd7edac9f859882afdda116645287c629'

const LIQUID_STAKING_ADDRESS = '0xa3dc222ec847aac61fb6910496295bf344ea46be'

const liquidStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/fuse-liquid-staking',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
})

const lsQuery = gql`
  query($id: String!, $block: Int!) {
    liquidStaking(id: $id, block: { number: $block }) {
      totalStaked
      id
    }
  }
`

export const useLiquidStakingHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const liquidStaking = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      blocks.map(async (block) => {
        try {
          const { data } = await liquidStakingClient.query({
            query: lsQuery,
            variables: {
              id: LIQUID_STAKING_ADDRESS.toLowerCase(),
              block,
            },
          })
          const balance = await getBalanceAtBlock(WFUSE, block)
          return (parseFloat(data?.liquidStaking?.totalStaked) / 1e18) * balance
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])
  useEffect(() => {
    liquidStaking()
  }, [liquidStaking])
  return historical
}
