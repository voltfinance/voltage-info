import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'
import { pegswapClient } from '../../apollo/client'

import { isV2 } from '../../utils'

const query = gql`
  query($from: Int!, $first: Int!) {
    tokens {
      name
      id
      symbol
      dayData(orderBy: date, first: $first, orderDirection: desc, where: { date_gte: $from }) {
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

  const pegswap = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data, loading } = await pegswapClient.query({
        query,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })

      const latest = await pegswapClient.query({
        query,
        variables: {
          from: parseInt((now.clone().subtract(360, 'day').unix() / 86400).toFixed(0)),
          first: 1,
        },
      })

      if (!loading) {
        const results = data?.tokens.map(({ id, name, dayData, ...props }) => {
          if (dayData?.length === 0) {
            const found = latest?.data?.tokens.find((item) => item?.id === id)
            return {
              name: isV2(id) ? `${name} V2` : name,
              id,
              totalLiquidityUSD: found?.dayData[0]?.balanceUSD,
              priceUSD: found?.dayData[0]?.priceUSD,
              volumeUSD: 0,
              timestamp: now,
              date: now.format('YYYY-MM-DD'),
              ...props,
            }
          }
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
