'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero, ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useProgram } from './game-data-access'
import { GameInit, GameList } from './game-ui'

export default function GameFeature() {
    const { publicKey } = useWallet()
    const { gameProgramId, codeInProgramId, transferProgramId } = useProgram()

    return (
        publicKey ? (
            <div>
                <AppHero
                    title="Game"
                    subtitle={""}
                >
                    <p className="mb-6">
                        <ExplorerLink path={`account/${gameProgramId}`} label={ellipsify(gameProgramId.toString())} />
                    </p>
                    <GameInit userPublicKey={publicKey} />
                </AppHero>
                <GameList userPublicKey={publicKey} />
            </div>
        ) : (
            <div className="max-w-4xl mx-auto">
                <div className="hero py-[64px]">
                    <div className="hero-content text-center">
                        <WalletButton />
                    </div>
                </div>
            </div>
        )
    )
}
