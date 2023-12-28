import { flattenDeep, groupBy, isEmpty, orderBy, sumBy, meanBy, slice } from 'lodash'
import { useEffect, useState } from 'react'
import { useLiquidStaking } from './useLiquidStakingHistorical'
import { usePegswap } from './usePegswapHistorical'
import { useVevolt, useVoltStaking } from './useVoltStakingHistorical'
import { useVoltageExchange } from './useVoltageExchangeHistorical'
import moment from 'moment'
import { useFuseDollar } from './useFuseDollarHistorical'

export function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    // Handle division by zero
    console.error('Old value cannot be zero for percentage calculation.')
    return null
  }
  return (((newValue - oldValue) / oldValue) * 100).toFixed(2)
}

export enum INTERVAL {
  WEEK = 7,
  MONTH = 30,
  YEAR = 360,
}

const mapPercentages = (arr) => {
  return arr.map(({ totalLiquidityUSD, volumeUSD, date }, index) => {
    return {
      date,
      totalLiquidityUSD,
      volumeUSD,
      percentLiquidityChange: calculatePercentageChange(
        sumBy(arr, 'totalLiquidityUSD') / arr.length,
        totalLiquidityUSD
      ),
      percentVolumeChange: calculatePercentageChange(sumBy(arr, 'volumeUSD') / arr.length, volumeUSD),
    }
  })
}

export const useTVL = (numberOfDays = 360, filterByAddress) => {
  const [historicalTVL, setHistoricalTVL] = useState([])

  const pegswap = usePegswap(numberOfDays)
  const veVOLT = useVevolt(numberOfDays)
  const liquidStaking = useLiquidStaking(numberOfDays)
  const voltage = useVoltageExchange(numberOfDays)
  // const volt = useVoltStaking(numberOfDays)
  const fusd = useFuseDollar(numberOfDays)
  useEffect(() => {
    if (
      !isEmpty(flattenDeep(pegswap)) &&
      !isEmpty(flattenDeep(voltage)) &&
      !isEmpty(fusd) &&
      !isEmpty(veVOLT) &&
      !isEmpty(liquidStaking)
    ) {
      const data = filterByAddress
        ? [...flattenDeep(voltage), ...flattenDeep(pegswap), ...liquidStaking, ...veVOLT, ...fusd].filter(
            ({ id }) => id.toLowerCase() === filterByAddress.toLowerCase()
          )
        : [...flattenDeep(voltage), ...flattenDeep(pegswap), ...liquidStaking, ...veVOLT, ...fusd]
      if (filterByAddress) {
        console.log(
          [...flattenDeep(voltage), ...flattenDeep(pegswap), ...liquidStaking, ...veVOLT, ...fusd].filter(
            ({ id }) => id?.toLowerCase() === filterByAddress?.toLowerCase()
          ),
          'test'
        )
      }
      const gbd = groupBy(data, 'date') as any

      const sbd = orderBy(
        Object.keys(gbd).map((key: any) => {
          return {
            date: key,
            totalLiquidityUSD: sumBy(gbd[key], 'totalLiquidityUSD'),
            volumeUSD: sumBy(gbd[key], 'volumeUSD'),
          }
        }),
        'date',
        ['asc', 'desc']
      )
      const groupedData = groupBy(sbd, ({ date }) => {
        return moment(date).year() + '-' + moment(date).month()
      })

      if (numberOfDays === 360) {
        const results = Object.keys(groupedData).map((key) => {
          return {
            date: groupedData[key][0].date,
            totalLiquidityUSD: meanBy(groupedData[key], 'totalLiquidityUSD'),
            volumeUSD: sumBy(groupedData[key], 'volumeUSD'),
          }
        })

        setHistoricalTVL(mapPercentages(results))
      }
      if (numberOfDays === 30) {
        const groupedByMonth = groupedData[Object.keys(groupedData)[Object.keys(groupedData).length - 1]]
        setHistoricalTVL(mapPercentages(groupedByMonth))
      }
      if (numberOfDays === 7) {
        setHistoricalTVL(mapPercentages(slice(sbd, -7)))
      }
    }
  }, [voltage, pegswap, fusd, veVOLT, liquidStaking, numberOfDays, filterByAddress])

  return historicalTVL
}

export function getTimestamp(numberOfDays) {
  // Get the current timestamp in seconds (Solidity format)
  const currentTimestamp = Math.floor(new Date().getTime() / 1000)

  // Calculate the timestamp one day ago
  const oneDayAgoTimestamp = moment().subtract(numberOfDays, 'days').unix()

  return [currentTimestamp, oneDayAgoTimestamp]
}
