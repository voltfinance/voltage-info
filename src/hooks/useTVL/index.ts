import { getBlocksFromDays } from './helpers'
import { useFuseDollarHistorical } from './useFuseDollarHistorical'
import { useLiquidStakingDaily, useLiquidStakingHistorical } from './useLiquidStakingHistorical'
import { usePegswapHistorical } from './usePegswapHistorical'
import { useStableSwapHistorical } from './useStableSwapHistorical'
import { useVeVoltStakingDaily, useVoltStakingDaily, useVoltStakingHistorical } from './useVoltStakingHistorical'
import { useVoltageExchangeHistorical } from './useVoltageExchangeHistorical'
import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { orderBy } from 'lodash'

function calculatePercentageChange(oldValue, newValue) {
  if (oldValue === 0) {
    // Handle division by zero
    console.error('Old value cannot be zero for percentage calculation.')
    return null
  }
  return ((newValue - oldValue) / oldValue) * 100
}

export const useTVL = (numberOfDays = 7) => {
  const [blocks, setBlocks] = useState([])
  const [bd, setBD] = useState([])

  const [historicalTVL, setHistoricalTVL] = useState([])
  const pegswap = usePegswapHistorical(blocks)
  const liquidStaking = useLiquidStakingHistorical(blocks)
  const fusd = useFuseDollarHistorical(blocks)
  const volt = useVoltStakingHistorical(blocks)
  const uniswapFactory = useVoltageExchangeHistorical(blocks)
  const stableswap = useStableSwapHistorical(blocks)
  const vevolt = useVoltStakingHistorical(blocks)
  const getBlocks = useCallback(async () => {
    const bd = await getBlocksFromDays(numberOfDays)
    setBD(bd)
    setBlocks(bd.map(({ number }) => parseInt(number)))
  }, [])

  useEffect(() => {
    getBlocks()
  }, [])

  useEffect(() => {
    if (
      !isEmpty(pegswap) &&
      !isEmpty(liquidStaking) &&
      !isEmpty(volt) &&
      !isEmpty(stableswap) &&
      !isEmpty(fusd) &&
      !isEmpty(uniswapFactory) &&
      !isEmpty(vevolt)
    ) {
      const results = orderBy(
        Array.from(Array(numberOfDays).keys()).map((day) => {
          const total =
            pegswap[day] +
            liquidStaking[day] +
            volt[day] +
            stableswap[day] +
            fusd[day] +
            uniswapFactory[day] +
            vevolt[day]

          return {
            date: parseInt(bd[day].timestamp),
            fractions: {
              pegswap: ((pegswap[day] / total) * 100).toFixed(1),
              liquidStaking: ((liquidStaking[day] / total) * 100).toFixed(1),
              voltStaking: ((volt[day] / total) * 100).toFixed(1),
              stableswap: ((stableswap[day] / total) * 100).toFixed(1),
              fuseDollar: ((fusd[day] / total) * 100).toFixed(1),
              voltageExchange: ((uniswapFactory[day] / total) * 100).toFixed(1),
              vevolt: ((vevolt[day] / total) * 100).toFixed(1),
            },

            liquidity: total,
          }
        }),
        'date'
      )
      const withPercentageChange = results.map((res) => {
        return {
          ...res,
          percentageChange: calculatePercentageChange(results[0]?.liquidity, res?.liquidity),
        }
      })
      setHistoricalTVL(withPercentageChange)
    }
  }, [pegswap, liquidStaking, volt, stableswap, fusd, uniswapFactory, vevolt])
  return historicalTVL
}
export const useTopStaking = () => {
  const dailyVolt = useVoltStakingDaily()
  const veVOLT = useVeVoltStakingDaily()

  const dailyFuse = useLiquidStakingDaily()
  console.log({
    dailyVolt,
    veVOLT,
    dailyFuse,
  })
  const [data, setData] = useState([])
  useEffect(() => {
    if (dailyVolt?.length !== 0 && dailyFuse?.length !== 0 && veVOLT?.length !== 0) {
      setData([...dailyVolt, ...dailyFuse, ...veVOLT])
    }
  }, [dailyVolt, dailyFuse])
  return data
}
