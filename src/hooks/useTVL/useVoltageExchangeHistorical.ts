import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { getTimestamp } from '.'
import { isV2 } from '../../utils'

const voltageExchangeClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query($from: Int!, $first: Int!) {
    tokens(orderBy: txCount, orderDirection: desc) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
      tradeVolumeUSD
      tokenDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        dailyVolumeUSD
        totalLiquidityUSD
        date
        priceUSD
      }
    }
  }
`

export const useVoltageExchange = (numberOfDays) => {
  const [data, setData] = useState([])

  const voltageExchange = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await voltageExchangeClient.query({
        query: query,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          first: numberOfDays,
        },
      })

      const results = data?.tokens.map(({ id, name, tokenDayData, ...props }) => {
        return tokenDayData.map(({ totalLiquidityUSD, date, dailyVolumeUSD, priceUSD }) => {
          return {
            name: isV2(id)
              ? `${name === 'VoltToken' ? 'Volt Token' : name} V2`
              : name === 'VoltToken'
              ? 'Volt Token'
              : name,
            id,
            totalLiquidityUSD: parseFloat(totalLiquidityUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date),
            date: moment(date * 1000).format('YYYY-MM-DD'),
            ...props,
          }
        })
      })

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
