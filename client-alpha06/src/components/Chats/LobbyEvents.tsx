import React, {useState} from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';


export const LobbyEvents = () => {
    const [game, setGame] = useState(new Chess());
    const onDrop = (sourceSquare: string, targetSquare: string) => {

        const move = game.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q',
        });

        if (move === null) return false;
        setGame(new Chess(game.fen()));
        return true
    }
    return (
        <div className="border-2 border-purple-700
                        w-[550px] h-full
                        flex flex-col justify-start items-center
                        p-2 px-4
                        ">

                            <div className="
                            w-full px-2 py-1 font-semibold
                            mb-2
                            ">
                                Featured Game
                            </div>

                            <div className="border-2 border-orange-900
                            w-full h-fit
                            rounded-lg overflow-hidden
                            ">
                                <Chessboard 
                                    position={game.fen()} 
                                    onPieceDrop={onDrop}
                                    boardOrientation={'white'}
                                    customDarkSquareStyle={{
                                        backgroundColor: "#779952"
                                    }} customLightSquareStyle={{
                                        backgroundColor: "#edeed1"
                                    }} 
                                />
                            </div>
                        </div>
    )
}
