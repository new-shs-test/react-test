import * as React from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Navigate, useNavigate} from "react-router-dom";
import {useSetUser} from "./Authn";
import Loading from "../utils/Loading";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Button } from '@mui/material';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';

type State =
    | {tag:  'deciding'}
    | {tag: 'redirect', logout: boolean}
    | {tag: 'loggingOut'}


type Action =
   | {type: 'confirm'}
   | {type: 'cancel'}
   | {type: 'logout'}

function logUnexpectedAction(state: State, action: Action) {
    console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}
function reduce(state: State, action: Action):State {
    switch (state.tag) {
        case 'deciding':
            if (action.type === 'confirm') {
                return {tag: 'loggingOut'}
            }
            else if (action.type === 'cancel') {
                return {tag: 'redirect', logout: false}
            } else {
                logUnexpectedAction(state, action)
                return state
            }
        case 'loggingOut':
            if (action.type === 'logout') {
                return {tag: 'redirect', logout: true}
            } else {
                logUnexpectedAction(state, action)
                return state
            }
    }
}

export function Logout () {
    const setUser = useSetUser()
    const [state, dispatch] = React.useReducer(reduce, {tag: 'deciding'})
    const navigate = useNavigate();
    const myHeaders = new Headers({
        "Content-Type": "application/json",
    })
    console.log("state logout"+ state)
    if (state.tag === 'redirect') {
        if (state.logout) {
            return <Navigate to={'/'} replace={true} />;
        } else {
            return navigate(-1)
        }
    }

    if (state.tag === 'loggingOut') {

        fetch("api/user/logout",
            {
                mode:'same-origin',
                method:'POST',
                headers: myHeaders,
            }).then((res) => {
            if (res.status == StatusCodes.OK) {
                setUser(undefined)
                dispatch({type: 'logout'})
            } else {
               Promise.reject(new Error(res.statusText)).then(r => console.log(r))
            }
        })
        return <div> <Loading expose={true}/> </div>
    }

    function handleConfirm() {
        dispatch({type: 'confirm'})
    }

    function handleCancel() {
        dispatch({type: 'cancel'})
    }

    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <h3>Are you sure you want to logout?</h3>
          <Button onClick={handleConfirm}
                  style={{ backgroundColor: '#555', color: '#fff', marginRight: '10px' }}>Yes</Button>
          <Button onClick={handleCancel} style={{ backgroundColor: '#555', color: '#fff' }}>No</Button>
      </div>
    )
}