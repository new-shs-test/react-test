import * as React from "react"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Navigate, useLocation} from 'react-router-dom'
import { useSetUser } from "./Authn"
import {reduce} from "./Login";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TextField, Button, CircularProgress } from '@mui/material';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { StatusCodes } from 'http-status-codes';
function registerParse(username: string, email:string, password: string){
    const log = {
        nickname:username,
        email,
        password
    }
    return JSON.stringify(log)
}


async function register(username: string, email:string, password: string) {
    //await delay(3000);
    const myHeaders = new Headers({
        "Content-Type": "application/json",
    })
    return fetch("api/user/register",
        {
            mode:'same-origin',
            method:'POST',
            headers: myHeaders,
            body:registerParse(username, email, password)
        })
        .then((res) => {
            if (res.status == StatusCodes.CREATED || res.status == StatusCodes.UNAUTHORIZED ) {
                return res
            }
                return Promise.reject(new Error(res.statusText))
        })//.catch((err) => {console.log(err)})
}

export function Register() {
    const location = useLocation();
    console.log('Register');
    const setUser = useSetUser();
    const [state, dispatch] = React.useReducer(reduce, { tag: 'editing', inputs: { username: '', password: '', email: '' } });

    if (state.tag === 'redirect') {
        return <Navigate to={ location.state?.source || '/'} replace={true} />;
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
        const email = state.inputs.email;
        const password = state.inputs.password;
       register(username, email, password)
            .then(async (res) => {
                const data = await res.json();
                if (res.status == StatusCodes.CREATED) {
                    setUser(data);
                    dispatch({type: 'success'});
                } else if (res.status == StatusCodes.UNAUTHORIZED) {
                    console.log("title" + data.title);
                    dispatch({type: 'error', message: data.title});
                } else if (res.status == StatusCodes.INTERNAL_SERVER_ERROR) {
                    dispatch({type: 'error', message: data.title});
                }
            })
            .catch(error => {
                dispatch({ type: 'error', message: error.message });
            });
    }

    const username = state.tag === 'submitting' ? state.username : state.inputs.username
    const email = state.tag === 'submitting' ? state.email : state.inputs.email
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
                    id="email"
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
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
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    fullWidth
                    style={{
                        backgroundColor: '#555',
                        color: '#fff',
                    }}
                  >
                      {state.tag === 'submitting' ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                  </Button>
              </div>
          </fieldset>
          {state.tag === 'editing' && state.error && (
            <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{state.error}</div>
          )}
      </form>
    );
}
