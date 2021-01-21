import React from 'react'
import styled from 'styled-components'
import { useMedia } from 'react-use'
import { TYPE } from '../../Theme'
import { useSessionStart } from '../../contexts/Application'

const Polling = styled.div`
  position: fixed;
  display: flex;
  left: 0;
  bottom: 0;
  padding: 1rem;
  color: white;
  opacity: 0.4;
  transition: opacity 0.25s ease;
  :hover {
    opacity: 1;
  }
`
const PollingDot = styled.div`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  margin-right: 0.5rem;
  margin-top: 3px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.green1};
`

function SideNavTimer() {
  const below1180 = useMedia('(max-width: 1180px)')

  const seconds = useSessionStart()

  return (
    !below1180 && (
      <Polling style={{ marginLeft: '.5rem' }}>
        <PollingDot />
        <a href="/" style={{ color: 'white' }}>
          <TYPE.small color={'white'}>
            Updated {!!seconds ? seconds + 's' : '-'} ago <br />
          </TYPE.small>
        </a>
      </Polling>
    )
  )
}

export default SideNavTimer
