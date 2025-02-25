'use client'

import { Keypair, Cluster, PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useGachaProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()

  const accounts = useQuery({
    queryKey: ['gacha', 'all', { cluster }],
    queryFn: () => [],
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(new PublicKey('11111111111111111111111111111111')),
  })

  return {
    accounts,
    getProgramAccount,
  }
}

export function GachaExplain(){
    return (
        <div className="flex flex-col gap-4">
            <button className="btn btn-lg btn-primary w-full text-2xl font-bold">How it works?</button>
            <button className="btn btn-lg btn-primary w-full text-2xl font-bold">Check my history</button>
        </div>
    )
}

export function GachaCreate() {
  const { connected } = useWallet()

  return (
    <button
      className="btn btn-lg btn-black w-[80vh] h-[60vh] text-2xl font-bold"
      disabled={!connected}
    >
      {connected ? '가챠 뽑기' : '지갑을 연결해주세요'}
    </button>
  )
}

export function GachaList() {
  const { accounts, getProgramAccount } = useGachaProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>프로그램 계정을 찾을 수 없습니다. 프로그램이 배포되었고 올바른 클러스터에 있는지 확인하세요.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <div key={account.publicKey.toString()} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">가챠 #{account.publicKey.toString().slice(0, 8)}</h2>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">뽑기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>가챠가 없습니다</h2>
          위에서 새로운 가챠를 생성해주세요.
        </div>
      )}
    </div>
  )
}
