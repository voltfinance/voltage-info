import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

const LIQUID_STAKING_ADDRESS = '0xa3dc222ec847aac61fb6910496295bf344ea46be'

const liquidStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/fuse-liquid-staking',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query($from: Int!, $first: Int!) {
    dayDatas(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
      timestamp
      balance
      volume
      balanceUSD
      volumeUSD
      priceUSD
    }
  }
`

export const useLiquidStaking = (numberOfDays) => {
  const [data, setData] = useState([])
  const liquidStaking = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await liquidStakingClient.query({
        query: query,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })
      setData(
        data?.dayDatas?.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
          return {
            id: LIQUID_STAKING_ADDRESS?.toLowerCase(),
            name: 'sFUSE',
            symbol: 'sFUSE',
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: timestamp,
            date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    liquidStaking()
  }, [liquidStaking])
  return data
}
