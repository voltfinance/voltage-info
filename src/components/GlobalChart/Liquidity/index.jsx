import { Box } from 'rebass'
import React, { useState } from 'react'
import Filter from '../Filter'
import { useTVL } from '../../../hooks/useTVL'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import moment from 'moment'
import { formatChartNumber, formatNumber } from '../../../utils'
import { meanBy } from 'lodash'
const LiquidityChart = ({ filterAddress }) => {
  const [numberOfDays, setNumberOfDays] = useState(360)
  const [activePayload, setActivePayload] = useState(null)
  const data = useTVL(numberOfDays, filterAddress)

  return (
    <>
      <Filter
        title="Liquidity"
        amount={activePayload?.totalLiquidityUSD || data[data.length - 1]?.totalLiquidityUSD || 0}
        percent={activePayload?.percentLiquidityChange || data[data.length - 1]?.percentLiquidityChange || 0}
        numberOfDays={numberOfDays}
        setNumberOfDays={setNumberOfDays}
      />
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={data}
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
            dataKey={({ date }) => {
              if (numberOfDays === 360) return moment(date).format('MMM')
              if (numberOfDays === 30) return moment(date).format('DD')
              if (numberOfDays === 7) return moment(date).format('ddd')
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(d) => {
              return formatChartNumber(d)
            }}
            dataKey={'totalLiquidityUSD'}
          />
          <Tooltip style={{ visibility: 'hidden' }} wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />

          <Area type="monotone" dataKey="totalLiquidityUSD" stroke="#70E000" fillOpacity={1} fill="url(#colorPv)" />
        </AreaChart>
      </ResponsiveContainer>
    </>
  )
}

export default LiquidityChart
