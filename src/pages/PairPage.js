import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import 'feather-icons'
import styled from 'styled-components'
import Panel from '../components/Panel'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { PageWrapper, ContentWrapperLarge, StyledIcon } from '../components/index'
import { AutoRow, RowBetween, RowFixed } from '../components/Row'
import Column, { AutoColumn } from '../components/Column'
import { ButtonLight, ButtonDark } from '../components/ButtonStyled'
import PairChart from '../components/PairChart'
import Link from '../components/Link'
import TxnList from '../components/TxnList'
import Loader from '../components/LocalLoader'
import { BasicLink } from '../components/Link'
import Search from '../components/Search'
import { formattedNum, formattedPercent, getPoolLink, getSwapLink } from '../utils'
import { useColor } from '../hooks'
import { usePairData, usePairTransactions } from '../contexts/PairData'
import { TYPE, ThemedBackground } from '../Theme'
import { transparentize } from 'polished'
import CopyHelper from '../components/Copy'
import { useMedia } from 'react-use'
import DoubleTokenLogo from '../components/DoubleLogo'
import TokenLogo from '../components/TokenLogo'
import { Hover } from '../components'
import { useEthPrice } from '../contexts/GlobalData'
import Warning from '../components/Warning'
import { usePathDismissed, useSavedPairs } from '../contexts/LocalStorage'
import { Flex } from 'rebass'
import { Bookmark, PlusCircle } from 'react-feather'
import FormattedName from '../components/FormattedName'
import { useListedTokenAddresses } from '../contexts/Application'
import { usePair } from '../hooks/useTVL/usePairs'
import LiquidityChart from '../components/GlobalChart/Pairs/Liquidity'
import VolumeChart from '../components/GlobalChart/Pairs/Volume'
import { useAllPairs, useSearchAllPairs, useV3Pairs } from '../hooks/useTVL/useV3Pairs'

const DashboardWrapper = styled.div`
  width: 100%;
`

const TokenDetailsLayout = styled.div`
  display: inline-grid;
  width: 100%;
  grid-template-columns: auto auto auto auto 1fr;
  column-gap: 60px;
  align-items: start;

  &:last-child {
    align-items: center;
    justify-items: end;
  }
  @media screen and (max-width: 1024px) {
    grid-template-columns: 1fr;
    align-items: stretch;
    > * {
      grid-column: 1 / 4;
      margin-bottom: 1rem;
    }

    &:last-child {
      align-items: start;
      justify-items: start;
    }
  }
`

const HoverSpan = styled.span`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

function PairPage({ pairAddress, history }) {
  const pair = useAllPairs(10, pairAddress)
  const [data, setData] = useState([])
  const token0 = data?.token0
  const token1 = data?.token1

  useEffect(() => {
    setData(pair[0])
  }, [pair])

  useEffect(() => {
    document.querySelector('body').scrollTo(0, 0)
  }, [])

  const transactions = usePairTransactions(pairAddress)
  const backgroundColor = useColor(pairAddress)

  const below1080 = useMedia('(max-width: 1080px)')
  const below900 = useMedia('(max-width: 900px)')
  const below600 = useMedia('(max-width: 600px)')

  useEffect(() => {
    window.scrollTo({
      behavior: 'smooth',
      top: 0,
    })
  }, [])

  const [savedPairs, addPair] = useSavedPairs()

  return (
    <PageWrapper>
      <ContentWrapperLarge>
        <RowBetween>
          <TYPE.body>
            <BasicLink to="/pairs">{'Pairs '}</BasicLink>→ {token0?.symbol}-{token1?.symbol}
          </TYPE.body>
          {!below600 && <Search small={true} />}
        </RowBetween>

        <DashboardWrapper>
          <AutoColumn gap="40px" style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                width: '100%',
              }}
            >
              <RowFixed style={{ flexWrap: 'wrap', minWidth: '100px' }}>
                <RowFixed>
                  {token0 && token1 && (
                    <DoubleTokenLogo a0={token0?.id || ''} a1={token1?.id || ''} size={32} margin={true} />
                  )}{' '}
                  <TYPE.main fontSize={below1080 ? '1.5rem' : '2rem'} style={{ margin: '0 1rem' }}>
                    {token0 && token1 ? (
                      <>
                        <HoverSpan onClick={() => history.push(`/token/${token0?.id}`)}>{token0.symbol}</HoverSpan>
                        <span>-</span>
                        <HoverSpan onClick={() => history.push(`/token/${token1?.id}`)}>{token1.symbol}</HoverSpan> Pair
                      </>
                    ) : (
                      ''
                    )}
                  </TYPE.main>
                </RowFixed>
              </RowFixed>
              <RowFixed
                ml={below900 ? '0' : '2.5rem'}
                mt={below1080 && '1rem'}
                style={{
                  flexDirection: below1080 ? 'row-reverse' : 'initial',
                }}
              >
                {!!!savedPairs[pairAddress] && !below1080 ? (
                  <Hover onClick={() => addPair(pairAddress, token0.id, token1.id, token0.symbol, token1.symbol)}>
                    <StyledIcon>
                      <PlusCircle style={{ marginRight: '0.5rem' }} />
                    </StyledIcon>
                  </Hover>
                ) : !below1080 ? (
                  <StyledIcon>
                    <Bookmark style={{ marginRight: '0.5rem', opacity: 0.4 }} />
                  </StyledIcon>
                ) : (
                  <></>
                )}

                <Link external href={getPoolLink(token0?.id, token1?.id)}>
                  <ButtonLight color={backgroundColor}>+ Add Liquidity</ButtonLight>
                </Link>
                <Link external href={getSwapLink(token0?.id, token1?.id)}>
                  <ButtonDark ml={!below1080 && '.5rem'} mr={below1080 && '.5rem'} color={backgroundColor}>
                    Trade
                  </ButtonDark>
                </Link>
              </RowFixed>
            </div>
          </AutoColumn>

          <>
            <>
              <Flex width="100%" sx={{ gap: 3 }} style={{ marginTop: below1080 ? '0' : '1rem' }}>
                <Flex width={'100%'} flexDirection="column">
                  <Flex sx={{ gap: 3 }} flexDirection={['column', 'row']} height="100%">
                    <Panel style={{ height: '100%', minHeight: '300px' }}>
                      <LiquidityChart version="v2" filterAddress={pairAddress} />
                    </Panel>

                    <Panel style={{ height: '100%', minHeight: '300px' }}>
                      <VolumeChart version="v2" filterAddress={pairAddress} />
                    </Panel>
                  </Flex>
                </Flex>
              </Flex>
            </>
            <TYPE.main fontSize={'1.125rem'} style={{ marginTop: '3rem' }}>
              Transactions
            </TYPE.main>{' '}
            <Panel
              style={{
                marginTop: '1.5rem',
              }}
            >
              {transactions ? <TxnList transactions={transactions} /> : <Loader />}
            </Panel>
            <RowBetween style={{ marginTop: '3rem' }}>
              <TYPE.main fontSize={'1.125rem'}>Pair Information</TYPE.main>{' '}
            </RowBetween>
            <Panel
              rounded
              style={{
                marginTop: '1.5rem',
              }}
              p={20}
            >
              <TokenDetailsLayout>
                <Column>
                  <TYPE.main>Pair Name</TYPE.main>
                  <TYPE.main style={{ marginTop: '.5rem' }}>
                    <RowFixed>
                      <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />
                      -
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />
                    </RowFixed>
                  </TYPE.main>
                </Column>
                <Column>
                  <TYPE.main>Pair Address</TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {pairAddress.slice(0, 6) + '...' + pairAddress.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={pairAddress} />
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>
                    <RowFixed>
                      <FormattedName text={token0?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>Address</span>
                    </RowFixed>
                  </TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }}>
                      {token0 && token0.id.slice(0, 6) + '...' + token0.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token0?.id} />
                  </AutoRow>
                </Column>
                <Column>
                  <TYPE.main>
                    <RowFixed>
                      <FormattedName text={token1?.symbol ?? ''} maxCharacters={8} />{' '}
                      <span style={{ marginLeft: '4px' }}>Address</span>
                    </RowFixed>
                  </TYPE.main>
                  <AutoRow align="flex-end">
                    <TYPE.main style={{ marginTop: '.5rem' }} fontSize={16}>
                      {token1 && token1.id.slice(0, 6) + '...' + token1.id.slice(38, 42)}
                    </TYPE.main>
                    <CopyHelper toCopy={token1?.id} />
                  </AutoRow>
                </Column>
                <ButtonLight color={backgroundColor}>
                  <Link color={backgroundColor} external href={'https://explorer.fuse.io/address/' + pairAddress}>
                    View on Fuse Explorer ↗
                  </Link>
                </ButtonLight>
              </TokenDetailsLayout>
            </Panel>
          </>
        </DashboardWrapper>
      </ContentWrapperLarge>
    </PageWrapper>
  )
}

export default withRouter(PairPage)
