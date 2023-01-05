import React, { useState, useEffect, useRef } from 'react'
import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { formattedNum, formattedPercent, rawPercent } from '../../utils'
import styled from 'styled-components'
import { usePrevious } from 'react-use'
import { Play } from 'react-feather'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import { IconWrapper } from '..'
import { set } from 'react-ga'

const CHART_TYPES = {
  BAR: 'BAR',
  AREA: 'AREA',
}

const NUMBER_STYLE = {
  PERCENTAGE: 'PERCENTAGE',
  USD: 'USD',
}

dayjs.extend(utc)

const Wrapper = styled.div`
  position: relative;
`

// constant height for charts
const HEIGHT = 300

const TradingViewChartArea = ({
  datas,
  base,
  baseChange,
  fields,
  title,
  width,
  useWeekly = false,
  accumulate = false,
  configs,
  formatter = formattedNum,
}) => {
  // reference for DOM element to create with chart
  const type = CHART_TYPES.AREA
  const ref = useRef()

  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)

  // // parese the data and format for tardingview consumption
  // let formattedData = datas[0]?.map(
  //   (sum = 0, entry => {
  //     sum += parseFloat(entry[fields[0]])
  //     return {
  //       time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
  //       value: accumulate ? sum : parseFloat(entry[fields[0]]),
  //     }
  //   })
  // )

  const formattedDatas = datas.map((data, i) => {
    let sm = 0
    return data?.map((entry) => {
      sm += parseFloat(entry[fields[i]])
      return {
        time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
        value: accumulate ? sm / (i + 1) : parseFloat(entry[fields[i]]) / (i + 1),
      }
    })
  })
  // const accumulatedDatas = datas.map((data, i) => {
  //   let sum = 0
  //   return data?.map(
  //     ((sum = 0),
  //     (entry) => {
  //       sum += parseFloat(entry[fields[i]])
  //       return {
  //         time: dayjs.unix(entry.date).utc().format('YYYY-MM-DD'),
  //         value: sum / (i + 1),
  //       }
  //     })
  //   )
  // })

  // adjust the scale based on the type of chart
  const topScale = 0.32

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const previousTheme = usePrevious(darkMode)

  // reset the chart if them switches
  useEffect(() => {
    if (chartCreated && previousTheme !== darkMode) {
      // remove the tooltip element
      let tooltip = document.getElementById('tooltip-id' + type)
      let node = document.getElementById('test-id' + type)
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated()
    }
  }, [chartCreated, darkMode, previousTheme, type])

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated && formattedDatas[0]?.length > 0) {
      var chart = createChart(ref.current, {
        width: width,
        height: HEIGHT,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor,
        },
        rightPriceScale: {
          scaleMargins: {
            top: topScale,
            bottom: 0,
          },
          borderVisible: false,
        },
        timeScale: {
          borderVisible: false,
        },
        grid: {
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
            visible: false,
          },
        },
        crosshair: {
          horzLine: {
            visible: false,
            labelVisible: false,
          },
          vertLine: {
            visible: true,
            style: 0,
            width: 2,
            color: 'rgba(32, 38, 46, 0.1)',
            labelVisible: false,
          },
        },
        localization: {
          priceFormatter: (val) => formatter(val, true),
        },
      })

      //   var series = chart.addAreaSeries({
      //     // topColor: '#5ED73E',
      //     // bottomColor: 'rgba(171, 219, 173, 0)',
      //     // lineColor: '#5ED73E',
      //     // lineWidth: 3,
      //   })
      //   var series2 = chart.addAreaSeries({
      //     // topColor: '#54c4b5',
      //     // bottomColor: 'rgba(181, 230, 223, 0)',
      //     // lineColor: '#54c4b5',
      //     // lineWidth: 3,
      //   })
      var seriesArr = configs.map((config) => {
        return chart.addAreaSeries(config)
      })

      seriesArr.map((ser, i) => {
        ser.setData(formattedDatas[i])
      })

      //   series.setData(formattedData)
      //   series2.setData(formattedDataV2)
      var toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id' + type)
      toolTip.className = darkMode ? 'three-line-legend-dark' : 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.fontWeight = '500'
      toolTip.style.left = -4 + 'px'
      toolTip.style.top = '-' + 8 + 'px'
      toolTip.style.backgroundColor = 'transparent'

      // format numbers
      let percentChange = baseChange?.toFixed(2)
      let formattedPercentChange = (percentChange > 0 ? '+' : '') + percentChange + '%'
      let color = percentChange >= 0 ? 'green' : 'red'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML =
          `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title}</div>` +
          `<div style="font-size: 22px; margin: 4px 0px; color:${textColor}" >` +
          formatter(base ?? formattedDatas[0][formattedDatas[0].length - 1].value, true) +
          `<span style="margin-left: 10px; font-size: 16px; color: ${color};">${formattedPercentChange}</span>` +
          '</div>'
      }
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function (param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > HEIGHT
        ) {
          setLastBarText()
        } else {
          let dateStr = useWeekly
            ? dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .startOf('week')
                .format('MMMM D, YYYY') +
              '-' +
              dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day)
                .endOf('week')
                .format('MMMM D, YYYY')
            : dayjs(param.time.year + '-' + param.time.month + '-' + param.time.day).format('MMMM D, YYYY')
          var price = param.seriesPrices.get(seriesArr[0])
          toolTip.innerHTML =
            `<div style="font-size: 16px; margin: 4px 0px; color: ${textColor};">${title}</div>` +
            `<div style="font-size: 22px; margin: 4px 0px; color: ${textColor}">` +
            formatter(price, true) +
            '</div>' +
            '<div>' +
            dateStr +
            '</div>'
        }
      })

      chart.timeScale().fitContent()

      setChartCreated(chart)
    }
  }, [
    base,
    baseChange,
    chartCreated,
    configs,
    darkMode,
    datas,
    formattedDatas,
    formatter,
    textColor,
    title,
    topScale,
    type,
    useWeekly,
    width,
  ])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, HEIGHT)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, width])

  return (
    <Wrapper>
      <div ref={ref} id={'test-id' + type} />
      <IconWrapper>
        <Play
          onClick={() => {
            chartCreated && chartCreated.timeScale().fitContent()
          }}
        />
      </IconWrapper>
    </Wrapper>
  )
}

export default TradingViewChartArea
