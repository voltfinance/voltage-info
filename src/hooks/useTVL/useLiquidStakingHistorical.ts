import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { liquidStakingClient } from '../../apollo/client'

const LIQUID_STAKING_ADDRESS = '0xa3dc222ec847aac61fb6910496295bf344ea46be'

const query = gql`
  query($from: Int!, $first: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: $first, where: { timestamp_gte: $from }) {
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
      console.log(e, 'error')

      return 0
    }
  }, [])
  useEffect(() => {
    liquidStaking()
  }, [liquidStaking])
  return data
}
