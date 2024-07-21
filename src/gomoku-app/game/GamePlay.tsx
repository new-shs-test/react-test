// GamePlay.js


import './GamePlay.css';
import * as React from 'react';
import { useEffect, useReducer, useState } from 'react';
import { useGameContainer } from './GameContainer';
import { handleResponse } from '../utils/remoteFetch';
import Loading from '../utils/Loading';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Popup from 'reactjs-popup';
import { useCurrentUser } from '../authentication/Authn';
import { UserInfo } from '../statistics/UserInfo';
import { DrawStats } from '../statistics/DrawStats';


type State =
  | { tag: 'requesting', path: string, options: { method: string, body?: string } }
  | { tag: 'waiting', path:string,message: string }
  | { tag: 'presenting' , goPiece?:string, winner?:string}
  | { tag: 'failed',message:string ,forceRefresh:boolean}

type Action =
  | { type: 'request', path: string, body?: string }
  | { type: 'wait',path:string, message: string }
  | { type: 'error', message: string,forceRefresh:boolean }
  | { type: 'success' ,goPiece?:string,winner?:string}
  | {type:  'dismiss'}

type Position = {
  lin:string,
  col:string
}
type GoPiece = 'WHITE' | 'BLACK'

type Move = {
  goPiece:GoPiece,
  position: Position
}

type DataTemplate = {
  winner?:string,
  playerPiece?:string,
  desiredPieces?:string,
  isPlayerTurn?:boolean,
  moves?:Move[]
}
type ApiRes= {
  awaitingOpponent:DataTemplate,
  waitingOpponentPieces:DataTemplate,
  gameEnded:DataTemplate,
  gameRunning:DataTemplate,
  gameOpened:DataTemplate,
  playMade:DataTemplate,
  lobbyClosed:DataTemplate,
  opponent:UserInfo,
  title:string,
  type:string
}

function logUnexpectedAction(state: State, action: Action) {
  console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}

function reduce(state: State, action: Action): State {
  switch (state.tag) {
    case "requesting":
      if (action.type == 'wait'){
        return  {tag: 'waiting', path:action.path, message:action.message}
      }else if(action.type == 'error'){
        return {tag:'failed',message:action.message, forceRefresh:action.forceRefresh}
      }else if(action.type == 'success'){
        return {tag:'presenting',goPiece: action.goPiece,winner:action.winner}
      }else{
        logUnexpectedAction(state, action);
        return state;
      }
    case "waiting":
      if (action.type == 'success'){
        return {tag:"presenting",goPiece:action.goPiece,winner:action.winner}
      }
      else if(action.type == 'error'){
        return {tag:'failed',message:action.message,forceRefresh:action.forceRefresh}
      }else if(action.type == 'wait'){
        return state
      }else if (action.type == 'request'){
        return {tag:'requesting',path:action.path,options:{method:'POST'}}
      }else {
        logUnexpectedAction(state, action);
        return state;
      }
    case "presenting":
      if (action.type == 'request'){
        return {tag:'requesting',path:action.path,options:{method:'POST', body:action.body}}
      }else {
        logUnexpectedAction(state, action);
        return state;
      }

    case 'failed':
      if (action.type == 'dismiss'){
        return {tag:'presenting'}
      }
      else{
        logUnexpectedAction(state, action);
        return state;
      }

  }
  return;
}


export function GamePlay() {
  const gameDetails = useGameContainer();
  const user = useCurrentUser()
  const [opponent,setOpponent] = useState(undefined)
  const [state, dispatch] =
    useReducer(
      reduce,
      { tag: 'requesting', path: '/api/game/' + gameDetails.id + "/state", options: { method: 'GET' } },
    );
  const [board, setBoard] =
    useState<Array<Array<string | null>>>(Array(gameDetails.grid).fill(Array(gameDetails.grid).fill(null)));


  const [pair, setPair] =
    useState<{ first: number; second: number }>(undefined);
 // const [isXNext, setIsXNext] = useState<boolean>(true);

  function refreshBoard(moves: Move[]) {
    if (moves){
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map(row => [...row]);
        moves.forEach((move) => {
          newBoard[parseInt(move.position.lin)][parseInt(move.position.col)] = move.goPiece;
        });
        return newBoard;
      });
    }
  }

  function handleResult(data:ApiRes) {
    if (!opponent && data.opponent){
      setOpponent(data.opponent)
    }
      if (data.awaitingOpponent) {
        dispatch({ type: 'wait', path: '/api/game/' + gameDetails.id + "/state", message: 'Waiting for opponent' });
        return true
      }
      if (data.gameRunning) {
        console.log(data.gameRunning)
        if (data.gameRunning.isPlayerTurn) {
          refreshBoard(data.gameRunning.moves);
          dispatch({ type: 'success',goPiece: data.gameRunning.playerPiece })
          if (!opponent && data.opponent){
            setOpponent(data.opponent)
          }
          return false
        } else {
          //Go into waiting for opponent
          if (state.tag != 'waiting') {
            refreshBoard(data.gameRunning.moves)
            dispatch({ type: 'wait', path: '/api/game/' + gameDetails.id + "/state", message: 'Waiting for opponent play' })
          }
          console.log("Polling for opponent play")
          return true
        }
      }
      if (data.playMade){
        dispatch({ type: 'wait', path: '/api/game/' + gameDetails.id + "/state", message: 'Waiting for opponent' });
        return true
      }
      if (data.gameEnded){
        console.log(data.gameEnded)
        dispatch({type:'success',goPiece:data.gameEnded.playerPiece,winner:data.gameEnded.winner})
        refreshBoard(data.gameEnded.moves)
        return false
      }
      if (data.type != 'basic') {
        dispatch({ type: 'error', message: data.title ,forceRefresh:false})
      }
      dispatch({ type: 'error', message: 'Error: Unexpected server response',forceRefresh:true });
      console.log(data)
  }

  function apiFetch(path:string,method:string,myHeaders: Headers,body?:string) {
    return fetch(path, {
        mode: 'same-origin',
        method: method,
        headers: myHeaders,
        body: body,
      }).then(handleResponse)
        .then(handleResult)
        .catch((err) => {
            console.log('failed');
            console.log(err);
            dispatch({ type: 'error', message: err.message,forceRefresh:true });
            return false
          },
        );
  }

  useEffect(() => {
    const myHeaders = new Headers({
      'Content-Type': 'application/json',
    });
    if (state.tag == 'requesting') {
      apiFetch(state.path,state.options.method,myHeaders,state.options.body);
    }
    if (state.tag == 'waiting'){
      let canFetch = true
      const pol = setInterval(async () => {
        if (canFetch){
          canFetch = false
          canFetch =  await apiFetch(state.path,'GET',myHeaders);
        }
      }, 2000);
      return () => {
        clearInterval(pol)
      }
    }
  });

  function updateBoard(rowIndex: number,colIndex: number) {
    if (board[rowIndex][colIndex] === null) {
      setPair({ first:rowIndex, second:colIndex })
      setBoard((prevBoard) => {
        const newBoard = prevBoard.map(row => [...row])
        if (state.tag == 'presenting'){
          console.log(state.goPiece)
          newBoard[rowIndex][colIndex] = state.goPiece
          return newBoard
        }
      });
    }else {
      setBoard((prevBoard)=>{
        const newBoard = prevBoard.map(row => [...row])
        newBoard[rowIndex][colIndex] = null
        return newBoard
      })
    }
  }
  function handleClick( row: number,col: number) {
    if (state.tag == 'presenting' && !state.winner) {
      updateBoard(row, col);
      console.log(row,col)
      dispatch({
        type: 'request',
        path:"/api/game/play/" + gameDetails.id,
        body:JSON.stringify({
          lin:row,
          col:col
        })})
    }
  }
  function handleDismiss() {
    dispatch({ type: 'dismiss' });
    if (pair) {
      updateBoard(pair.first, pair.second);
    }
    if (state.tag == 'failed' && state.forceRefresh){
      window.location.reload()
    }
  }




  return (
    <>

      <div className='game-result'>
        <h3>
          {(state.tag == 'presenting' && state.winner)?  ((state.winner == user.id) ? "You won!" : "You Lost!") :""}
        </h3>
      </div>
      {state.tag == 'presenting' && <div>
        <p>Your game Piece:</p>
        <div key='userPieceBackground' className='userPieceBackground'>
          <div
            key='userPiece'
            className='board-cell'
            data-hover-enabled={false}
          >
            <span className={`go-piece ${state.goPiece === 'BLACK' ? 'go-piece-X' : 'go-piece-O'}`}>{}</span>

          </div>
        </div>
      </div>
      }
      <div className="game-container">
      <DrawBoard
        action={handleClick}
        board={board}
        allowInput={state.tag === 'presenting' && !state.winner}
        message={state.tag === 'waiting' ? state.message : undefined}
        load={state.tag !== 'presenting' && state.tag !== 'failed'}
      />
      <Popup open={state.tag === 'failed'} closeOnDocumentClick={false}>
        <div className='warning-playing'>
          <a className='close' onClick={handleDismiss}>
            &times;
          </a>
          <div>
            <h3>
              {state.tag === 'failed' && state.message}
            </h3>
          </div>
        </div>
      </Popup>
        <div className="draw-stats-container">
      {opponent && (
        <DrawStats user={opponent} title="Opponent Stats"/>
      )}
        <button onClick={()=>{
          if (state.tag == 'presenting' && !state.winner){
            dispatch({type:'request',path:"/api/game/quit/" + gameDetails.id})
          }
        }} className="quitButton">
          Quit game
        </button>
        </div>
    </div>
    </>



  );
}

type BoardOptions = {
  board: string[][],
  allowInput:boolean,
  action: (row:number,col:number) => void,
  message: string,
  load:boolean
}
function DrawBoard({board,allowInput,action,message,load}:BoardOptions){
  const boardStyle = {
    '--board-size': board.length,
  };
  const boardDraw =  board.map((row, rowIndex) => {
    return (
      <div key={rowIndex} className='board-row'>
        {row.map((cell, colIndex) => {
          return(
            <div
              key={rowIndex *10 + colIndex}
              className='board-cell'
              data-hover-enabled={allowInput && board[rowIndex][colIndex] == null}
              onClick={() => action(rowIndex, colIndex)}
            >
              {cell && (
                <span className={`go-piece ${cell === 'BLACK' ? 'go-piece-X' : 'go-piece-O'}`}>{cell}</span>
              )}
            </div>
          );
        })}

      </div>
    );
  });
  return (
    <div>
      <Loading expose={load} message={message}/>
      <h2 className='gomoku-title'>Gomoku Board</h2>
      <div className='gomoku-board' style={boardStyle}>{boardDraw}</div>
    </div>
  )

}
