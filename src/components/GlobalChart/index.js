import { slice } from 'lodash'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import { useMedia } from 'react-use'
import { Box, Flex, Text } from 'rebass'
import { Area, AreaChart, Bar, BarChart, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { timeframeOptions } from '../../constants'
import { useGlobalChartData, useGlobalData } from '../../contexts/GlobalData'
import { useTVL } from '../../hooks/useTVL'
import { formattedNum } from '../../utils'
import DropdownSelect from '../DropdownSelect'
const CHART_VIEW = {
  VOLUME: 'Volume',
  LIQUIDITY: 'Liquidity',
}

const VOLUME_WINDOW = {
  WEEKLY: 'WEEKLY',
  DAYS: 'DAYS',
}

const GlobalChart = ({ data, display }) => {
  // chart options
  const [chartView, setChartView] = useState(display === 'volume' ? CHART_VIEW.VOLUME : CHART_VIEW.LIQUIDITY)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = new Date(payload[0]?.payload?.date * 1000)
      return (
        <Box variant={'badge'}>
          {moment.months()[moment(d).month()] + ' ' + moment(d).date() + ',' + moment(d).year()}{' '}
          {/* {tokenInterval === TokenInterval.DAILY && moment(d).format('h a')} */}
        </Box>
      )
    }

    return null
  }
  const [activePayload, setActivePayload] = useState({
    chart: chartView,
    payload: null,
  })

  // time window and window size for chart
  const timeWindow = timeframeOptions.ALL_TIME
  const [volumeWindow, setVolumeWindow] = useState(VOLUME_WINDOW.DAYS)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']
  const [numberOfDays, setNumberOfDays] = useState(360)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (data.length !== 0) {
      setChartData(data)
    }
  }, [data])
  console.log(chartData, 'chartDatachartData')

  useEffect(() => {
    if (numberOfDays === 360) {
      return setChartData(data)
    }
    if (numberOfDays === 30) {
      return setChartData(slice(data, -30))
    }
    if (numberOfDays === 7) {
      return setChartData(slice(data, -7))
    }
  }, [numberOfDays])
  console.log(data, 'datadatadata')
  // global historical data
  const [dailyData, weeklyData] = useGlobalChartData()
  const {
    totalLiquidityUSD,
    oneDayVolumeUSD,
    volumeChangeUSD,
    liquidityChangeUSD,
    oneWeekVolume,
    weeklyVolumeChange,
  } = useGlobalData()

  // based on window, get starttim

  const below800 = useMedia('(max-width: 800px)')
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

  return chartData.length !== 0 ? (
    <>
      {below800 && (
        <DropdownSelect options={CHART_VIEW} active={chartView} setActive={setChartView} color={'#ff007a'} />
      )}
      <Flex justifyContent="space-between">
        <Flex mb={3} sx={{ gap: 2 }} flexDirection="column">
          <Text color={'white'} fontSize={16} fontWeight={500}>
            {chartView}
          </Text>
          <Flex alignItems="flex-end" sx={{ gap: 2 }}>
            <Text color="white" fontSize={24} fontWeight={600}>
              {chartView === CHART_VIEW.VOLUME
                ? formattedNum(activePayload?.volumeUSD || data[data.length - 1]?.volumeUSD, true)
                : formattedNum(activePayload?.totalLiquidityUSD || data[data.length - 1]?.totalLiquidityUSD, true)}
            </Text>
            <Text color="white" fontSize={16} fontWeight={600}>
              {chartView === CHART_VIEW.VOLUME
                ? activePayload?.percentVolumeChange || data[data.length - 1]?.percentVolumeChange
                : activePayload?.percentLiquidityChange || data[data.length - 1]?.percentLiquidityChange}
              %
            </Text>
          </Flex>
        </Flex>
        <Flex pb={3} sx={{ gap: 3 }}>
          <Box
            onClick={() => {
              setNumberOfDays(7)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 7 ? 1 : 0.5 }}
            color="white"
          >
            Week
          </Box>
          <Box
            onClick={() => {
              setNumberOfDays(30)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 30 ? 1 : 0.5 }}
            color="white"
          >
            Month
          </Box>
          <Box
            onClick={() => {
              setNumberOfDays(360)
            }}
            sx={{ cursor: 'pointer', opacity: numberOfDays === 360 ? 1 : 0.5 }}
            color="white"
          >
            Year
          </Box>
        </Flex>
      </Flex>

      {chartView === CHART_VIEW.LIQUIDITY && chartData?.length !== 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={chartData}
            onMouseMove={({ isTooltipActive, activePayload }) => {
              if (!isTooltipActive || !activePayload) return
              setActivePayload(activePayload[0]?.payload)
            }}
            onMouseLeave={() => {
              setActivePayload(null)
            }}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#70E000" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#70E000" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              tickLine={false}
              tickFormatter={(t) => {
                if (data.length === 0) return

                if (numberOfDays === 360) return moment(t).format('MMM')
                if (numberOfDays === 30) return moment(t).format('DD')
                if (numberOfDays === 7) return moment(t).format('ddd')
              }}
              axisLine={false}
              dataKey="date"
            />
            <YAxis tickLine={false} axisLine={false} dataKey={'totalLiquidityUSD'} />
            <Tooltip style={{ visibility: 'hidden' }} wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />
            {/* <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} /> */}

            <Area type="monotone" dataKey="totalLiquidityUSD" stroke="#70E000" fillOpacity={1} fill="url(#colorPv)" />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {chartData.length !== 0 && chartView === CHART_VIEW.VOLUME && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
            onMouseMove={({ isTooltipActive, activePayload }) => {
              if (!isTooltipActive || !activePayload) return
              setActivePayload(activePayload[0]?.payload)
            }}
            onMouseLeave={() => {
              setActivePayload(null)
            }}
          >
            <XAxis
              tickFormatter={(t) => {
                if (data.length === 0) return
                if (numberOfDays === 360) return moment(t).format('MMM')
                if (numberOfDays === 30) return moment(t).format('DD')
                if (numberOfDays === 7) return moment(t).format('ddd')
              }}
              tickLine={false}
              axisLine={false}
              dataKey="date"
            />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip style={{ visibility: 'hidden' }} wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />
            {/* <Tooltip wrapperStyle={{ outline: 'none' }} content={<CustomTooltip />} /> */}

            <Bar dataKey="volumeUSD" fill="#70E000" activeBar={<Rectangle fill="#70E000" stroke="#70E000" />} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </>
  ) : (
    ''
  )
}

export default GlobalChart
