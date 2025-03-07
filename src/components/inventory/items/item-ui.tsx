'use client'

import { useState } from 'react'
import { ParsedAccountData } from '@solana/web3.js'
import { NftCardDetail } from './item-detail'
import { SelectedNftInteraction } from './item-card'
import nftimg from '../../../assets/nft.png'

export function Inventory({ tokens, nfts, equippedItems, setEquippedItems }: { 
    tokens: any[], 
    nfts: any[], 
    equippedItems: {[key:string]: any},
    setEquippedItems: (items: {[key:string]: any}) => void 
}) {
    const [showDetail, setShowDetail] = useState(false);
    const [detailPosition, setDetailPosition] = useState({ x: 0, y: 0 });
    const [selectedNft, setSelectedNft] = useState<any>(null);
    const [showClickDetail, setShowClickDetail] = useState(false);
    const [clickDetailPosition, setClickDetailPosition] = useState({ x: 0, y: 0 });
    const [selectedClickNft, setSelectedClickNft] = useState<any>(null);

    const handleMouseEnter = (nft: any, e: React.MouseEvent) => {
        setSelectedNft(nft);
        setDetailPosition({ x: e.clientX, y: e.clientY });
        setShowDetail(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        setDetailPosition({ x: e.clientX + 15, y: e.clientY + 15 });  
    };

    const handleMouseLeave = () => {
        setShowDetail(false);
    };

    const handleNftClick = (nft: any) => {
        setSelectedClickNft(nft);
        setClickDetailPosition({ x: 0, y: 0 });
        setShowClickDetail(true);
    };

    const isEquipped = (nft: any) => {
        return Object.values(equippedItems).some(item => 
            item && item.account.data.parsed.info.mint === nft.account.data.parsed.info.mint
        );
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col items-center gap-4 w-full max-h-[65vh] overflow-y-auto pr-2">
                <h2 className="text-xl font-bold top-0 bg-base-100 py-2 z-10">인벤토리</h2>
                
                <div className="flex flex-wrap justify-center">
                    {tokens.length > 0 ? tokens.map((token, i) => (
                        <div key={i} className="w-16 h-16 border-2 border-gray-400 rounded flex items-center justify-center">
                            <div className="text-xs text-center">
                                <p>수량: {(token.account.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount}</p>
                            </div>
                        </div>
                    )) : [...Array(20)].map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-[250px] h-[304px] border-2 
                                rounded-[30px]
                                ${nfts[i] && isEquipped(nfts[i]) ? 'border-yellow-400' : 'border-gray-400'} rounded flex items-center justify-center overflow-hidden relative m-2`}
                            onMouseEnter={(e) => nfts[i] && handleMouseEnter(nfts[i], e)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => nfts[i] && handleNftClick(nfts[i])}
                        >
                            {nfts[i] && (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    <img 
                                        src={nfts[i].account.data.parsed.info.image || nftimg.src} 
                                        alt={nfts[i].account.data.parsed.info.name || `아이템 #${i + 1}`}
                                        className="w-full h-1/2 object-cover"
                                    />
                                    <div className="flex flex-col items-center justify-center w-full h-1/2">
                                        <p className="text-xs text-center">{nfts[i].account.data.parsed.info.name}</p>
                                    </div>
                                </div>
                            )}
                            {nfts[i] && isEquipped(nfts[i]) && (
                                <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-1">장착</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* <div className="flex gap-4 mt-4 sticky bottom-0 bg-base-100 py-2">
                    <button className="btn btn-primary">이전</button>
                    <button className="btn btn-primary">다음</button>
                </div> */}
            </div>

            {showDetail && selectedNft && (
                <NftCardDetail nft={selectedNft} detailPosition={detailPosition} selectedNft={selectedNft} nfts={nfts} />
            )}

            {showClickDetail && selectedClickNft && (
                <SelectedNftInteraction 
                    nft={selectedClickNft} 
                    clickDetailPosition={clickDetailPosition} 
                    selectedClickNft={selectedClickNft} 
                    nfts={nfts} 
                    setShowClickDetail={setShowClickDetail}
                    equippedItems={equippedItems}
                    setEquippedItems={setEquippedItems}
                />
            )}
        </div>
    )
}