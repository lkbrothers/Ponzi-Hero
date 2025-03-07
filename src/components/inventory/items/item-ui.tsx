'use client'

import { useState, useEffect } from 'react'
import { ParsedAccountData } from '@solana/web3.js'
import { NftCardDetail } from './item-detail'
import { SelectedNftInteraction } from './item-card'
import nftimg from '../../../assets/nft.png'

import commonFrame from '../../../assets/frame/comm.png'
import rareFrame from '../../../assets/frame/rare.png'
import epicFrame from '../../../assets/frame/epic.png'
import uniqueFrame from '../../../assets/frame/unique.png'
import legendaryFrame from '../../../assets/frame/legen.png'
import degendaryFrame from '../../../assets/frame/degen.png'

export function Inventory({ tokens, nfts,setNfts, equippedItems, setEquippedItems }: { 
    tokens: any[], 
    nfts: any[], 
    setNfts: (nfts: any[]) => void,
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
    const [nftImages, setNftImages] = useState<{[key: string]: string}>({});
    
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
        // NFT의 고유 식별자(mint 또는 id)를 사용하여 장착 여부 확인
        return Object.values(equippedItems).some(item => 
            item && (item.account.mint === nft.account.mint || item.account.id === nft.account.id)
        );
    };
    
    // 현재 페이지에 표시할 NFT 계산
    const currentNfts = nfts.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    
    // 4x4 그리드를 위한 배열 생성 (빈 칸 포함)
    const gridItems = Array(15).fill(null).map((_, index) => {
        return index < currentNfts.length ? currentNfts[index] : null;
    });

    // NFT 메타데이터에서 이미지 URL 가져오기
    useEffect(() => {
        const fetchNftMetadata = async () => {
            const imageUrls: {[key: string]: string} = {};
            
            for (const nft of nfts) {
                if (nft.account.uri) {
                    try {
                        const metadataUrl = getImageUrl(nft.account.uri);
                        const response = await fetch(metadataUrl);
                        const metadata = await response.json();
                        
                        if (metadata.image) {
                            imageUrls[nft.account.mint || nft.account.id] = getImageUrl(metadata.image);
                        }
                    } catch (error) {
                        console.error('메타데이터 가져오기 실패:', error);
                    }
                }
            }
            
            setNftImages(imageUrls);
        };
        
        fetchNftMetadata();
    }, [nfts]);



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
                                        src={nftImages[nft.account.mint || nft.account.id] || nft.account.uri ? getImageUrl(nft.account.uri) : nftimg.src} 
                                        alt={nft.account.name || `아이템 #${i + 1 + currentPage * itemsPerPage}`}
                                        className="w-[90%] h-[90%] object-cover z-10"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                </div>
                            )}
                            {nft && nft.account.equipped && (
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
                    setNfts={setNfts}
                />
            )}
        </div>
    )
}

const Frame = ({ nft }: { nft: any }) => {
    const grade = nft.account.grade;
    let frameSrc;
    let gradeText;
    if (grade == 'common' || grade == 'NORMAL') {
        frameSrc = commonFrame.src;
        gradeText = 'Normal';
    } else if (grade == 'RARE') {
        frameSrc = rareFrame.src;
        gradeText = 'Rare';
    } else if (grade == 'EPIC') {
        frameSrc = epicFrame.src;
        gradeText = 'Epic';

    }else if(grade == 'UNIQUE') {
        frameSrc = uniqueFrame.src;
        gradeText = 'Unique';
    } else if (grade == 'LEGENDARY') {
        frameSrc = legendaryFrame.src;
        gradeText = 'Legendary';
    } else if (grade == 'DEGENDARY') {
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

// IPFS URI를 HTTP URL로 변환하는 함수 추가
export function getImageUrl(uri: string) {
    if (!uri) return nftimg.src;
    
    // IPFS URI 처리 (ipfs://로 시작하는 경우)
    if (uri.startsWith('ipfs://')) {
        // IPFS 게이트웨이 사용 (여러 옵션 중 선택 가능)
        const ipfsGateway = 'https://ipfs.io/ipfs/';
        const cid = uri.replace('ipfs://', '');
        return `${ipfsGateway}${cid}`;
    }
    
    // 이미 HTTP/HTTPS URL인 경우 그대로 반환
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
        return uri;
    }
    
    // 기타 경우 기본 이미지 반환
    return nftimg.src;
}