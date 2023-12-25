import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
export const pegswapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/pegswap',
  }),
  cache: new InMemoryCache(),
})

const query = gql`
  query($from: Int!) {
    tokens {
      name
      id
      symbol
      dayData(orderBy: date, first: 1000, orderDirection: desc, where: { date_gte: $from }) {
        volume
        balance
        balanceUSD
        volumeUSD
        priceUSD
        timestamp
        date
      }
    }
  }
`

export const usePegswap = (numberOfDays = 30) => {
  const [data, setData] = useState([])

  const isV2 = (id) => {
    const USDT_V2 = '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd'
    const USDC_V2 = '0x28c3d1cd466ba22f6cae51b1a4692a831696391a'
    return USDT_V2?.toLowerCase() === id.toLowerCase() || USDC_V2?.toLowerCase() === id.toLowerCase()
  }

  const pegswap = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data, loading } = await pegswapClient.query({
        query,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
        },
      })
      if (!loading) {
        const results = data?.tokens.map(({ id, name, dayData, ...props }) => {
          return dayData.map(({ balanceUSD, volumeUSD, priceUSD, timestamp }) => {
            return {
              name: isV2(id) ? `${name} V2` : name,
              id,
              totalLiquidityUSD: parseFloat(balanceUSD) || 0,
              priceUSD: parseFloat(priceUSD) || 0,
              volumeUSD: parseFloat(volumeUSD) || 0,
              timestamp: timestamp,
              date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),

              ...props,
            }
          })
        })

        setData(results)
      }
    } catch (e) {
      console.log(e, 'error')
      return 0
    }
  }, [])
  useEffect(() => {
    pegswap()
  }, [pegswap])
  return data
}
