import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { flattenDeep } from 'lodash'
import { getETHPrice } from './helpers'
const v3Client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/exchange-v3',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query v3Pairs($first: Int!, $from: Int!) {
    pools {
      id
      token0Price
      token0 {
        name
        symbol
        id
      }
      token1 {
        name
        symbol
        id
      }
      poolDayData(orderBy: date, orderDirection: desc, first: $first, where: { date_gte: $from }) {
        id
        volumeUSD
        date
        token0Price
        tvlUSD
      }
    }
  }
`

export const useV3Pairs = (numberOfDays) => {
  const [data, setData] = useState([])
  const isV2 = (id, symbol) => {
    const USDT_V2 = '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd'
    const USDC_V2 = '0x28c3d1cd466ba22f6cae51b1a4692a831696391a'
    if (USDT_V2?.toLowerCase() === id.toLowerCase() || USDC_V2?.toLowerCase() === id.toLowerCase()) {
      return symbol + ' V2'
    }
    return symbol
  }
  const v3Pairs = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await v3Client.query({
        query: query,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          first: numberOfDays,
        },
      })
      const WHITELISTED = ['0xd6377bddf5cdb2c020a2607cd49faa53fa42f268', '0xde030a85002362ea06c375f939e4f124a004802b']

      const results = data?.pools
        ?.filter(({ id }) => WHITELISTED.includes(id))
        ?.map(({ id, token0, token1, poolDayData, ...props }) => {
          if (poolDayData.length === 0) {
            return {
              name: isV2(token0?.id, token0?.symbol) + '-' + isV2(token1?.id, token1?.symbol),
              id,
              symbol: token0?.symbol + '-' + token1?.symbol,
              totalLiquidityUSD: 0,
              priceUSD: 0,
              volumeUSD: 0,
              timestamp: now.format('YYYY-MM-DD'),
              token0,
              token1,
              date: now.format('YYYY-MM-DD'),
              ...props,
            }
          }
          return poolDayData.map(({ tvlUSD, date, volumeUSD }) => {
            return {
              name: token0?.symbol + '-' + token1?.symbol,
              id,
              symbol: token0?.symbol + '-' + token1?.symbol,
              totalLiquidityUSD: parseFloat(tvlUSD) || 0,
              priceUSD: 0,
              volumeUSD: parseFloat(volumeUSD) || 0,
              timestamp: parseFloat(date),
              token0,
              token1,
              date: moment(date * 1000).format('YYYY-MM-DD'),
              ...props,
            }
          })
        })
      console.log(results, 'datav3')

      setData(flattenDeep(results))
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    v3Pairs()
  }, [v3Pairs])
  return data
}
