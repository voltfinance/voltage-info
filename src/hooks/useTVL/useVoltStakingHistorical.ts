import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { useCallback, useEffect, useState } from 'react'
import { getBalance, getBalanceAtBlock } from './helpers'

const X_VOLT = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
const VOLT = '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4'
const VEVOLT_ADDRESS = '0xb0a05314bd77808269e2e1e3d280bff57ba85672'

export const voltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/volt-bar',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

export const vevoltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/vevolt-subgraph',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query($id: String!, $block: Int!) {
    bar(id: $id, block: { number: $block }) {
      voltStaked
    }
  }
`

const veVOLTQueryAtBlock = gql`
  query($id: String!, $block: Int!) {
    veVolt(id: $id, block: { number: $block }) {
      totalStaked
      id
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
          const { data } = await vevoltStakingClient.query({
            query: veVOLTQueryAtBlock,
            variables: {
              id: VEVOLT_ADDRESS.toLowerCase(),
              block,
            },
          })
          const balance = await getBalanceAtBlock(VOLT, block)
          return (parseFloat(data?.veVolt?.totalStaked) / 1e18) * balance
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

export const useVeVoltStakingHistorical = (blocks = []) => {
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

const veVOLTQuery = gql`
  query($id: String!) {
    veVolt(id: $id) {
      totalStaked
      id
    }
  }
`

export const useVeVoltStakingDaily = () => {
  const [historical, setHistorical] = useState([])

  const veVoltStaking = useCallback(async () => {
    try {
      const { data } = await vevoltStakingClient.query({
        query: veVOLTQuery,
        variables: {
          id: VEVOLT_ADDRESS.toLowerCase(),
        },
      })
      const balance = await getBalance(VOLT)

      setHistorical([
        {
          name: 'veVOLT',
          symbol: 'veVOLT',
          id: VEVOLT_ADDRESS?.toLowerCase(),
          balance: parseFloat(data?.veVolt?.totalStaked) / 1e18,
          priceUSD: balance,
          totalLiquidityUSD: (parseFloat(data?.veVolt?.totalStaked) / 1e18) * balance,
        },
      ])
    } catch (e) {
      setHistorical([
        {
          name: 'veVOLT',
          symbol: 'veVOLT',
          id: VEVOLT_ADDRESS?.toLowerCase(),
          balance: 0,
          priceUSD: 0,
          totalLiquidityUSD: 0,
        },
      ])
      return 0
    }
  }, [])

  useEffect(() => {
    veVoltStaking()
  }, [veVoltStaking])

  return historical
}

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
          id: X_VOLT?.toLowerCase(),
          balance: data?.bar?.voltStaked,
          priceUSD: balance,
          totalLiquidityUSD: parseFloat(data?.bar?.voltStaked) * balance,
        },
      ])
    } catch (e) {
      setHistorical([
        {
          name: 'xVOLT',
          symbol: 'xVOLT',
          id: X_VOLT?.toLowerCase(),
          balance: 0,
          priceUSD: 0,
          totalLiquidityUSD: 0,
        },
      ])
      return 0
    }
  }, [])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return historical
}
