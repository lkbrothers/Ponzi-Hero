'use client'

import nftimg from '../../../assets/nft.png'

export function SelectedNftInteraction({ 
    nft, 
    clickDetailPosition, 
    selectedClickNft, 
    nfts, 
    setShowClickDetail,
    equippedItems,
    setEquippedItems 
}: { 
    nft: any, 
    clickDetailPosition: { x: number, y: number }, 
    selectedClickNft: any, 
    nfts: any[], 
    setShowClickDetail: (show: boolean) => void,
    equippedItems: {[key:string]: any},
    setEquippedItems: (items: {[key:string]: any}) => void
}) {
    const handleEquip = () => {
        const type = selectedClickNft.account.part;
        setEquippedItems({
            ...equippedItems,
            [type]: selectedClickNft
        });

        //equip 트랜잭션 실행
        setShowClickDetail(false);
    };

    const handleUnequip = () => {
        const type = selectedClickNft.account.part;
        setEquippedItems({
            ...equippedItems,
            [type]: null
        });

        //unequip 트랜잭션 실행
        setShowClickDetail(false);
    };

    const isEquipped = Object.values(equippedItems).some(item => 
        item && item.account.equipped === selectedClickNft.account.equipped
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center gap-4 mb-4">
                    <img 
                        src={selectedClickNft.account.uri || nftimg.src}
                        alt="NFT"
                        className="w-24 h-24 object-cover rounded"
                    />
                    <div>
                        <h3 className="text-xl font-bold">{selectedClickNft.account.name || `전설의 아이템 #${nfts.indexOf(selectedClickNft) + 1}`}</h3>
                        <p className="text-sm text-gray-600">{selectedClickNft.account.description}</p>
                        <p className="text-sm text-gray-600">등급: {selectedClickNft.account.grade}</p>
                        <p className="text-sm text-gray-600">타입: {selectedClickNft.account.part}</p>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                    {isEquipped ? (
                        <button className="btn btn-warning" onClick={handleUnequip}>장착 해제</button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleEquip}>장착하기</button>
                    )}
                    <button className="btn" onClick={() => setShowClickDetail(false)}>닫기</button>
                </div>
            </div>
        </div>
    )
}