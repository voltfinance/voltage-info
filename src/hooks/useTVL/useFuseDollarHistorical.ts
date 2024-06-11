import gql from 'graphql-tag'
import { flattenDeep } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import moment from 'moment'
import { fusdV3Client, fusdV2Client } from '../../apollo/client'

const FUSD_V2 = '0xd0ce1b4a349c35e61af02f5971e71ac502441e49'
const FUSD_V3 = '0xce86a1cf3cff48139598de6bf9b1df2e0f79f86f'

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

export const useFuseDollar = (numberOfDays = 30) => {
  const [data, setData] = useState([])
  const now = moment().utc()

  const fusd = useCallback(async () => {
    try {
      const { data } = await fusdV3Client.query({
        query: query,
        variables: {
          from: parseInt((now.clone().subtract(360, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })
      const fusdV2 = await fusdV2Client.query({
        query: query,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
          first: numberOfDays,
        },
      })

      setData(
        flattenDeep([
          ...fusdV2?.data?.dayDatas?.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
            return {
              id: FUSD_V2?.toLowerCase(),
              name: 'fUSD V2',
              symbol: 'fUSD V2',
              totalLiquidityUSD: parseFloat(balanceUSD) || 0,
              priceUSD: parseFloat(priceUSD) || 0,
              volumeUSD: parseFloat(volumeUSD) || 0,
              timestamp: parseFloat(timestamp),
              date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
            }
          }),
          ...data?.dayDatas?.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
            return {
              id: FUSD_V3?.toLowerCase(),
              name: 'fUSD V3',
              symbol: 'fUSD V3',
              totalLiquidityUSD: parseFloat(balanceUSD) || 0,
              priceUSD: parseFloat(priceUSD) || 0,
              volumeUSD: parseFloat(volumeUSD) || 0,
              timestamp: parseFloat(timestamp),
              date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
            }
          }),
        ])
      )
    } catch (e) {
      return 0
    }
  }, [])

  useEffect(() => {
    fusd()
  }, [fusd])
  return data
}
