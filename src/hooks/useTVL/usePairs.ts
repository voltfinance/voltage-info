import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { isV2 } from '../../utils'
import { client } from '../../apollo/client'

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
  const mapV2 = (id, symbol) => {
    if (isV2(id)) {
      return symbol + ' V2'
    }
    return symbol
  }
  const fetchPairs = useCallback(async () => {
    setData([])
    try {
      const { data } = await client.query({
        query: queryWithPair,
        variables: {
          from: now.clone().subtract(numberOfDays, 'day').unix(),
          pairAddress,
        },
      })

      setData(
        data?.pairDayDatas?.map(({ token0, reserveUSD, derivedETH, pairAddress, date, dailyVolumeUSD, token1 }) => {
          return {
            name: mapV2(token0?.id, token0?.symbol) + '-' + mapV2(token1?.id, token1?.symbol),
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
      const { data } = await client.query({
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
