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

export const useTVL = () => {
  const [historicalTVL, setHistoricalTVL] = useState([])

  const pegswap = usePegswap(360)
  const veVOLT = useVevolt(360)
  const liquidStaking = useLiquidStaking(360)
  const voltage = useVoltageExchange(360)
  const volt = useVoltStaking(360)

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
