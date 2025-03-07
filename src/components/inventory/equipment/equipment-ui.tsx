'use client'

import { useState } from 'react'
import emptyEquipment from '../../../assets/emptyEquipment.png'
export interface EquippedItem {
  [key: string]: any
}

export function Equipments({ equippedItems }: { equippedItems: EquippedItem }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 w-1/2 h-full">
            <div className="grid grid-cols-3 w-[24vw]">
                <div className="col-start-2">
                    <div className="w-[8vw] h-[8vw] border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems.Head ? (
                            <img src={equippedItems.Head.account.data.parsed.info.image} 
                                 alt="Head" 
                                 className="w-full h-full object-cover" />
                        ) : <EmptyEquipment />}
                    </div>
                </div>
                <div className="col-start-1 col-span-1">
                    <div className="w-[8vw] h-[8vw] border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems['L-Hand'] ? (
                            <img src={equippedItems['L-Hand'].account.data.parsed.info.image} 
                                 alt="L-Hand" 
                                 className="w-full h-full object-cover" />
                        ) : <EmptyEquipment />}
                    </div>
                </div>
                <div className="col-start-2 col-span-1">
                    <div className="w-[8vw] h-[8vw] border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems.Body ? (
                            <img src={equippedItems.Body.account.data.parsed.info.image} 
                                 alt="Body" 
                                 className="w-full h-full object-cover" />
                        ) : <EmptyEquipment />}
                    </div>
                </div>
                <div className="col-start-3 col-span-1">
                    <div className="w-[8vw] h-[8vw] border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems['R-Hand'] ? (
                            <img src={equippedItems['R-Hand'].account.data.parsed.info.image} 
                                 alt="R-Hand" 
                                 className="w-full h-full object-cover" />
                        ) : <EmptyEquipment />}
                    </div>
                </div>
            </div>
        </div>
    )
}

const EmptyEquipment = () => {
    return (
        <img src={emptyEquipment.src} alt="emptyEquipment" className="w-full h-full object-cover" />
    )
}