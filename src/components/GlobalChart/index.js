import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { timeframeOptions } from '../../constants'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import { useMedia } from 'react-use'
import DropdownSelect from '../DropdownSelect'
import TradingViewChartArea from '../TradingviewChart/area'
import { formattedNum, getTimeframe } from '../../utils'
import { useFormattedDatas } from '../../hooks/useFormattedDatas'

export const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
  BAR: 'Bar',
  TREASURY: 'Treasury',
  REVENUE: 'Revenue',
}

// const VOLUME_WINDOW = {
//   WEEKLY: 'WEEKLY',
//   DAYS: 'DAYS',
// }
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function GlobalChart({ view }) {
  // chart options
  const [chartView, setChartView] = useState(view)

  const timeWindow = timeframeOptions.SIX_MONTHS

  const [dexDailyData] = useGlobalChartData()
  const {
    volumeChangeUSD,
    liquidityChangeUSD,
    totalProtocolLiquidityUSD,
    stableswapData,
    fusdData,
    totalVolumeUSD,
    xvoltData,
  } = useGlobalData()
  const allRatios = xvoltData?.histories
  const stablesTvl = useFormattedDatas(
    [fusdData.massetDayDatas, Object.values(stableswapData.histories)[0], Object.values(stableswapData.histories)[1]],
    ['totalSupply', 'supplyFormatted', 'supplyFormatted'],
    getTimeframe(timeWindow),
    false,
    true
  )
  console.log(stablesTvl)

  const barChange = useMemo(() => {
    if (!allRatios || !allRatios.length > 6) return
    return (parseFloat(allRatios[allRatios.length - 1].ratio) - parseFloat(allRatios[allRatios.length - 7].ratio)) * 100
  }, [allRatios])

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow)

  const below800 = useMedia('(max-width: 800px)')

  // update the width on a window resize
  const ref = useRef()
  const isClient = typeof window === 'object'
  const [width, setWidth] = useState(ref?.current?.container?.clientWidth)
  useEffect(() => {
    if (!isClient) {
      return false
    }
    function handleResize() {
      setWidth(ref?.current?.container?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient, width]) // Empty array ensures that effect is only run on mount and unmount

  return dexDailyData ? (
    <>
      {below800 && (
        <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
      )}
      {dexDailyData && stablesTvl && xvoltData && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChartArea
            datas={[dexDailyData, xvoltData.histories, stablesTvl.flat()]}
            base={totalProtocolLiquidityUSD}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
              {
                topColor: '#ff8c00',
                bottomColor: '#8B4000',
                lineColor: '#ff8c00',
                lineWidth: 3,
              },
              {
                topColor: '#296d98',
                bottomColor: '#3792cb',
                lineColor: '#296d98',
                lineWidth: 3,
              },
            ]}
            baseChange={liquidityChangeUSD}
            title="Total Value Locked"
            fields={['totalLiquidityUSD', 'totalStakedUSD', 'value']}
            width={width}
            startTime={utcStartTime}
          />
        </ResponsiveContainer>
      )}
      {dexDailyData && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[
              dexDailyData,
              fusdData.massetDayDatas,
              Object.values(stableswapData.histories)[0],
              Object.values(stableswapData.histories)[1],
            ]}
            baseChange={volumeChangeUSD}
            base={totalVolumeUSD}
            title={'Total Volume'}
            fields={['dailyVolumeUSD', 'dailyVolume', 'volume', 'volume']}
            width={width}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
            ]}
            useWeekly={false}
            accumulate={true}
            sumUp={true}
            startTime={utcStartTime}
          />
        </ResponsiveContainer>
      )}
      {allRatios && chartView === CHART_VIEW.BAR && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[allRatios]}
            base={formattedNum(allRatios?.[allRatios.length - 1]?.ratio)}
            baseChange={barChange}
            title={'xVOLT/VOLT ratio change'}
            fields={['ratio']}
            width={width}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
            ]}
            useWeekly={false}
            accumulate={false}
            formatter={(num, _) => formattedNum(num)}
            startTime={utcStartTime}
          />
        </ResponsiveContainer>
      )}
      {dexDailyData && chartView === CHART_VIEW.REVENUE && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[dexDailyData]}
            baseChange={volumeChangeUSD}
            title={'Protocol Revenue'}
            fields={['dailyVolumeUSD']}
            width={width}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
            ]}
            useWeekly={false}
            accumulate={true}
            formatter={(num, _) => formattedNum(num * 0.003, true)}
            startTime={utcStartTime}
          />
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}
