import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import { sum } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { getBalanceAtBlock } from './helpers'

export const pegswapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/pegswap',
  }),
  cache: new InMemoryCache(),
})

const pegwapQuery = gql`
  query($block: Int!) {
    tokens(block: { number: $block }) {
      balance
      name
      id
      symbol
    }
  }
`

export const usePegswapHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const pegswap = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])

    const prices = await Promise.all(
      blocks.map(async (block) => {
        try {
          const { data } = await pegswapClient.query({
            query: pegwapQuery,
            variables: {
              block,
            },
          })

          return sum(
            await Promise.all(
              data?.tokens.map(async ({ id, balance }) => {
                return (await getBalanceAtBlock(id, block)) * parseFloat(balance)
              })
            )
          )
        } catch (e) {
          console.log(e, 'error')
          return 0
        }
      })
    )

    setHistorical(prices)
  }, [blocks])
  useEffect(() => {
    pegswap()
  }, [pegswap])
  return historical
}
