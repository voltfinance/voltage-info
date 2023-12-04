import { useCallback, useEffect, useState } from 'react'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import gql from 'graphql-tag'
import { HttpLink } from 'apollo-link-http'
import { getETHPrice } from './helpers'

const voltageExchangeClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query($block: Int!, $id: String!) {
    uniswapFactory(id: $id, block: { number: $block }) {
      totalLiquidityUSD
      totalVolumeUSD
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
const UNISWAP_FACTORY = '0x1998e4b0f1f922367d8ec20600ea2b86df55f34e'

export const useVoltageExchangeHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltageExchange = useCallback(async () => {
    const startTime = performance.now()

    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      await blocks.map(async (block) => {
        try {
          const { data } = await voltageExchangeClient.query({
            query,
            variables: {
              id: UNISWAP_FACTORY.toLowerCase(),
              block,
            },
          })
          return parseFloat(data?.uniswapFactory?.totalLiquidityUSD)
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
    const endTime = performance.now()
    console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
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
    console.log(ethPrice, 'ethPrice')
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
