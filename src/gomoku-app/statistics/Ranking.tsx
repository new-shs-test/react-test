import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NavigateFunction, useNavigate, useParams} from 'react-router-dom';
import Loading from '../utils/Loading';
import {useEffect, useReducer, useState} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from '@mui/material';
import { Button } from '../../../node_modules/@mui/material/index';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';
type State =
    | {tag: 'loading', path: string}
    | {tag: 'loaded', nextPage:string, prevPage:string}
    | {tag: 'failed', error? : string}

type  Action =
    | {type: 'success', nextPage:string, prevPage:string}
    | {type: 'error'; message: string}
    | {type: 'reload', path: string}
    | {type: 'redirect', path: string};

function logUnexpectedAction(state: State, action: Action) {
    console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}
function reduce(state: State, action: Action) : State{
    switch (state.tag){
        case 'loading':
            if (action.type == 'success'){
                return {tag : 'loaded', nextPage: action.nextPage, prevPage:action.prevPage}
            }else if (action.type == 'error'){
                return {tag : 'failed',error:action.message}
            }else {
                logUnexpectedAction(state, action);
                return state
            }
        case 'loaded':
            if (action.type == 'redirect'){
                return {tag: 'loading', path: action.path}
            } else {
                logUnexpectedAction(state, action)
                return state
            }
        case 'failed':
            if (action.type == 'reload'){
                return {tag: 'loading', path: action.path}
            }
    }
}
export function Ranking() {
    const [rankState, setRankState] = useState('Points')
    const navigate = useNavigate();
    type Params = {
        page: string
    }
    const {page}  = useParams<Params>()
    const path = "/api/statistics/ranking/" + page
    const [state,dispatch] = useReducer(reduce, { tag: 'loading' , path: path});
    const [container,setContainer] = useState(undefined)
    console.log(state.tag)
    console.log(location.pathname)

     useEffect(() => {
         if (state.tag == 'loading'){
             fetchRanking(state.path)
         }
     });
    function fetchRanking (path: string){
        fetch(path,{mode: 'same-origin'})
            .then((res) => {
                    if (res.status != StatusCodes.OK){
                        return Promise.reject(Error(res.statusText))
                    }else return   res.json()
                }
            )
            .then((data) => {
                setContainer(data)
                dispatch({type: 'success', nextPage: data.nextPage, prevPage:data.prevPage});
            })
            .catch((err) => {
                dispatch({type:'error', message: err.message})
            });
    }

    if (state.tag === 'loading') {
        return (<Loading expose={true}/>)
    }

    if (state.tag === 'failed') {
        console.log('failed')
        return (<div>state.message</div>)
    }

    const rankings = container.rankings

    const bestPlayers = rankings.bestPlayers.map(
        (player: { id: number, playerName: string, points: number, rank: number }) => {
            return (
                drawRanking(player.id, player.playerName, player.points, player.rank, navigate)
            )
        }
    )
    const victories = rankings.victories.map(
        (player: { id: number, playerName: string, victories: number, rank: number }) => {
            return (
                drawRanking(player.id, player.playerName, player.victories, player.rank, navigate)
            )
        }
    )
    const mostGames = rankings.mostGames.map(
        (player: { id: number, playerName: string, games: number, rank: number }) => {
            return (
                drawRanking(player.id, player.playerName, player.games, player.rank, navigate)
            )
        }
    )
    const mostTime = rankings.mostTime.map(
        (player: { id: number, playerName: string, timePlayed: number, rank: number }) => {
            return (
                drawRanking(player.id, player.playerName, player.timePlayed, player.rank, navigate)
            )
        }
    )
    const playerDefeats = rankings.playerDefeats.map(
        (player: { id: number, playerName: string, defeats: number, rank: number }) => {
            return (
                drawRanking(player.id, player.playerName, player.defeats, player.rank, navigate)
            )
        }
    )
    let list;
    if (rankState === 'Points') {
        list = bestPlayers;
    } else if (rankState === 'Victories') {
        list = victories;
    } else if (rankState === 'Games') {
        list = mostGames;
    } else if (rankState === 'Time') {
        list = mostTime;
    } else if (rankState === 'Defeats') {
        list = playerDefeats;
    }
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
          <Grid container justifyContent="center" spacing={2} direction="column">
              <Grid item>
                  <select onChange={(e) => setRankState(e.target.value)}>
                      <option value="Points">Ranking by Points</option>
                      <option value="Victories">Ranking by Victories</option>
                      <option value="Games">Ranking by Games Played</option>
                      <option value="Time">Ranking by Time Played</option>
                      <option value="Defeats">Ranking by Defeats</option>
                  </select>
              </Grid>
              <Grid item>
                  <TableContainer component={Paper}>
                      <Table>
                          <TableHead>
                              <TableRow>
                                  <TableCell>Rank</TableCell>
                                  <TableCell>Nickname</TableCell>
                                  <TableCell>{rankState}</TableCell>
                              </TableRow>
                          </TableHead>
                          <TableBody>{list}</TableBody>
                      </Table>
                  </TableContainer>
              </Grid>
              <Grid item container justifyContent="center" spacing={2}>
                  <Grid item>
                      <Button
                        variant="contained"
                        color="secondary"
                        style={{
                            backgroundColor: '#555',
                            color: '#fff',
                        }}
                        disabled={state.prevPage == undefined}
                        onClick={() => {
                            dispatch({ type: 'redirect', path: state.prevPage });
                        }}
                      >
                          Previous
                      </Button>
                  </Grid>
                  <Grid item>
                      <Button
                        variant="contained"
                        color="secondary"
                        style={{
                            backgroundColor: '#555', // Cor escura para o botão
                            color: '#fff', // Cor do texto para branco
                        }}
                        disabled={state.nextPage == undefined}
                        onClick={() => {
                            dispatch({ type: 'redirect', path: state.nextPage });
                        }}
                      >
                          Next
                      </Button>
                  </Grid>
              </Grid>
          </Grid>
      </div>
    );
}
function drawRanking(id:number, playerName : string, rankingVariant : number, rank :number, navigate: NavigateFunction) {
    return (
        <TableRow key={ id }>
            <TableCell>{rank }</TableCell>
            <TableCell>
                <button onClick={() => navigate("/user/" +id ) }>
                    {playerName}
                </button>
            </TableCell>
            <TableCell>{ rankingVariant }</TableCell>
        </TableRow>
    );
}
