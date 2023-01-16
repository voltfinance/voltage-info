import dayjs from 'dayjs'
import { useMemo } from 'react'

export function useFormattedDatas(datas: any, fields: any, startTime: any, accumulate: any, sumFields: any) {
  const formattedSyncedDatas = useMemo(() => {
    if (!datas || !datas.length) return
    const syncedDatas = []
    const filteredDatas = datas
    const allTimestamps = filteredDatas.map((data) => [...data.map((day) => day.date)]).flat()

    const firstTimestamp = Math.min(...allTimestamps)
    const lastTimestamp = Math.max(...allTimestamps)
    let curTimestamp = firstTimestamp
    const oneDay = 86400
    const indices = filteredDatas.map((_) => 0)
    const prevs = filteredDatas.map((data, i) => parseFloat(data[0][fields[i]]))
    const days = []
    while (curTimestamp <= lastTimestamp) {
      days.push({ date: curTimestamp, values: [] })
      const syncedData = filteredDatas.map((data, i) => {
        if (indices[i] < data.length && data[indices[i]].date <= curTimestamp) {
          prevs[i] = parseFloat(data[indices[i]][fields[i]]) + (accumulate ? prevs[i] : 0)
          indices[i] += 1
        }
        return prevs[i]
      })
      syncedDatas.push(
        syncedData.map((_syncedData) => {
          return {
            value: _syncedData,
            date: curTimestamp,
            time: dayjs.unix(curTimestamp).utc().format('YYYY-MM-DD'),
            timestamp: curTimestamp,
          }
        })
      )
      curTimestamp += oneDay
    }
    return syncedDatas[0]
      .map((_, i) => syncedDatas.map((data) => data[i]))
      .map((data) => data.filter((entry) => entry.timestamp >= startTime))
  }, [accumulate, datas, fields, startTime])
  return useMemo(() => {
    if (!formattedSyncedDatas || !formattedSyncedDatas.length) return
    return sumFields
      ? [
          formattedSyncedDatas[0].map((data, i) => {
            return {
              ...data,
              value: formattedSyncedDatas.reduce((acc, points) => acc + parseFloat(points[i].value), 0),
            }
          }),
        ]
      : formattedSyncedDatas
  }, [formattedSyncedDatas, sumFields])
}
