import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

const voltageExchangeClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/voltage-exchange',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const query = gql`
  query($from: Int!) {
    tokens(orderBy: txCount, orderDirection: desc) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
<<<<<<< Updated upstream
=======
      tradeVolumeUSD
      tokenDayData(orderBy: date, orderDirection: desc, first: 1000, where: { date_gte: $from }) {
        dailyVolumeUSD
        totalLiquidityUSD
        date
        priceUSD
      }
>>>>>>> Stashed changes
    }
  }
`

<<<<<<< Updated upstream
const dayData = gql`
  {
    tokens(where: { derivedETH_gt: 0 }) {
      name
      id
      symbol
      totalSupply
      totalLiquidity
      derivedETH
    }
  }
`

export const useVoltageExchangeHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltageExchange = useCallback(async () => {
    const ethPrice = await getETHPrice()

    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      await blocks.map(async (block) => {
        try {
          const { data } = await voltageExchangeClient.query({
            query: queryBlock,
            variables: {
              block,
            },
          })
          const results = data?.tokens?.map(({ name, symbol, id, totalLiquidity, derivedETH }) => {
            return {
              name,
              symbol,
              id,
              balance: totalLiquidity,
              totalLiquidityUSD: parseFloat(totalLiquidity) * (parseFloat(derivedETH) * ethPrice),
              priceUSD: parseFloat(derivedETH) * ethPrice,
            }
          })
          return sumBy(results, 'totalLiquidityUSD')
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])
  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])
  return historical
}

export const useVoltageDaily = () => {
=======
export const useVoltageExchange = (numberOfDays) => {
>>>>>>> Stashed changes
  const [data, setData] = useState([])
  const isV2 = (id) => {
    const USDT_V2 = '0x68c9736781e9316ebf5c3d49fe0c1f45d2d104cd'
    const USDC_V2 = '0x28c3d1cd466ba22f6cae51b1a4692a831696391a'
    return USDT_V2?.toLowerCase() === id.toLowerCase() || USDC_V2?.toLowerCase() === id.toLowerCase()
  }
  const voltageExchange = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await voltageExchangeClient.query({
        query: query,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)) * 86400,
        },
      })
      console.log(data, 'useVoltageExchange')

<<<<<<< Updated upstream
      const results = data?.tokens?.map(({ name, symbol, id, totalLiquidity, derivedETH }) => {
        return {
          name: isV2(id) ? `${name} V2` : name,
          symbol,
          id,
          balance: totalLiquidity,
          totalLiquidityUSD: parseFloat(totalLiquidity) * (parseFloat(derivedETH) * ethPrice),
          priceUSD: parseFloat(derivedETH) * ethPrice,
        }
=======
      const results = data?.tokens.map(({ id, name, tokenDayData, ...props }) => {
        return tokenDayData.map(({ totalLiquidityUSD, date, dailyVolumeUSD, priceUSD }) => {
          return {
            name: isV2(id) ? `${name} V2` : name,
            id,
            totalLiquidityUSD: parseFloat(totalLiquidityUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(dailyVolumeUSD) || 0,
            timestamp: parseFloat(date) * 1000,
            date: moment(parseFloat(date) * 1000).format('YYYY-MM-DD'),
            ...props,
          }
        })
>>>>>>> Stashed changes
      })
      console.log(results, 'datadatadatadata')

      setData(results)
    } catch (e) {
      return 0
    }
  }, [])
  useEffect(() => {
    voltageExchange()
  }, [voltageExchange])
  return data
}
