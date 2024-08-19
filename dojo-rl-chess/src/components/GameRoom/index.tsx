import React from 'react'

export const PlayerPanel = ({ownerNamePanel, ownerTimeRemaining}
    :{ownerNamePanel: JSX.Element, ownerTimeRemaining: string}
) => {
    return (
        <div className="w-full p-3 flex items-center
            
            ">{ownerNamePanel}
                <div className="ml-auto mr-8">{ownerTimeRemaining}</div>
        </div>
    )
}
