import dayjs from 'dayjs'
import gql from 'graphql-tag'
import { blockClient, client } from '../../apollo/client'

const query = gql`
  query($id: String!, $block: Int!) {
    token(id: $id, block: { number: $block }) {
      derivedETH
    }
    bundle(id: "1", block: { number: $block }) {
      ethPrice
    }
  }
`

const queryBalance = gql`
  query($id: String!) {
    token(id: $id) {
      derivedETH
    }
    bundle(id: "1") {
      ethPrice
    }
  }
`

const ethPriceQuery = gql`
  {
    bundle(id: "1") {
      ethPrice
    }
  }
`

export const getETHPrice = async () => {
  const result = await client.query({
    query: ethPriceQuery,
  })

  return parseFloat(result?.data?.bundle?.ethPrice)
}

export const getBalance = async (id) => {
  const result = await client.query({
    query: queryBalance,
    variables: {
      id: id?.toLowerCase(),
    },
  })
  if (result?.data?.token?.derivedETH && result?.data?.bundle?.ethPrice) {
    return parseFloat(result?.data?.token?.derivedETH) * parseFloat(result?.data?.bundle?.ethPrice)
  }
  return 0
}

export const getBalanceAtBlock = async (id, block) => {
  const result = await client.query({
    query,
    variables: {
      block,
      id: id?.toLowerCase(),
    },
  })
  if (result?.data?.token?.derivedETH && result?.data?.bundle?.ethPrice) {
    return parseFloat(result?.data?.token?.derivedETH) * parseFloat(result?.data?.bundle?.ethPrice)
  }
  return 0
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int, $timestampTo: Int) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`
export async function getBlockFromTimestamp(timestamp) {
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: 'cache-first',
  })
  return result?.data?.blocks?.[0]?.number
}

export const GET_BLOCKS = (timestamps) => {
  let queryString = 'query blocks {'
  queryString += timestamps.map((timestamp) => {
    return `t${timestamp}:blocks(first: 1, orderBy: timestamp, orderDirection: desc, where: { timestamp_gt: ${timestamp}, timestamp_lt: ${
      timestamp + 600
    } }) {
      number
    }`
  })
  queryString += '}'
  return gql(queryString)
}

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)

  const blocks = []
  if (fetchedData) {
    for (const t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0]['number'],
        })
      }
    }
  }
  return blocks
}

export async function getBlocksFromDays(numberOfDays = 7) {
  const utcCurrentTime = dayjs()
  return await getBlocksFromTimestamps(
    Array.from(Array(numberOfDays).keys()).map((day) => utcCurrentTime.subtract(day + 1, 'day').unix())
  )
}

export async function splitQuery(query, localClient, vars, list, skipCount = 100) {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    const sliced = list.slice(skip, end)
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first',
    })
    fetchedData = {
      ...fetchedData,
      ...result.data,
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

export const batchBlockQuery = (blocks, id, queryName, queryParameters) => {
  return gql`query {${blocks
    .map((block) => {
      return `
     
      ${queryName}${block}:${queryName}(id: "${id.toLowerCase()}", block: { number: ${block} }) {
        ${queryParameters}
      }
    
  `.replace(/(\r\n|\n|\r)/gm, '')
    })
    .join('')}}`
}
export const decodeBatchQuery = (blocks, data, queryName, queryParameters) => {
  return blocks.map((block) => {
    return data[`${queryName}${block}`][queryParameters]
  })
}
