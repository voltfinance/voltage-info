import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'
import { getBalance, getBalanceAtBlock } from './helpers'

const X_VOLT = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
const VOLT = '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4'

export const voltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/volt-bar',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
})

const query = gql`
  query($id: String!, $block: Int!) {
    bar(id: $id, block: { number: $block }) {
      voltStaked
    }
  }
`

export const useVoltStakingHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltStaking = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      blocks.map(async (block) => {
        try {
          const { data } = await voltStakingClient.query({
            query,
            variables: {
              id: X_VOLT.toLowerCase(),
              block,
            },
          })
          const balance = await getBalanceAtBlock(VOLT, block)
          return parseFloat(data?.bar?.voltStaked) * balance
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return historical
}

const queryNoBlock = gql`
  query($id: String!) {
    bar(id: $id) {
      voltStaked
    }
  }
`
export const useVoltStakingDaily = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltStaking = useCallback(async () => {
    try {
      const { data } = await voltStakingClient.query({
        query: queryNoBlock,
        variables: {
          id: X_VOLT.toLowerCase(),
        },
      })
      const balance = await getBalance(VOLT)
      setHistorical([
        {
          name: 'xVOLT',
          symbol: 'xVOLT',
          balance: data?.bar?.voltStaked,
          priceUSD: balance,
          totalLiquidityUSD: parseFloat(data?.bar?.voltStaked) * balance,
        },
      ])
    } catch (e) {
      return 0
    }
  }, [])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return historical
}
