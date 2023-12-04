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

  const getBlocks = useCallback(async () => {
    const bd = await getBlocksFromDays(numberOfDays)
    setBD(bd)
    setBlocks(bd.map(({ number }) => parseInt(number)))
  }, [])

  useEffect(() => {
    getBlocks()
  }, [])

  // Example usage
  const pegswap_day = 50 // replace with actual value of pegswap[day]
  const liquidStaking_day = 100 // replace with actual value of liquidStaking[day]
  const volt_day = 150 // replace with actual value of volt[day]
  const stableswap_day = 200 // replace with actual value of stableswap[day]
  const fusd_day = 250 // replace with actual value of fusd[day]
  const uniswapFactory_day = 300 // replace with actual value of uniswapFactory[day]

  const total = pegswap_day + liquidStaking_day + volt_day + stableswap_day + fusd_day + uniswapFactory_day

  useEffect(() => {
    if (
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
          }
        }),
        'date'
      )
      setHistoricalTVL(results)
    }
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
