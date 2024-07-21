import * as React from 'react';
import { createContext, useContext, useState } from 'react';

export type GameDetails = {
  id: string,
  grid: number,
  openingRules: string,
  variant: string
}

type GameContextType = {
  game: GameDetails | undefined,
  setDetails: (d: GameDetails | undefined) => void
}

const GameInfoContext = createContext<GameContextType>(
  {
    game:undefined,
    setDetails : () => {}
  }
)
export function GameContainer({children}: {children:React.ReactNode}){
  console.log("Game Container")
  const [gameDetails, setGameDetails] = useState(undefined)
  return(
    <GameInfoContext.Provider value={{game:gameDetails,setDetails:setGameDetails}}>
      {children}
    </GameInfoContext.Provider>
  )
}

export function useGameContainer(){

  return   useContext(GameInfoContext).game
}
export function useSetGameContainer(){
  return useContext(GameInfoContext).setDetails
}