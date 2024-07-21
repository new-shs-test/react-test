import * as React from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Navigate, useLocation } from 'react-router-dom'
import { useSetUser } from "./Authn"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Button, CircularProgress, TextField } from '@mui/material';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';

type State =
  | { tag: 'editing'; error?: string; inputs: { username: string; password: string; email?: string} }
  | { tag: 'submitting'; username: string, email?: string }
  | { tag: 'redirect' };

type Action =
  | { type: 'edit'; inputName: string; inputValue: string }
  | { type: 'submit' }
  | { type: 'error'; message: string }
  | { type: 'success' };

function logUnexpectedAction(state: State, action: Action) {
  console.log(`Unexpected action '${action.type} on state '${state.tag}'`);
}

export function reduce(state: State, action: Action): State {
  switch (state.tag) {
    case 'editing':
      if (action.type === 'edit') {
        return { tag: 'editing', error: undefined, inputs: { ...state.inputs, [action.inputName]: action.inputValue } };
      } else if (action.type === 'submit') {
        return { tag: 'submitting', username: state.inputs.username, email: state.inputs.email };
      } else {
        logUnexpectedAction(state, action);
        return state;
      }

    case 'submitting':
      if (action.type === 'success') {
        return { tag: 'redirect' };
      } else if (action.type === 'error') {
        return { tag: 'editing', error: action.message, inputs: { username: state.username, password: '' } };
      } else {
        logUnexpectedAction(state, action);
        return state;
      }

    case 'redirect':
      logUnexpectedAction(state, action);
      return state;
  }
}

/*function delay(delayInMs: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(undefined), delayInMs);
  });
}*/
function loginParse(username: string, password: string){
  const log = {
    nickname:username,
    password
  }
  return JSON.stringify(log)
}

export async function authenticate(username: string, password: string) {
  //await delay(3000);
  const myHeaders = new Headers({
    "Content-Type": "application/json",
  })
  console.log(loginParse(username, password))
  return fetch("api/user/login",
      {
        mode:'same-origin',
        method:'POST',
        headers: myHeaders,
        body:loginParse(username,password)
      })
      .then((res) => {
        if (res.status == StatusCodes.OK || res.status == StatusCodes.UNAUTHORIZED){
          return res
        }else {
          return Promise.reject(new Error(res.statusText))
        }
      })//.catch((err) => {console.log(err)})
}

export function Login() {
  console.log('Login');
  const setUser = useSetUser();
  const [state, dispatch] = React.useReducer(reduce, { tag: 'editing', inputs: { username: '', password: '' } });

  const location = useLocation();
  if (state.tag === 'redirect') {
    return <Navigate to={location.state?.source || '/'} replace={true} />;
  }
  function handleChange(ev: React.FormEvent<HTMLInputElement>) {
    dispatch({ type: 'edit', inputName: ev.currentTarget.name, inputValue: ev.currentTarget.value });
  }
  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (state.tag !== 'editing') {
      return;
    }
    dispatch({ type: 'submit' });
    const username = state.inputs.username;
    const password = state.inputs.password;
    authenticate(username, password)
      .then(async res => {
        const data = await res.json();
        if (res.status == StatusCodes.OK) {
          setUser(data);
          dispatch({ type: 'success' });
        } else if (res.status == StatusCodes.UNAUTHORIZED) {
          dispatch({ type: 'error', message: data.title });
        }
      })
      .catch(error => {
        dispatch({ type: 'error', message: error.message });
      });
  }

  const username = state.tag === 'submitting' ? state.username : state.inputs.username
  const password = state.tag === 'submitting' ? "" : state.inputs.password
  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '375px', margin: 'auto' }}>
      <fieldset disabled={state.tag !== 'editing'}>
        <div style={{ marginBottom: '16px' }}>
          <TextField
            id="username"
            label="Username"
            type="text"
            name="username"
            value={username}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <TextField
            id="password"
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </div>
        <div>
          <Button type="submit" variant="contained" color="primary" disableElevation fullWidth
                  style={{ backgroundColor: '#555', color: '#fff' }}>
            {state.tag === 'submitting' ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </div>
      </fieldset>
      {state.tag === 'editing' && state.error && (
        <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{state.error}</div>
      )}
    </form>
  );
}