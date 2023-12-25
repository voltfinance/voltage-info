<<<<<<< Updated upstream
import { getBlocksFromDays } from './helpers'
import { useFuseDollarHistorical } from './useFuseDollarHistorical'
import { useLiquidStakingDaily, useLiquidStakingHistorical } from './useLiquidStakingHistorical'
import { usePegswapHistorical } from './usePegswapHistorical'
import { useStableSwapHistorical } from './useStableSwapHistorical'
import { useVoltStakingDaily, useVoltStakingHistorical } from './useVoltStakingHistorical'
import { useVoltageExchangeHistorical } from './useVoltageExchangeHistorical'
import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { orderBy } from 'lodash'
=======
import { flattenDeep, groupBy, isEmpty, orderBy, sumBy } from 'lodash'
import { useEffect, useState } from 'react'
import { useLiquidStaking } from './useLiquidStakingHistorical'
import { usePegswap } from './usePegswapHistorical'
import { useVevolt, useVoltStaking } from './useVoltStakingHistorical'
import { useVoltageExchange } from './useVoltageExchangeHistorical'
import moment from 'moment'
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
  const pegswap = usePegswapHistorical(blocks)
  const liquidStaking = useLiquidStakingHistorical(blocks)
  const fusd = useFuseDollarHistorical(blocks)
  const volt = useVoltStakingHistorical(blocks)
  const uniswapFactory = useVoltageExchangeHistorical(blocks)
  const stableswap = useStableSwapHistorical(blocks)

  const getBlocks = useCallback(async () => {
    const bd = await getBlocksFromDays(numberOfDays)
    setBD(bd)
    setBlocks(bd.map(({ number }) => parseInt(number)))
  }, [])
=======
>>>>>>> Stashed changes

  const pegswap = usePegswap(360)
  const veVOLT = useVevolt(360)
  const liquidStaking = useLiquidStaking(360)
  const voltage = useVoltageExchange(360)
  const volt = useVoltStaking(360)

  useEffect(() => {
    if (
<<<<<<< Updated upstream
      !isEmpty(pegswap) &&
      !isEmpty(liquidStaking) &&
      !isEmpty(volt) &&
      !isEmpty(stableswap) &&
      !isEmpty(fusd) &&
      !isEmpty(uniswapFactory)
    ) {
      const results = orderBy(
        Array.from(Array(numberOfDays).keys()).map((day) => {
          const total =
            pegswap[day] + liquidStaking[day] + volt[day] + stableswap[day] + fusd[day] + uniswapFactory[day]

          return {
            date: parseInt(bd[day].timestamp),
            fractions: {
              pegswap: ((pegswap[day] / total) * 100).toFixed(1),
              liquidStaking: ((liquidStaking[day] / total) * 100).toFixed(1),
              voltStaking: ((volt[day] / total) * 100).toFixed(1),
              stableswap: ((stableswap[day] / total) * 100).toFixed(1),
              fuseDollar: ((fusd[day] / total) * 100).toFixed(1),
              voltageExchange: ((uniswapFactory[day] / total) * 100).toFixed(1),
            },

            liquidity: total,
=======
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
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
  }, [pegswap, liquidStaking, volt, stableswap, fusd, uniswapFactory])
  return historicalTVL
}
export const useTopStaking = () => {
  const dailyVolt = useVoltStakingDaily()
  const dailyFuse = useLiquidStakingDaily()
  const [data, setData] = useState([])
  useEffect(() => {
    if (dailyVolt?.length !== 0 && dailyFuse?.length !== 0) {
      setData([...dailyVolt, ...dailyFuse])
    }
  }, [dailyVolt, dailyFuse])
  return data
}
=======
  }, [voltage, pegswap, veVOLT, liquidStaking, volt])

  return historicalTVL
}
>>>>>>> Stashed changes
