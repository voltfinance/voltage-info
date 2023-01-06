import React, { useState, useMemo, useEffect, useRef } from 'react'
import { ResponsiveContainer } from 'recharts'
import { timeframeOptions } from '../../constants'
import { useBarAllRatios, useGlobalChartData, useGlobalData, useStableswapData } from '../../contexts/GlobalData'
import { useMedia } from 'react-use'
import DropdownSelect from '../DropdownSelect'
import TradingViewChartArea from '../TradingviewChart/area'
import { formattedNum, getTimeframe } from '../../utils'

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

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME
  // const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)

  // global historical data
  const [dexDailyData] = useGlobalChartData()
  const { volumeChangeUSD, liquidityChangeUSD, totalProtocolLiquidityUSD } = useGlobalData()
  const allRatios = useBarAllRatios()
  const stableswapData = useStableswapData()

  const barChange = useMemo(() => {
    if (!allRatios || !allRatios.length > 6) return
    return (parseFloat(allRatios[0].ratio) - parseFloat(allRatios[6].ratio)) * 100
  }, [allRatios])
  console.log({ stableswapData })

  // based on window, get starttim
  let utcStartTime = getTimeframe(timeWindow)

  const chartDataFiltered = useMemo(() => {
    let currentData = dexDailyData
    return (
      currentData &&
      Object.keys(currentData)
        ?.map((key) => {
          let item = currentData[key]
          if (item.date > utcStartTime) {
            return item
          } else {
            return
          }
        })
        .filter((item) => {
          return !!item
        })
    )
  }, [dexDailyData, utcStartTime])
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

  return chartDataFiltered ? (
    <>
      {below800 && (
        <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
      )}
      {chartDataFiltered && stableswapData && chartView === CHART_VIEW.LIQUIDITY && (
        <ResponsiveContainer aspect={60 / 28} ref={ref}>
          <TradingViewChartArea
            datas={[dexDailyData, ...Object.values(stableswapData.histories)]}
            base={totalProtocolLiquidityUSD}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
              {
                topColor: '#54c4b5',
                bottomColor: 'rgba(181, 230, 223, 0)',
                lineColor: '#54c4b5',
                lineWidth: 3,
              },
              {
                topColor: '#54c4b5',
                bottomColor: 'rgba(181, 230, 223, 0)',
                lineColor: '#54c4b5',
                lineWidth: 3,
              },
            ]}
            baseChange={liquidityChangeUSD}
            title="Liquidity"
            fields={['totalLiquidityUSD', 'supplyFormatted', 'supplyFormatted']}
            width={width}
            sumUp={true}
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[chartDataFiltered, chartDataFiltered]}
            baseChange={volumeChangeUSD}
            title={'Total Volume'}
            fields={['dailyVolumeUSD', 'dailyVolumeUSD']}
            width={width}
            configs={[
              {
                topColor: '#5ED73E',
                bottomColor: 'rgba(171, 219, 173, 0)',
                lineColor: '#5ED73E',
                lineWidth: 3,
              },
              {
                topColor: '#54c4b5',
                bottomColor: 'rgba(181, 230, 223, 0)',
                lineColor: '#54c4b5',
                lineWidth: 3,
              },
            ]}
            useWeekly={false}
            accumulate={true}
          />
        </ResponsiveContainer>
      )}
      {allRatios && chartView === CHART_VIEW.BAR && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[allRatios.reverse()]}
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
          />
        </ResponsiveContainer>
      )}
      {chartDataFiltered && chartView === CHART_VIEW.REVENUE && (
        <ResponsiveContainer aspect={60 / 28}>
          <TradingViewChartArea
            datas={[chartDataFiltered]}
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
          />
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}
