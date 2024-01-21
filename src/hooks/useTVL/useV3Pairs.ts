import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { flattenDeep, isEmpty } from 'lodash'
import { usePair } from './usePairs'
import { mapHistorical } from '.'
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
        derivedETH
      }
      token1 {
        name
        symbol
        id
        derivedETH
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

export const useV3Pairs = (numberOfDays, filterByAddress) => {
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
    setData([])
    const now = moment().utc()

    try {
      const { data } = await v3Client.query({
        query: query,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          first: numberOfDays,
        },
      })

      const res = await v3Client.query({
        query: query,
        variables: {
          from: now.clone().subtract(30, 'day').unix(),
          first: 30,
        },
      })
      const WHITELISTED = ['0xd6377bddf5cdb2c020a2607cd49faa53fa42f268', '0xde030a85002362ea06c375f939e4f124a004802b']

      const results = data?.pools
        ?.filter(({ id }) => WHITELISTED.includes(id))
        ?.map(({ id, token0, token1, poolDayData, ...props }) => {
          const found = res.data?.pools.find((item) => item?.id == id)
          if (poolDayData.length === 0) {
            return {
              name: isV2(token0?.id, token0?.symbol) + '-' + isV2(token1?.id, token1?.symbol),
              id,
              symbol: token0?.symbol + '-' + token1?.symbol,
              totalLiquidityUSD: found ? parseFloat(found?.poolDayData[0]?.tvlUSD) : 0 || 0,
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

      setData(
        filterByAddress
          ? flattenDeep(results).filter(({ id }) => id.toLowerCase() === filterByAddress)
          : flattenDeep(results)
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [numberOfDays, filterByAddress])
  useEffect(() => {
    v3Pairs()
  }, [v3Pairs])
  return data
}

export const useAllPairChartData = (numberOfDays, filterByAddress) => {
  const [data, setData] = useState([])
  const v3Pairs = useV3Pairs(numberOfDays, filterByAddress)
  const v2Pairs = usePair(numberOfDays, filterByAddress)

  useEffect(() => {
    if (!isEmpty(v3Pairs)) {
      return setData(mapHistorical(v3Pairs, numberOfDays))
    }
    if (!isEmpty(v2Pairs)) {
      return setData(mapHistorical(v2Pairs, numberOfDays))
    }
    return setData([])
  }, [v2Pairs, v3Pairs, numberOfDays, filterByAddress])
  return data
}

export const useAllPairs = (numberOfDays, filterByAddress) => {
  const [data, setData] = useState([])
  const v3Pairs = useV3Pairs(numberOfDays, filterByAddress)
  const v2Pairs = usePair(numberOfDays, filterByAddress)

  useEffect(() => {
    if (!isEmpty(v3Pairs)) {
      return setData(v3Pairs)
    }
    if (!isEmpty(v2Pairs)) {
      return setData(v2Pairs)
    }
    return setData([])
  }, [v2Pairs, v3Pairs, numberOfDays, filterByAddress])
  return data
}
