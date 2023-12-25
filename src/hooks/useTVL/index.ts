import { flattenDeep, groupBy, isEmpty, orderBy, sumBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useLiquidStaking } from './useLiquidStakingHistorical'
import { usePegswap } from './usePegswapHistorical'
import { useVevolt, useVoltStaking } from './useVoltStakingHistorical'
import { useVoltageExchange } from './useVoltageExchangeHistorical'
import moment from 'moment'

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
  const volt = useVoltStaking(numberOfDays)

  useEffect(() => {
    if (
      !isEmpty(flattenDeep(pegswap)) &&
      !isEmpty(flattenDeep(voltage)) &&
      !isEmpty(veVOLT) &&
      !isEmpty(liquidStaking)
    ) {
      const gbd = groupBy(
        [...flattenDeep(pegswap), ...flattenDeep(voltage), ...veVOLT, ...liquidStaking, ...volt],
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
  }, [voltage, pegswap, veVOLT, liquidStaking, volt])

  return historicalTVL
}

export const useTokenTVL = (numberOfDays = 360, address = '0x5622f6dc93e08a8b717b149677930c38d5d50682') => {
  const [historicalTVL, setHistoricalTVL] = useState([])

  const pegswap = usePegswap(numberOfDays)
  const veVOLT = useVevolt(numberOfDays)
  const liquidStaking = useLiquidStaking(numberOfDays)
  const voltage = useVoltageExchange(numberOfDays)
  const volt = useVoltStaking(numberOfDays)

  useEffect(() => {
    if (
      !isEmpty(flattenDeep(pegswap)) &&
      !isEmpty(flattenDeep(voltage)) &&
      !isEmpty(veVOLT) &&
      !isEmpty(liquidStaking)
    ) {
      const found = [...flattenDeep(pegswap), ...flattenDeep(voltage), ...veVOLT, ...liquidStaking, ...volt].filter(
        ({ id }) => id.toLowerCase() === address.toLowerCase()
      )
      if (found) {
        const gbd = orderBy(found, 'date', ['asc', 'desc']) as any
        const withPercentageChange = gbd.map(({ totalLiquidityUSD, volumeUSD, date, priceUSD }, index) => {
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
        console.log(withPercentageChange, 'withPercentageChange')
        setHistoricalTVL(withPercentageChange)
      } else {
        setHistoricalTVL([])
      }

      // const sbd = Object.keys(gbd).map((key: any) => {
      //   return {
      //     [key]: orderBy(gbd[key], 'date', ['asc', 'desc']),
      //   }
      // })
      // console.log(sbd, 'sbd')
    }
  }, [voltage, pegswap, veVOLT, liquidStaking, volt])

  return historicalTVL
}
