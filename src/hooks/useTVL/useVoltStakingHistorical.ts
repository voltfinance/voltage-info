import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { vevoltStakingClient, voltStakingClient } from '../../apollo/client'

const X_VOLT = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
const VEVOLT_ADDRESS = '0xb0a05314bd77808269e2e1e3d280bff57ba85672'

const voltBarQuery = gql`
  query($from: Int!, $first: Int!) {
    voltBalanceHistories(where: { date_gte: $from }, first: $first) {
      balance
      balanceUSD
      timestamp
      volume
      volumeUSD
      priceUSD
      date
    }
  }
`

const veVOLTQuery = gql`
  query($from: Int!, $first: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: $first, where: { timestamp_gte: $from }) {
      timestamp
      balanceUSD
      volumeUSD
      priceUSD
    }
  }
`

export const useVevolt = (numberOfDays) => {
  const [data, setData] = useState([])

  const veVoltStaking = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await vevoltStakingClient.query({
        query: veVOLTQuery,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })
      setData(
        data?.dayDatas?.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
          return {
            id: VEVOLT_ADDRESS?.toLowerCase(),
            name: 'veVOLT',
            symbol: 'veVOLT',
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: timestamp,
            date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [])

  useEffect(() => {
    veVoltStaking()
  }, [veVoltStaking])

  return data
}

export const useVoltStaking = (numberOfDays) => {
  const [data, setData] = useState([])
  const voltStaking = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await voltStakingClient.query({
        query: voltBarQuery,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })
      setData(
        data?.voltBalanceHistories?.map(({ timestamp, priceUSD, volumeUSD, balanceUSD }) => {
          return {
            id: X_VOLT?.toLowerCase(),
            name: 'xVOLT',
            symbol: 'xVOLT',
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: parseFloat(timestamp),
            date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      console.log(e, 'error')

      return 0
    }
  }, [])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return data
}
