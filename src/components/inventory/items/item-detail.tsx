'use client'

export function NftCardDetail({ nft, detailPosition, selectedNft, nfts }: { 
    nft: any, 
    detailPosition: { x: number, y: number }, 
    selectedNft: any, 
    nfts: any[] 
}) {
    return (
        <div 
            className="fixed bg-black bg-opacity-90 text-white p-3 rounded-md z-50 shadow-lg"
            style={{ 
                left: `${detailPosition.x}px`, 
                top: `${detailPosition.y}px`,
                maxWidth: '250px'
            }}
        >
            <p className="font-bold text-sm">{selectedNft.account.data.parsed.info.name || `전설의 아이템 #${nfts.indexOf(selectedNft) + 1}`}</p>
            <p className="text-xs mt-1">{selectedNft.account.data.parsed.info.description || "희귀한 전설의 아이템입니다"}</p>
            {selectedNft.attributes && (
                <div className="mt-2">
                    <p className="text-xs font-semibold">속성:</p>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                        {selectedNft.attributes.map((attr: any, index: number) => (
                            <p key={index} className="text-xs">
                                <span className="text-gray-400">{attr.trait_type}:</span> {attr.value}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}