import * as React from 'react';
import { useGameContainer, useSetGameContainer } from './GameContainer';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { handleResponse } from '../utils/remoteFetch';
import Loading from '../utils/Loading';
import { useEffect, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { Navigate, useLocation } from 'react-router-dom';

export function RequireGameContainer({ children }: { children: React.ReactNode }): React.ReactElement {
  const container = useGameContainer();
  const setContainer = useSetGameContainer();
  const [redir,setREDIR] = useState(false)
  console.log("Opening containter")
  const id = useLocation().pathname.replace("/game/", "")
  console.log(id)
  useEffect(() => {
    if (!container && !redir) {
      const myHeaders = new Headers({
        'Content-Type': 'application/json',
      });
      fetch('/api/game/'+ id, {
        mode: 'same-origin',
        method: 'GET',
        headers: myHeaders,
      }).then(handleResponse).then(
        (data) => {
          console.log(data)
          if (data.title){
            throw data
          }
          console.log(data.game);
          setContainer({
            id: data.game.lobbyId,
            grid: parseInt(data.game.gridSize),
            openingRules: data.game.openingRule,
            variant: data.game.variant,
          });
        },
      ).catch((err) => {
        console.log(err);
        setREDIR(true)
      });
    }
  });
  if (container) {
    return <>{children}</>;
  }
  if (redir) {
    return <Navigate to="/" replace={true}/>
  }else{
    return <Loading expose={true} message={"Fetching desired game"} />;
  }


}