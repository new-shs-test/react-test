
import {useEffect, useReducer, useState} from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';

type State =
    | {tag: 'loading'}
    | {tag: 'loaded'}
    | {tag: 'failed', error? : string};
type  Action =
    | {type: 'success'}
    | {type: 'error'; message: string}
    | {type: 'reload'};

export function logUnexpectedAction(state: State, action: Action) {
    console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}
function reduce(state: State,action: Action) : State{
    switch (state.tag){
        case 'loading':
            if (action.type == 'success'){
                return {tag : 'loaded'}
            }else if (action.type == 'error'){
                return {tag : 'failed',error:action.message}
            }else {
                logUnexpectedAction(state, action);
                return state
            }
        case 'failed':
            if (action.type == 'reload'){
                return {tag: 'loading'}
            }
    }
}
export function useFetch(url: string )  {
    const [state,dispatch] = useReducer(reduce, { tag: 'loading'});
    const [container,setContainer] = useState(undefined)
    useEffect(() => {
        fetch(url,{
            mode: 'same-origin',
        })
            .then((res) => {
                    if (res.status != StatusCodes.OK){
                        return Promise.reject(Error(res.statusText))
                    }else return   res.json()
                }
            )
            .then((data) => {
                console.log(data)
                setContainer(data)
                dispatch({type: 'success'});
            })
            .catch((err) => {
                console.log("failed")
                console.log(err)
                dispatch({type:'error', message: err.message})
            });
    },[url])

    return { state, container };
}



