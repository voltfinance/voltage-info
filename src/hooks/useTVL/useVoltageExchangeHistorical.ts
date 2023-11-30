import { useCallback, useEffect, useState } from 'react'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import gql from 'graphql-tag'
import { HttpLink } from '@apollo/client'

const voltageExchangeClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
})

const query = gql`
  query($block: Int!, $id: String!) {
    uniswapFactory(id: $id, block: { number: $block }) {
      totalLiquidityUSD
      totalVolumeUSD
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
