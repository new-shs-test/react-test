import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser, useSetUser } from './Authn';
import { useEffect, useState } from 'react';
import Loading from '../utils/Loading';
import { handleResponse } from '../utils/remoteFetch';

export function RequireAuthn({ children }: { children: React.ReactNode }): React.ReactElement {
  const currentUser = useCurrentUser();
  const location = useLocation()
  const setUser = useSetUser();
  const [attemptedLogin, setAttemptedLogin] = useState(false);
  console.log(location)
  useEffect(() => {
    if (!currentUser && !attemptedLogin){
      const myHeaders = new Headers({
        'Content-Type': 'application/json',
      });
      fetch('/api/user/is-login',
        {
          mode: 'same-origin',
          method: 'GET',
          headers: myHeaders
        })
        .then(handleResponse)
        .then((data) => {
          console.log(data)
          if (data.nickname){
            setUser(data)
          }
          else {
            setAttemptedLogin(true)
          }
        }).catch(() => {
          setAttemptedLogin(true)
      })
    }
  });
  if (currentUser) {
    return <>{children}</>;
  }
  if (attemptedLogin) {
    return <Navigate to={location.state?.source ||'/login'} replace={true} />;
  }
  return <Loading expose={!attemptedLogin} message={"Trying to resume previous session"}/>
}