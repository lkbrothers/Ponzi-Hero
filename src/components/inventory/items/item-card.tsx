'use client'

import nftimg from '../../../assets/nft.png'
import { useEffect } from 'react'
import { useInventoryItems } from './item-data-access'
export function SelectedNftInteraction({ 
    nft, 
    clickDetailPosition, 
    selectedClickNft, 
    nfts,
    setNfts,
    setShowClickDetail,
    equippedItems,
    setEquippedItems 
}: { 
    nft: any, 
    clickDetailPosition: { x: number, y: number }, 
    selectedClickNft: any, 
    nfts: any[], 
    setNfts: (nftss: any[]) => void,
    setShowClickDetail: (show: boolean) => void,
    equippedItems: {[key:string]: any},
    setEquippedItems: (items: {[key:string]: any}) => void
}) {

    const { updateEquipItem } = useInventoryItems();
    
    // 컴포넌트 마운트 시와 nfts가 변경될 때 실행
    
    // useEffect(() => {
    //     const loadedEquippedItems = loadEquippedItems();
    //     setEquippedItems(loadedEquippedItems);
    //     console.log("nfts = ", nfts)
    // }, [nfts, setEquippedItems]); // setEquippedItems도 의존성 배열에 추가


    // useEffect(() => {
    //     console.log("equippedItems = ", equippedItems)
    //     console.log("nfts = ", nfts)
    // }, [equippedItems])

    const handleEquip = async () => {
        const type = selectedClickNft.account.part;
        console.log("장착 시작 - 아이템 타입:", type);
        
        let newEquippedItems = { ...equippedItems };
        let fromItemAccountPublicKey = null;
        let toItemAccountPublicKey = selectedClickNft.publicKey;
        
        console.log("현재 장착된 아이템:", equippedItems);
        
        // arms 타입일 경우 L-Hand와 R-Hand에 장착
        if (type === 'arms') {
            console.log("무기 아이템 장착 시도");
            // 왼쪽이 비어있으면 왼쪽에, 왼쪽이 있으면 오른쪽에 장착
            if (!newEquippedItems['L-Hand'] && !newEquippedItems['R-Hand']) {
                console.log("양손 모두 비어있음 - 왼손에 장착");
                newEquippedItems = {
                    ...newEquippedItems,
                    'L-Hand': selectedClickNft,
                };
            } else if (!newEquippedItems['L-Hand'] && newEquippedItems['R-Hand']) {
                console.log("왼손이 비어있고 오른손이 차있음 - 왼손에 장착");
                newEquippedItems = {
                    ...newEquippedItems,
                    'L-Hand': selectedClickNft
                };
            } else if(!newEquippedItems['R-Hand'] && newEquippedItems['L-Hand']){
                console.log("오른손이 비어있고 왼손이 차있음 - 오른손에 장착");
                newEquippedItems = {
                    ...newEquippedItems,
                    'R-Hand': selectedClickNft
                };
            }else if(newEquippedItems['L-Hand'] && newEquippedItems['R-Hand']){
                console.log("양손 모두 차있음 - 왼손 아이템 교체");
                fromItemAccountPublicKey = newEquippedItems['L-Hand'].publicKey;
                newEquippedItems = {
                    ...newEquippedItems,
                    'L-Hand': selectedClickNft
                };
            }
        } else {
            console.log(`일반 아이템 장착 시도 - ${type} 부위`);
            // 일반적인 경우: 해당 부위에만 선택된 NFT를 장착
            if (newEquippedItems[type] && newEquippedItems[type].publicKey) {
                console.log("해당 부위에 이미 장착된 아이템이 있음 - 교체");
                fromItemAccountPublicKey = newEquippedItems[type].publicKey;
            }
            newEquippedItems = {
                ...newEquippedItems,
                [type]: selectedClickNft
            };
        }
        
        console.log("교체될 아이템 PublicKey:", fromItemAccountPublicKey);
        console.log("장착할 아이템 PublicKey:", toItemAccountPublicKey);
        
        try {
            console.log("장착 트랜잭션 시작");
            // 먼저 트랜잭션 실행
            await updateEquipItem(false, true, fromItemAccountPublicKey, toItemAccountPublicKey);
            
            console.log("트랜잭션 성공 - NFT 상태 업데이트");
            // 트랜잭션 성공 후 상태 업데이트
            let updatedNfts = nfts.map((nft) => {
                if (nft.publicKey === fromItemAccountPublicKey) {
                    console.log("이전 아이템 장착 해제");
                    return { ...nft, account: { ...nft.account, equipped: false } };
                }
                if (nft.publicKey === toItemAccountPublicKey) {
                    console.log("새 아이템 장착");
                    return { ...nft, account: { ...nft.account, equipped: true } };
                }
                return nft;
            });
            
            console.log("상태 업데이트 완료");
            // 상태 업데이트
            setNfts([...updatedNfts]);  // 새 배열을 생성하여 참조 변경 확실히 함
            setEquippedItems(newEquippedItems);
            setShowClickDetail(false);
        } catch (error) {
            console.error("장착 중 오류 발생:", error);
            // 오류 처리 로직 추가
        }
    };

    const handleUnequip = async () => {
        const type = selectedClickNft.account.part;
        
        let newEquippedItems = { ...equippedItems };
        
        // arms 타입일 경우 L-Hand와 R-Hand에서 제거
        if (type === 'arms') {
            newEquippedItems = {
                ...newEquippedItems,
                'L-Hand': null,
                'R-Hand': null
            };
        } else {
            // 일반적인 경우: 해당 부위의 장착 아이템만 제거
            newEquippedItems = {
                ...newEquippedItems,
                [type]: null
            };
        }
        
        try {
            // 트랜잭션 실행
            await updateEquipItem(true, false, selectedClickNft.publicKey, null);
            
            // 트랜잭션 성공 후 상태 업데이트
            let updatedNfts = nfts.map((nft) => {
                if (nft.publicKey === selectedClickNft.publicKey) {
                    return { ...nft, account: { ...nft.account, equipped: false } };
                }
                return nft;
            });
            
            // 상태 업데이트
            setNfts([...updatedNfts]);  // 새 배열을 생성하여 참조 변경 확실히 함
            setEquippedItems(newEquippedItems);
            setShowClickDetail(false);
        } catch (error) {
            console.error("장착 해제 중 오류 발생:", error);
            // 오류 처리 로직 추가
        }
    };

    useEffect(() => {
        console.log("equippedItems = ", equippedItems)
    }, [equippedItems])

    // 현재 선택된 NFT가 장착되어 있는지 정확히 확인 (arms 타입 고려)
    const isEquipped = (() => {
        const type = selectedClickNft.account.part;
        
        if (type === 'arms') {
            // arms 타입은 L-Hand 또는 R-Hand 중 하나라도 장착되어 있으면 장착된 것으로 간주
            return (
                (equippedItems['L-Hand'] && 
                 equippedItems['L-Hand'].account &&
                 equippedItems['L-Hand'].account.name === selectedClickNft.account.name) ||
                (equippedItems['R-Hand'] && 
                 equippedItems['R-Hand'].account &&
                 equippedItems['R-Hand'].account.name === selectedClickNft.account.name)
            );
        }
        
        // 일반적인 경우
        return equippedItems[type] && 
               equippedItems[type].account &&
               equippedItems[type].account.name === selectedClickNft.account.name;
    })();

    // IPFS URL 변환 함수
    const getImageUrl = (uri: string) => {
        if (!uri) return nftimg.src;
        
        // IPFS URI 처리
        if (uri.startsWith('ipfs://')) {
            return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }
        
        return uri;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center gap-4 mb-4">
                    <img 
                        src={getImageUrl(selectedClickNft.account.uri) || nftimg.src}
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
                    {selectedClickNft.account.equipped ? (
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