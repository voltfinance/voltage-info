import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import moment from 'moment'
import { useCallback, useEffect, useState } from 'react'

const X_VOLT = '0x97a6e78c9208c21afaDa67e7E61d7ad27688eFd1'
<<<<<<< Updated upstream
const VOLT = '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4'
=======

const VEVOLT_ADDRESS = '0xb0a05314bd77808269e2e1e3d280bff57ba85672'
>>>>>>> Stashed changes

export const voltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/volt-bar',
  }) as any,
  cache: new InMemoryCache(),
} as any)

<<<<<<< Updated upstream
const query = gql`
  query($id: String!, $block: Int!) {
    bar(id: $id, block: { number: $block }) {
      voltStaked
    }
  }
`

export const useVoltStakingHistorical = (blocks = []) => {
  const [historical, setHistorical] = useState([])
  const voltStaking = useCallback(async () => {
    if (blocks.length === 0) return setHistorical([])

    const results = await Promise.all(
      blocks.map(async (block) => {
        try {
          const { data } = await voltStakingClient.query({
            query,
            variables: {
              id: X_VOLT.toLowerCase(),
              block,
            },
          })
          const balance = await getBalanceAtBlock(VOLT, block)
          return parseFloat(data?.bar?.voltStaked) * balance
        } catch (e) {
          return 0
        }
      })
    )
    setHistorical(results)
  }, [blocks])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return historical
}

const queryNoBlock = gql`
  query($id: String!) {
    bar(id: $id) {
      voltStaked
    }
  }
`
export const useVoltStakingDaily = (blocks = []) => {
  const [historical, setHistorical] = useState([])

=======
export const vevoltStakingClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/voltfinance/vevolt-subgraph',
  }) as any,
  cache: new InMemoryCache(),
  shouldBatch: true,
} as any)

const voltBarQuery = gql`
  query($from: Int!) {
    voltBalanceHistories(where: { date_gte: $from }) {
      balance
      balanceUSD
      timestamp
      volume
      volumeUSD
      priceUSD
      date
    }
  }
`

const veVOLTQuery = gql`
  query($from: Int!) {
    dayDatas(orderBy: timestamp, orderDirection: desc, first: 1000, where: { date_gte: $from }) {
      timestamp
      balance
      volume
      balanceUSD
      volumeUSD
      priceUSD
      date
    }
  }
`

export const useVevolt = (numberOfDays) => {
  const [data, setData] = useState([])

  const veVoltStaking = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await vevoltStakingClient.query({
        query: veVOLTQuery,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
        },
      })
      console.log(data, 'datadatadata')
      setData(
        data?.dayDatas?.map(({ timestamp, priceUSD, balanceUSD, volumeUSD }) => {
          return {
            id: VEVOLT_ADDRESS?.toLowerCase(),
            name: 'veVOLT',
            symbol: 'veVOLT',
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: timestamp,
            date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
      setData([])
      return 0
    }
  }, [])

  useEffect(() => {
    veVoltStaking()
  }, [veVoltStaking])

  return data
}

export const useVoltStaking = (numberOfDays) => {
  const [data, setData] = useState([])
>>>>>>> Stashed changes
  const voltStaking = useCallback(async () => {
    const now = moment().utc()
    try {
      const { data } = await voltStakingClient.query({
        query: voltBarQuery,
        variables: {
          from: parseInt((now.clone().subtract(numberOfDays, 'day').unix() / 86400).toFixed(0)),
        },
      })
      console.log(data, 'voltStaking data')
      setData(
        data?.voltBalanceHistories?.map(({ timestamp, priceUSD, volumeUSD, balanceUSD }) => {
          return {
            id: X_VOLT?.toLowerCase(),
            name: 'xVOLT',
            symbol: 'xVOLT',
            totalLiquidityUSD: parseFloat(balanceUSD) || 0,
            priceUSD: parseFloat(priceUSD) || 0,
            volumeUSD: parseFloat(volumeUSD) || 0,
            timestamp: parseFloat(timestamp),
            date: moment(parseFloat(timestamp) * 1000).format('YYYY-MM-DD'),
          }
        })
      )
    } catch (e) {
<<<<<<< Updated upstream
=======
      console.log(e, 'voltstaking')

>>>>>>> Stashed changes
      return 0
    }
  }, [])

  useEffect(() => {
    voltStaking()
  }, [voltStaking])

  return data
}
