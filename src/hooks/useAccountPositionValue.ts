import { AddressZero } from 'ethers/constants'
import { useEffect, useMemo, useState } from 'react'
import { VOLT_ADDRESS, WFUSE_ADDRESS } from '../constants'
import { useUserPositions } from '../contexts/User'

enum Status {
  NOT_REQUESTED,
  LOADING,
  SUCCESS,
  ERROR,
}

export function useAccountPositionValue(account: string) {
  const positions = useUserPositions(account.toLowerCase())

  const aggregateFees = useMemo(() => {
    return positions?.reduce(function (total, position) {
      return total + position.fees.sum
    }, 0)
  }, [positions])

  const positionValue = useMemo(() => {
    return positions
      ? positions.reduce((total, position) => {
          return (
            total +
            (parseFloat(position?.liquidityTokenBalance) / parseFloat(position?.pair?.totalSupply)) *
              position?.pair?.reserveUSD
          )
        }, 0)
      : null
  }, [positions])
  return { fees: aggregateFees, positionValue, positions }
}

export function useTreasuryHoldings(account: string) {
  const { resp, status } = useSafeCgwBalance(account)
  const { positions, positionValue } = useAccountPositionValue(account)

  return useMemo(() => {
    if (!resp || !positions || status !== Status.SUCCESS) {
      return { status: Status.LOADING, resp }
    }

    const { fiatTotal, items: tokenBalances } = resp

    const volt = parseFloat(
      tokenBalances.find((token) => token.tokenInfo.address.toLowerCase() === VOLT_ADDRESS)?.fiatBalance ?? 0
    )
    const fuse = tokenBalances
      .filter(
        (token) =>
          token.tokenInfo.address.toLowerCase() === WFUSE_ADDRESS ||
          token.tokenInfo.address.toLowerCase() === AddressZero
      )
      .reduce((acc, token) => acc + parseFloat(token.fiatBalance), 0)
    const lps = positionValue
    const stables = tokenBalances
      .filter((token) => token.tokenInfo.symbol.toLowerCase().includes('usd')) // TODO: filter by addresses not symbols
      .reduce((acc, token) => acc + parseFloat(token.fiatBalance), 0)
    const other = fiatTotal - volt - fuse - stables

    return {
      status,
      resp,
      fiatTotal: parseFloat(fiatTotal) + lps,
      volt,
      fuse,
      other,
      stables,
      lps,
    }
  }, [resp, positions, status, positionValue])
}

export function useSafeCgwBalance(account: string) {
  const [resp, setResp] = useState(undefined)

  const [status, setStatus] = useState(Status.NOT_REQUESTED)

  useEffect(() => {
    if (!account || status !== Status.NOT_REQUESTED) {
      return
    }
    setStatus(Status.LOADING)
    async function fetchData() {
      try {
        const response = await fetch(
          `https://gateway.safe.fuse.io/v1/chains/122/safes/${account}/balances/USD?exclude_spam=true&trusted=false`
        )
        const json = await response.json()
        setResp(json)
        setStatus(Status.SUCCESS)
      } catch (e) {
        console.log(e)
        setStatus(Status.ERROR)
      }
    }
    fetchData()
  }, [account, status])
  return { resp, status }
}
