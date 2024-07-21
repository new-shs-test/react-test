import { useEffect, useReducer, useState } from 'react';
import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Popup from 'reactjs-popup';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Navigate } from 'react-router-dom';
import Loading from '../utils/Loading';
import { handleResponse } from '../utils/remoteFetch';

type State =
  | { tag: 'requesting', path: string, options: { method: string, body?: string }, forfeit: boolean }
  | { tag: 'input' }
  | { tag: 'warning' }
  | { tag: 'redirect', path: string }
  | { tag: 'failed', error: string }

type Action =
  | { type: 'dismiss' }
  | { type: 'warn' }
  | { type: 'fetch', path: string, options: { method: string, body?: string, }, forfeit: boolean }
  | { type: 'success', gameId: string }
  | { type: 'error', message: string }


function logUnexpectedAction(state: State, action: Action) {
  console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}

function reduce(state: State, action: Action): State {
  switch (state.tag) {
    case 'input':
      if (action.type == 'fetch') {
        return { tag: 'requesting', path: action.path, options: action.options, forfeit: action.forfeit };
      } else {
        logUnexpectedAction(state, action);
        return state;
      }
    case 'requesting':
      if (action.type == 'success') {
        if (state.forfeit) return {
          tag:'requesting',
          path:"/api/game/quit/" + action.gameId,
          options:{method:"POST"},
          forfeit:false}
        return { tag: 'redirect', path: '/game/' + action.gameId };
      } else if (action.type == 'warn') {
        return { tag: 'warning' };
      } else if (action.type == 'error') {
        return { tag: 'failed', error: action.message };
      } else {
        logUnexpectedAction(state, action);
        return state;
      }
    case 'warning':
      if (action.type == 'dismiss') {
        return { tag: 'input' };
      } else if (action.type == 'fetch'){
        return {tag: 'requesting',path:action.path,options:action.options,forfeit:action.forfeit}
      }
      else{
        logUnexpectedAction(state, action);
        return state;
      }
    case 'failed':
      if (action.type == 'fetch') {
        return { tag: 'requesting', path: action.path, options: action.options, forfeit: action.forfeit };
      } else {
        logUnexpectedAction(state, action);
        return state;
      }

  }
}

export function GameSetup() {
  const [state, dispatch] =
    useReducer(
      reduce,
      {
        tag: 'input',
      });
  const [gameVariant, setVariant] = useState('STANDARD');
  const [gameRule, setRules] = useState('STANDARD');
  const [gameGrid, setGrid] = useState('15');

  function handleVariantChange(ev: React.SyntheticEvent<HTMLSelectElement>) {
    setVariant(ev.currentTarget.value);
  }

  function handleRuleChange(ev: React.SyntheticEvent<HTMLSelectElement>) {
    setRules(ev.currentTarget.value);
  }

  function handleGridChange(ev: React.SyntheticEvent<HTMLSelectElement>) {
    setGrid(ev.currentTarget.value);
  }

  function buildBody(gameGrid: string, gameRule: string, gameVariant: string) {
    const gameOptions = {
      grid: gameGrid,
      openingRule: gameRule,
      variant: gameVariant,
    };
    return JSON.stringify(gameOptions);
  }

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    //Make startgame request

    //if success navigate to game screen

    //if failed activate pop-up
    console.log(buildBody(gameGrid, gameRule, gameVariant));
    dispatch({
      type: 'fetch', path: '/api/game/start',
      options: {
        method: 'POST',
        body: buildBody(gameGrid, gameRule, gameVariant),
      }, forfeit: false,
    });
  }
  function handleResult(data: {title:string,game:{lobbyId: string;},waitingOpponentPieces:{lobbyId:string},awaitingOpponent: {lobbyId:string}}) {
      const error = data.title
      if (error) {//if error
        if (error == 'Already in a game') {
          dispatch({ type: 'warn'});
        } else dispatch({ type: 'error', message: data.title });
      }else {
        console.log(data)
       if (data.game){
         dispatch({type:"success",gameId: data.game?.lobbyId})
       }else {
         if (data.waitingOpponentPieces){
           dispatch({type:"success",gameId:data.waitingOpponentPieces.lobbyId})
         }else {
           dispatch({type:"success",gameId:data.awaitingOpponent.lobbyId})
         }

       }

      }
  }
  useEffect(() => {
    if (state.tag == 'requesting') {
      console.log(state.options.body);
      const myHeaders = new Headers({
        'Content-Type': 'application/json',
      })
      fetch(state.path, {
          mode: 'same-origin',
          method: state.options.method,
          headers: myHeaders,
          body: state.options.body,
        },
      )
        .then(handleResponse)
        .then(handleResult)
        .catch((err) => {
          console.log('failed');
          console.log(err);
          dispatch({ type: 'error', message: err.message });
        },
      );
    }
  }, [state]);
  if (state.tag == 'redirect'){
    console.log(state.path)
    return <Navigate to={state.path} replace={true}/>
  }

  return (
    <div>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor='game-variant'>Choose a variant:</label>
          <select name='game-variant' id='game-variant' onChange={handleVariantChange}>
            <option value='STANDARD'>Standard</option>
          </select>
          <br />
          <label htmlFor='game-rules'>Choose the opening rules:</label>
          <select name='game-rules' id='game-rules' onChange={handleRuleChange}>
            <option value='STANDARD'>Standard</option>
            <option value='SWAP2'>Swap2</option>
          </select>
          <br />
          <label htmlFor='game-grid'>Choose the grid size:</label>
          <select name='game-grid' id='game-grid' onChange={handleGridChange}>
            <option value={'15'}>15</option>
            <option value={'19'}>19</option>
          </select>
          <div>
            <button type='submit'>StartGame</button>
          </div>

        </form>
      </div>
      {state?.tag === 'failed' && state.error}
      <Loading expose={state.tag == 'requesting'}/>
      <div>
        <Popup open={state.tag === 'warning'} closeOnDocumentClick={false}>
          <div className='warning-playing'>
            <a className='close' onClick={() => dispatch({ type: 'dismiss' })}>
              &times;
            </a>
            <div>
              <h3>
                It seems as though you are already in a running game, do you wish to keep playing it?
              </h3>
            </div>
            <button onClick={()=>{
              dispatch(
                {type:'fetch', path:'/api/game/active-match',options:{method: 'GET'},forfeit: false})}}>
              Keep playing!
            </button>
            <br />
            <button onClick={()=>{
              dispatch(
                {type:'fetch', path:'/api/game/active-match',options:{method: 'GET'},forfeit: true})}}
            >
              Quit!
              (This action can concede the win to your opponent)
            </button>
          </div>
        </Popup>
      </div>
    </div>

  );
}