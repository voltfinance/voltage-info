import { flattenDeep, groupBy, isEmpty, orderBy, sumBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useLiquidStaking } from './useLiquidStakingHistorical'
import { usePegswap } from './usePegswapHistorical'
import { useVevolt, useVoltStaking } from './useVoltStakingHistorical'
import { useVoltageExchange } from './useVoltageExchangeHistorical'
import moment from 'moment'
import { useFuseDollar } from './useFuseDollarHistorical'

function calculatePercentageChange(oldValue, newValue) {
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

export const useTVL = (numberOfDays = 360) => {
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
      const gbd = groupBy(
        [...flattenDeep(voltage), ...flattenDeep(pegswap), ...liquidStaking, ...veVOLT, ...fusd],
        'date'
      ) as any
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

      const withPercentageChange = sbd.map(({ totalLiquidityUSD, volumeUSD, date }, index) => {
        return {
          date,
          totalLiquidityUSD,
          volumeUSD,
          percentLiquidityChange: calculatePercentageChange(
            sumBy(sbd, 'totalLiquidityUSD') / sbd.length,
            totalLiquidityUSD
          ),
          percentVolumeChange: calculatePercentageChange(sumBy(sbd, 'volumeUSD') / sbd.length, volumeUSD),
        }
      })
      setHistoricalTVL(withPercentageChange)
    }
  }, [voltage, pegswap, fusd, veVOLT, liquidStaking])

  return historicalTVL
}

export const useTokenTVL = (numberOfDays = 360, address = '0x5622f6dc93e08a8b717b149677930c38d5d50682') => {
  const [historicalTVL, setHistoricalTVL] = useState([])

  const pegswap = usePegswap(numberOfDays)
  const veVOLT = useVevolt(numberOfDays)
  const liquidStaking = useLiquidStaking(numberOfDays)
  const voltage = useVoltageExchange(numberOfDays)
  const volt = useVoltStaking(numberOfDays)
  const fusd = useFuseDollar(numberOfDays)

  useEffect(() => {
    if (
      !isEmpty(flattenDeep(pegswap)) &&
      !isEmpty(flattenDeep(voltage)) &&
      !isEmpty(veVOLT) &&
      !isEmpty(liquidStaking) &&
      !isEmpty(volt)
    ) {
      const found = [
        ...flattenDeep(voltage),
        ...flattenDeep(pegswap),
        ...liquidStaking,
        ...veVOLT,
        ...volt,
        ...fusd,
      ].filter(({ id }) => id.toLowerCase() === address.toLowerCase())
      if (found) {
        const gbd = orderBy(found, 'date', ['asc', 'desc']) as any
        const sbd = groupBy(gbd, 'date') as any
        const tbd = Object.keys(sbd).map((key) => {
          return {
            totalLiquidityUSD: sumBy(sbd[key], 'totalLiquidityUSD'),
            date: key,
            volumeUSD: sumBy(sbd[key], 'volumeUSD'),
            priceUSD: sumBy(sbd[key], 'priceUSD') / sbd[key].length,
          }
        })
        const withPercentageChange = tbd.map(({ totalLiquidityUSD, volumeUSD, date, priceUSD }, index) => {
          return {
            date,
            totalLiquidityUSD,
            volumeUSD,
            percentLiquidityChange: calculatePercentageChange(
              sumBy(gbd, 'totalLiquidityUSD') / gbd.length,
              totalLiquidityUSD
            ),
            percentVolumeChange: calculatePercentageChange(sumBy(gbd, 'volumeUSD') / gbd.length, volumeUSD),
            priceUSD,
            priceChangeUSD: calculatePercentageChange(sumBy(gbd, 'priceUSD') / gbd.length, priceUSD),
          }
        })
        setHistoricalTVL(withPercentageChange)
      } else {
        setHistoricalTVL([])
      }
    }
  }, [voltage, pegswap, veVOLT, liquidStaking, volt, fusd])

  return historicalTVL
}

export function getTimestamp(numberOfDays) {
  // Get the current timestamp in seconds (Solidity format)
  const currentTimestamp = Math.floor(new Date().getTime() / 1000)

  // Calculate the timestamp one day ago
  const oneDayAgoTimestamp = moment().subtract(numberOfDays, 'days').unix()

  return [currentTimestamp, oneDayAgoTimestamp]
}
