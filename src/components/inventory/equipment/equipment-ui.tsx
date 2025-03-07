'use client'

import { useState } from 'react'

export interface EquippedItem {
  [key: string]: any
}

export function Equipments({ equippedItems }: { equippedItems: EquippedItem }) {
    return (
        <div className="flex flex-col items-center gap-2 w-1/3 h-full">
            <h2 className="text-xl font-bold">장비</h2>
            <div className="grid grid-cols-3 gap-2 w-48">
                <div className="col-start-2">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems.Head ? (
                            <img src={equippedItems.Head.account.data.parsed.info.image} 
                                 alt="Head" 
                                 className="w-full h-full object-cover" />
                        ) : 'Head'}
                    </div>
                </div>
                <div className="col-start-1 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems['L-Hand'] ? (
                            <img src={equippedItems['L-Hand'].account.data.parsed.info.image} 
                                 alt="L-Hand" 
                                 className="w-full h-full object-cover" />
                        ) : 'L-Hand'}
                    </div>
                </div>
                <div className="col-start-2 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems.Body ? (
                            <img src={equippedItems.Body.account.data.parsed.info.image} 
                                 alt="Body" 
                                 className="w-full h-full object-cover" />
                        ) : 'Body'}
                    </div>
                </div>
                <div className="col-start-3 col-span-1">
                    <div className="w-14 h-14 border-2 border-gray-400 rounded flex items-center justify-center">
                        {equippedItems['R-Hand'] ? (
                            <img src={equippedItems['R-Hand'].account.data.parsed.info.image} 
                                 alt="R-Hand" 
                                 className="w-full h-full object-cover" />
                        ) : 'R-Hand'}
                    </div>
                </div>
            </div>
        </div>
    )
}