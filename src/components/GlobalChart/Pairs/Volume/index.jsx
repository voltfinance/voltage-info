import React, { useEffect, useState } from 'react'
import Filter from '../../Filter'
import { Area, BarChart, Bar, ResponsiveContainer, Rectangle, Tooltip, XAxis, YAxis } from 'recharts'
import moment from 'moment'
import { formatChartNumber } from '../../../../utils'
import { useAllPairChartData, useV3Pairs } from '../../../../hooks/useTVL/useV3Pairs'

const VolumeChart = ({ filterAddress }) => {
  const [numberOfDays, setNumberOfDays] = useState(360)
  const [activePayload, setActivePayload] = useState(null)
  const data = useAllPairChartData(numberOfDays, filterAddress)
  const weekly = useAllPairChartData(7, filterAddress)

  return (
    <>
      <Filter
        title="Volume"
        amount={activePayload?.volumeUSD || weekly[weekly.length - 1]?.volumeUSD || 0}
        numberOfDays={numberOfDays}
        setNumberOfDays={setNumberOfDays}
      />
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
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
            dataKey={({ date }) => {
              if (numberOfDays === 360) return moment(date).format('MMM')
              if (numberOfDays === 30) return moment(date).format('DD')
              if (numberOfDays === 7) return moment(date).format('ddd')
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(d) => {
              return formatChartNumber(d)
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip style={{ visibility: 'hidden' }} wrapperStyle={{ outline: 'none', visibility: 'hidden' }} />

          <Bar dataKey="volumeUSD" fill="#70E000" activeBar={<Rectangle fill="#70E000" stroke="#70E000" />} />
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default VolumeChart
