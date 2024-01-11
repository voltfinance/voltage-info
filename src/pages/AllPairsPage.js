import React, { useEffect } from 'react'
import 'feather-icons'

import { TYPE } from '../Theme'
import Panel from '../components/Panel'
import PairList from '../components/PairList'
import { PageWrapper, FullWrapper } from '../components'
import { RowBetween } from '../components/Row'
import Search from '../components/Search'
import { useMedia } from 'react-use'
import TopPairsList from '../components/TopPairsList'
import { useDailyPairs } from '../hooks/useTVL/usePairs'

function AllPairsPage() {
  const pairs = useDailyPairs()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const below800 = useMedia('(max-width: 800px)')

  return (
    <PageWrapper>
      <FullWrapper>
        <RowBetween>
          <TYPE.largeHeader>Top Pairs</TYPE.largeHeader>
          {!below800 && <Search small={true} />}
        </RowBetween>
        <Panel style={{ padding: below800 && '1rem 0 0 0 ' }}>
          <TopPairsList tokens={pairs} disbaleLinks={true} itemMax={100} />
        </Panel>
      </FullWrapper>
    </PageWrapper>
  )
}

export default AllPairsPage
