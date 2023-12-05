import { useCallback, useEffect, useState } from 'react'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import { getETHPrice } from './helpers'
import { sumBy } from 'lodash'
const voltageExchangeClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const queryBlock = gql`
  query($block: Int!) {
    tokens(where: { derivedETH_gt: 0 }) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
    }
  }
`

const dayData = gql`
  {
    tokens(where: { derivedETH_gt: 0 }) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
    }
  }
`

export const useVoltageExchangeHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltageExchange = useCallback(async () => {
    const ethPrice = await getETHPrice()

    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      await blocks.map(async (block) => {
        try {
          const { data } = await voltageExchangeClient.query({
            query: queryBlock,
            variables: {
              block,
            },
          })
          const results = data?.tokens?.map(({ name, symbol, id, totalLiquidity, derivedETH }) => {
            return {
              name,
              symbol,
              id,
              balance: totalLiquidity,
              totalLiquidityUSD: parseFloat(totalLiquidity) * (parseFloat(derivedETH) * ethPrice),
              priceUSD: parseFloat(derivedETH) * ethPrice,
            }
          })
          return sumBy(results, 'totalLiquidityUSD')
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])
  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])
  return historical
}

export const useVoltageDaily = () => {
  const [data, setData] = useState([])
  const voltageExchange = useCallback(async () => {
    const ethPrice = await getETHPrice()
    try {
      const { data } = await voltageExchangeClient.query({
        query: dayData,
      })
      const results = data?.tokens?.map(({ name, symbol, id, totalLiquidity, derivedETH }) => {
        return {
          name,
          symbol,
          id,
          balance: totalLiquidity,
          totalLiquidityUSD: parseFloat(totalLiquidity) * (parseFloat(derivedETH) * ethPrice),
          priceUSD: parseFloat(derivedETH) * ethPrice,
        }
      })
      console.log(results, 'results')
      setData(results)
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])
  return data
}
