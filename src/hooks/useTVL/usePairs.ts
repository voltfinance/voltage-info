import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import { groupBy, isEmpty, meanBy, orderBy, slice, sumBy } from 'lodash'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { mapHistorical } from '.'
import { useV3Pairs } from './useV3Pairs'
import { useEthPrice } from '../../contexts/GlobalData'

const voltageExchange = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query pairs($from: Int!) {
    pairDayDatas(orderBy: date, orderDirection: desc, where: { date_gte: $from }) {
      id
      date
      dailyVolumeUSD
      reserveUSD
      pairAddress
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
    }
  }
`

const queryWithPair = gql`
  query pairs($from: Int!, $pairAddress: String!) {
    pairDayDatas(orderBy: date, orderDirection: desc, where: { date_gte: $from, pairAddress: $pairAddress }) {
      id
      date
      dailyVolumeUSD
      reserveUSD
      pairAddress
      token0 {
        id
        symbol
        name
        derivedETH
      }
      token1 {
        id
        symbol
        name
        derivedETH
      }
    }
  }
`

export const usePair = (numberOfDays, pairAddress) => {
  const [data, setData] = useState([])
  const now = moment().utc()
  const isV2 = (id, symbol) => {
    const USDT_V2 = '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd'
    const USDC_V2 = '0x28c3d1cd466ba22f6cae51b1a4692a831696391a'
    if (USDT_V2?.toLowerCase() === id.toLowerCase() || USDC_V2?.toLowerCase() === id.toLowerCase()) {
      return symbol + ' V2'
    }
    return symbol
  }
  const fetchPairs = useCallback(async () => {
    setData([])
    try {
      const { data } = await voltageExchange.query({
        query: queryWithPair,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          pairAddress,
        },
      })

      setData(
        data?.pairDayDatas?.map(({ token0, reserveUSD, derivedETH, pairAddress, date, dailyVolumeUSD, token1 }) => {
          return {
            name: isV2(token0?.id, token0?.symbol) + '-' + isV2(token1?.id, token1?.symbol),
            id: pairAddress,
            symbol: token0?.symbol + '-' + token1?.symbol,
            totalLiquidityUSD: parseFloat(reserveUSD),
            token0Price: 0,
            token1Price: 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date),
            token0,
            token1,
            fee: parseFloat(dailyVolumeUSD) * 0.03,
            date: moment(date * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [numberOfDays, pairAddress])
  useEffect(() => {
    fetchPairs()
  }, [fetchPairs])
  return data
}

export const useDailyPairs = () => {
  const [data, setData] = useState([])
  const now = moment().utc()

  const fetchPairs = useCallback(async () => {
    try {
      const { data } = await voltageExchange.query({
        query: query,
        variables: {
          from: now.clone().subtract(1, 'day').unix(),
        },
      })

      setData(
        data?.pairDayDatas?.map(({ token0, reserveUSD, pairAddress, date, dailyVolumeUSD, token1 }) => {
          return {
            name: token0?.symbol + '-' + token1?.symbol,
            id: pairAddress,
            symbol: token0?.symbol + '-' + token1?.symbol,
            totalLiquidityUSD: parseFloat(reserveUSD),
            token0Price: 0,
            token1Price: 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date),
            token0,
            token1,
            date: moment(date * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    fetchPairs()
  }, [fetchPairs])

  return data
}
