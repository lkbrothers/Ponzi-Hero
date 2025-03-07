'use client'

import { useState } from 'react'
import { ParsedAccountData } from '@solana/web3.js'
import { NftCardDetail } from './item-detail'
import { SelectedNftInteraction } from './item-card'
import nftimg from '../../../assets/nft.png'

import commonFrame from '../../../assets/frame/comm.png'
import rareFrame from '../../../assets/frame/rare.png'
import epicFrame from '../../../assets/frame/epic.png'
import legendaryFrame from '../../../assets/frame/legen.png'

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
    const [currentPage, setCurrentPage] = useState(0);
    
    const itemsPerPage = 16; // 4x4 그리드
    const totalPages = Math.ceil(nfts.length / itemsPerPage);
    
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

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
    
    // 현재 페이지에 표시할 NFT 계산
    const currentNfts = nfts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    
    // 4x4 그리드를 위한 배열 생성 (빈 칸 포함)
    const gridItems = Array(15).fill(null).map((_, index) => {
        return index < currentNfts.length ? currentNfts[index] : null;
    });

    return (
        <div className="flex flex-col items-center gap-8 w-1/2 h-full">
            <div className="flex flex-col items-center gap-2 w-full">
                
                <div className="grid grid-cols-5 gap-2 justify-center">
                    {tokens.length > 0 ? tokens.map((token, i) => (
                        <div key={i} className="w-[6vw] h-[6vw] border-2 border-gray-400 rounded flex items-center justify-center">
                            <div className="text-xs text-center">
                                <p>수량: {(token.account.data as ParsedAccountData).parsed.info.tokenAmount.uiAmount}</p>
                            </div>
                        </div>
                    )) : gridItems.map((nft, i) => (
                        <div 
                            key={i + currentPage * itemsPerPage} 
                            className={`w-[6vw] h-[6vw] 
                                ${nft && isEquipped(nft) ? 'border-yellow-400' : 'border-gray-400'} rounded flex items-center justify-center overflow-hidden relative
                                `}
                            
                            onMouseEnter={(e) => nft && handleMouseEnter(nft, e)}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => nft && handleNftClick(nft)}
                        >
                            {nft ? (
                                <div className="flex flex-col items-center justify-center w-full h-full">
                                    <Frame nft={nft} />
                                    <img 
                                        src={nft.account.data.parsed.info.image || nftimg.src} 
                                        alt={nft.account.data.parsed.info.name || `아이템 #${i + 1 + currentPage * itemsPerPage}`}
                                        className="w-[90%] h-[90%] object-cover z-10"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                </div>
                            )}
                            {nft && isEquipped(nft) && (
                                <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-1">장착</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex gap-4 mt-4  py-2">
                    <button 
                        className="btn btn-primary" 
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                    >
                        이전
                    </button>
                    <span className="flex items-center">
                        {currentPage + 1} / {totalPages}
                    </span>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages - 1}
                    >
                        다음
                    </button>
                </div>
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

const Frame = ({ nft }: { nft: any }) => {
    const grade = nft.account.data.parsed.info.grade;
    let frameSrc;
    let gradeText;
    
    if (grade === 'common') {
        frameSrc = commonFrame.src;
        gradeText = 'Common';
    } else if (grade === 'Rare') {
        frameSrc = rareFrame.src;
        gradeText = 'Rare';
    } else if (grade === 'Epic') {
        frameSrc = epicFrame.src;
        gradeText = 'Epic';
    } else {
        frameSrc = legendaryFrame.src;
        gradeText = 'Legendary';
    }
    
    return (
        <div className="absolute top-0 left-0 w-full h-full">
            <img 
                src={frameSrc}
                alt="frame" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute z-20 bottom-1 left-0 w-full text-center text-black text-xs  ">
                {gradeText}
            </div>
        </div>
    )
}