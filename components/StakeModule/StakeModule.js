import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { utils as EthersUtils } from 'ethers'
import styled from 'styled-components'
import TokenAmount from 'token-amount'
import { useViewport } from 'use-viewport'
import * as Sentry from '@sentry/browser'
import AccountModule from 'components/AccountModule/AccountModule'
import ButtonGroup from 'components/ButtonGroup/ButtonGroup'
import Logo from 'components/Logo/Logo'
import Input from 'components/Input/Input'
import StatsRow from './StatsRow'
import Info from 'components/Info/Info'
import { bigNum } from 'lib/utils'
import env from 'lib/environment'
import { useWalletAugmented } from 'lib/wallet'
import {
  useClaim,
  useRewardsPaid,
  useStake,
  useBalanceOf,
  useTokenDecimals,
  useTokenUniswapInfo,
  useUniStaked,
  useWithdraw,
} from 'lib/web3-contracts'
import { parseUnits } from 'lib/web3-utils'

const SECTIONS = [
  { id: 'stake', copy: 'Stake', copyCompact: 'Stake' },
  { id: 'withdraw', copy: 'Withdraw', copyCompact: 'Withdraw' },
  { id: 'claim', copy: 'Claim rewards', copyCompact: 'Claim' },
]

// Filters and parse the input value of a token amount.
// Returns a BN.js instance and the filtered value.
function parseInputValue(inputValue, decimals) {
  if (decimals === -1) {
    return null
  }

  inputValue = inputValue.trim()

  // amount is the parsed value (BN.js instance)
  const amount = parseUnits(inputValue, { digits: decimals })

  if (amount.lt(0)) {
    return null
  }

  return { amount, inputValue }
}

function useConvertInputs() {
  const [inputValue, setInputValue] = useState('')
  const [amountUni, setAmountUni] = useState(bigNum(0))

  const handleSetInputValue = useCallback(e => {
    const parsedValue = parseInputValue(e.target.value, 18)
    if (parsedValue !== null) {
      setInputValue(parsedValue.inputValue)
      setAmountUni(parsedValue.amount)
    }
  }, [])

  const resetInputs = useCallback(() => {
    setInputValue('')
    setAmountUni(bigNum(0))
  }, [])

  const inputValues = useMemo(
    () => ({
      amountUni,
      handleSetInputValue,
      inputValue,
      resetInputs,
      setAmountUni,
      setInputValue,
    }),
    [
      amountUni,
      handleSetInputValue,
      inputValue,
      resetInputs,
      setAmountUni,
      setInputValue,
    ]
  )

  return inputValues
}

export default function StakeModule() {
  const [activeKey, setActiveKey] = useState(0)
  const [disabled, setDisabled] = useState(false)
  const [notification, setNotification] = useState('')

  const {
    inputValue,
    handleSetInputValue,
    amountUni: amount,
    resetInputs,
    setAmountUni,
    setInputValue,
  } = useConvertInputs()
  const { account, connected } = useWalletAugmented()
  const selectedTokenBalance = useBalanceOf('TOKEN_UNI')
  const { loading: loadingStaked, staked } = useUniStaked(account)
  const decimalsUni = useTokenDecimals('UNI')
  const claim = useClaim()
  const stake = useStake()
  const withdraw = useWithdraw()
  const { below } = useViewport()
  // Super ugly Next.js workaround to let us have differences between SSR & client
  const [isCompact, setIsCompact] = useState(false)
  const smallLayout = below(415)

  useEffect(() => {
    setTimeout(() => {
      setIsCompact(smallLayout)
    }, 0)
  }, [smallLayout])

  // Reset all values on connection change
  useEffect(() => {
    resetInputs()
  }, [activeKey, connected, resetInputs])

  // Reset notification on connection change
  useEffect(() => {
    setNotification('');
  }, [activeKey, connected])

  const handleMax = useCallback(() => {
    const newInputValue = EthersUtils.formatEther(
      selectedTokenBalance.toString()
    )
    setAmountUni(selectedTokenBalance)
    setInputValue(newInputValue)
  }, [selectedTokenBalance, setAmountUni, setInputValue])

  const handleSubmit = useCallback(async () => {
    try {
      setNotification('')
      setDisabled(true)

      if (SECTIONS[activeKey].id === 'stake') {
        await stake(amount)
        setNotification(`${amount && amount['_hex'] ? TokenAmount.format(amount['_hex'], 18, {symbol: 'UNI', digits: 18}) : 'UNI'} have been staked.`)
      }

      if (SECTIONS[activeKey].id === 'withdraw') {
        await withdraw()
        setNotification(`${TokenAmount.format(staked, 18, {symbol: 'UNI', digits: 18 })} have been withdrawn.`)
      }

      if (SECTIONS[activeKey].id === 'claim') {
        await claim()
        setNotification(`${TokenAmount.format(paid, 18, { symbol: 'UOS', digits: 17 })} have been claimed.`)
      }
    } catch (err) {
      if (env('NODE_ENV') !== 'production') {
        Sentry.captureException(err)
      }
    } finally {
      setDisabled(false)
      resetInputs()

      setTimeout( () => {
        setNotification('');
      }, 5000);
    }
  }, [activeKey, amount, claim, resetInputs, stake, withdraw])

  const inputError = useMemo(
    () =>
      amount.gt(selectedTokenBalance) ||
      (amount.eq(bigNum(0)) && SECTIONS[activeKey].id === 'stake') ||
      disabled,
    [activeKey, amount, disabled, selectedTokenBalance]
  )

  const { paid } = useRewardsPaid(account)

  return (
    <div
      css={`
        min-height: 492px;
        margin: 0 auto;
      `}
    >
      <main
        css={`
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-width: 880px;
          max-width: 100%;
          width: 100%;
          height: 100%;
          background: #312D36;
          mix-blend-mode: normal;
          padding: 0 20px 20px;
          border: 1px solid #3C3846;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.25), 0 24px 38px rgba(0, 0, 0, 0.14), 0 9px 46px rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          ${isCompact &&
            `
            max-width: 362px;
            max-height: 100%;
            padding: 10px;
            justify-content: flex-start;
            overflow: hidden;
          `}
        `}
      >
        <div css={`
            position: relative;
            margin: 0 -20px;
            background: #3C3846;
            border-bottom: 1px solid #55525F;
        `}>
          <ButtonGroup
            activeKey={activeKey}
            disabled={disabled}
            elements={SECTIONS}
            isCompact={isCompact}
            onSetActiveKey={setActiveKey}
          />
          <div css={`
              position: absolute;
              right: 20px;
              top: 20px;
           `}>
            <AccountModule  />
          </div>
        </div>

        {connected && notification &&
          (
            <Info mode="success" padding="16" Compact={isCompact}>
              <div>
                <p css={`margin-bottom: 0;`}>{notification}</p>
                <p css={`margin-bottom: 0;`}>Please, wait a bit until transaction(s) will be confirmed (see on Etherscan)</p>
              </div>
            </Info>
          )
        }

        {SECTIONS[activeKey].id === 'stake' && (
          <Info mode="info" height="40" padding="0" Compact={isCompact}>
            <p css={`margin-bottom: 0;`}>
              <span>Learn </span>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://ultra.io/articles"
                css={`
                    &,
                    &:hover {
                     color: #C5ABFF;
                    }
                `}
              >
                {' '}
                how to obtain UNI
              </a>
              <span> to participate in the rewards program.</span>
            </p>
          </Info>
        )}
        {SECTIONS[activeKey].id === 'withdraw' && (
          <Info mode="info" padding="0" Compact={isCompact}>
            Withdraw all of your staked UNI.
          </Info>
        )}
        {SECTIONS[activeKey].id === 'claim' && (
          <Info mode="info" padding="0" Compact={isCompact}>
            Claim all of your rewards from your staked UNI.
          </Info>
        )}
        {!connected && (
          <Info padding="16" isCompact={isCompact}>
            Please, connect your wallet to get started
          </Info>
        )}
        {SECTIONS[activeKey].id !== 'claim' && (
          <StatsRow
            balanceUni={selectedTokenBalance}
            decimalsUni={decimalsUni}
            isCompact={isCompact}
            isStake={SECTIONS[activeKey].id === 'stake'}
          />
        )}
        {SECTIONS[activeKey].id === 'stake' && (
          <Input
            disabled={!connected || disabled}
            inputValue={inputValue}
            onChange={handleSetInputValue}
            onMax={handleMax}
          />
        )}
        {SECTIONS[activeKey].id === 'stake' && (
          <ActionButton
            type="button"
            disabled={disabled || inputError}
            onClick={disabled ? undefined : handleSubmit}
            css={`
              ${disabled ||
              (inputError &&
              `
                background: #534471;
                color: rgba(255, 255, 255, 0.2);
                cursor: default;
                &:active {
                  top: 0px;
                }
              `)}
               ${disabled || !connected ? '': `
                 &:hover {
                    background: #AD8EF2;
                  }
               `}
            `}
          >
            {SECTIONS[activeKey].copy}
          </ActionButton>
        )}
        {SECTIONS[activeKey].id === 'stake' && (
          <div css={
            `background: #55525F;
            height: 1px;
            margin-top: 20px;
          `} />
        )}
        {SECTIONS[activeKey].id === 'stake' && (
          <StakeSection
            loading={loadingStaked}
            isCompact={isCompact}
            staked={staked}
          />
        )}
        {SECTIONS[activeKey].id === 'withdraw' && (
          <WithdrawSection
            loading={loadingStaked}
            isCompact={isCompact}
            staked={staked}
          />
        )}
        {SECTIONS[activeKey].id === 'claim' && (
          <ClaimSectionReward isCompact={isCompact} />
        )}
        {SECTIONS[activeKey].id !== 'stake' && (
          <ActionButton
            type="button"
            disabled={disabled || inputError}
            onClick={disabled ? undefined : handleSubmit}
            css={`
              margin-top: 20px;
              ${disabled ||
                (inputError &&
                  `
                background: #534471;
                color: rgba(255, 255, 255, 0.2);
                cursor: default;
                &:active {
                  top: 0px;
                }
              `)}
                ${disabled || !connected ? '': `
                 &:hover {
                    background: #AD8EF2;
                  }
               `}
            `}
          >
            {SECTIONS[activeKey].copy}
          </ActionButton>
        )}
        {SECTIONS[activeKey].id === 'claim' && (
          <ClaimSectionLiquidityPool isCompact={isCompact} />
        )}
      </main>
    </div>
  )
}

function StakeSection({ loading, staked }) {
  const { connected } = useWalletAugmented()

  return (
    <Card
      css={`
        display: flex;
        align-items: center;
        margin-top: 20px;
      `}
    >
      <Logo mode={'uni'} />
      <div
        css={`
          display: flex;
          flex-direction: column;
          margin-left: 20px;
        `}
      >
        <span
          css={`
            display: block;
            font-weight: 300;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 10px;
          `}
        >
          Amount of UNI staked
        </span>
        <span
          css={`
            font-family: Roboto Mono;
            font-size: 28px;
            line-height: 36px;
            color: #FFFFFF;
            display: block;
          `}
        >
          {!connected
            ? '0 UNI'
            : loading
            ? 'loading...'
            : TokenAmount.format(staked, 18, {
                symbol: 'UNI',
                digits: 18,
              })}
        </span>
      </div>
    </Card>
  )
}

function WithdrawSection({ loading, isCompact, staked }) {
  const { connected } = useWalletAugmented()

  return (
    <div
      css={`
        display: flex;
        margin-top: 12px;
        ${isCompact &&
          `
          flex-direction: column;
        `}
      `}
    >
      <Card
        css={`
        display: flex;
        align-items: center;
      `}
      >
        <Logo mode={'uni'} />
        <div
          css={`
          display: flex;
          flex-direction: column;
          margin-left: 20px;
        `}
        >
        <span
          css={`
            display: block;
            font-weight: 300;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 10px;
          `}
        >
          Amount available to withdraw:
        </span>
          <span
            css={`
            font-family: Roboto Mono;
            font-size: 28px;
            line-height: 36px;
            color: #FFFFFF;
            display: block;
          `}
          >
          {!connected
            ? '0 UNI'
            : loading
              ? 'loading...'
              : TokenAmount.format(staked, 18, {
                symbol: 'UNI',
                digits: 18,
              })}
        </span>
        </div>
      </Card>
    </div>
  )
}

function ClaimSectionReward() {
  const { account } = useWalletAugmented()
  const { loading, paid } = useRewardsPaid(account)

  return (
    <div>
      <Card
        css={`
          display: flex;
          align-items: center;
          margin-top: 40px;
        `}
      >
        <Logo mode="uos" opacity={1} />
        <div
          css={`
            display: flex;
            flex-direction: column;
            margin-left: 20px;
          `}
        >
          <span
            css={`
              display: block;
              font-weight: 300;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 10px;
            `}
          >
            Rewards
          </span>
          <span
            css={`
              display: block;
            `}
          >
            <span
              css={`
                font-family: Roboto Mono;
                font-size: 28px;
                line-height: 36px;
                color: #FFFFFF;
                display: block;
              `}
            >
              {loading
                ? 'loading...'
                : TokenAmount.format(paid, 18, { symbol: 'UOS', digits: 17 })}
            </span>
          </span>
        </div>
      </Card>
    </div>
  )
}

function ClaimSectionLiquidityPool() {
  const [loadingUniswapInfo, uniswapInfo] = useTokenUniswapInfo('UOS')

  return (
    <div>
      <div css={`
        background: #55525F;
        height: 1px;
        margin-top: 20px;
      `} />
      <Card
        css={`
          display: flex;
          align-items: center;
          margin-top: 20px;
        `}
      >
        <Logo mode="uos" />
        <div
          css={`
            display: flex;
            flex-direction: column;
            margin-left: 20px;
          `}
        >
          <span
            css={`
              display: block;
              font-weight: 300;
              color: rgba(255, 255, 255, 0.5);
              margin-bottom: 10px;
            `}
          >
            Total UOS in the Uniswap liquidity pool
          </span>
          <span
            css={`
              font-family: Roboto Mono;
              font-size: 28px;
              line-height: 36px;
              color: #FFFFFF;
              display: block;
            `}
          >
            {loadingUniswapInfo || !uniswapInfo
              ? 'loading...'
              : Number(uniswapInfo?.token1?.totalLiquidity ? uniswapInfo?.token1?.totalLiquidity : 0)?.toLocaleString(
              'en-US'
              ) + ' UOS' ?? '0 UOS'}{' '}
          </span>
        </div>
      </Card>
    </div>
  )
}

const Card = styled.div`
  width: 100%;
  height: 104px;
  background: #3C3846;
  border-radius: 4px;
  padding: 20px 24px;
`

const ActionButton = styled.button`
  position: relative;
  border: 0;
  border-radius: 4px;
  padding: 0;
  width: 100%;
  height: 44px;
  cursor: pointer;
  background: #A481F0;
  color: #ffffff;
  font-weight: bold;
  mix-blend-mode: normal;
  box-shadow: 0px 2px 2px rgba(87, 95, 119, 0.15);
  &:active {
    top: 1px;
  }
`
