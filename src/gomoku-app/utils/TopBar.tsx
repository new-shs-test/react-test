import { useCurrentUser } from '../authentication/Authn';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Link, Outlet } from 'react-router-dom';
import * as React from 'react';
import './TopBar.css';
export function TopBar() {
  const currentUser = useCurrentUser();

  return (
    <div>
      <div className="top-bar">
        <h1>Gomoku Online</h1>
        <div className="top-bar-right">
          <div><Link to='/'>Home</Link></div>
          <div><Link to='/authors'>Authors</Link></div>
          <div><Link to='/game'>Game</Link></div>
          <div><Link to='/statistics'>Statistics</Link></div>
          <div><Link to='/ranking/0'>Ranking</Link></div>
          {currentUser == undefined && (
            <>
              <div><Link to='/login'>Login</Link></div>
              <div><Link to='/register'>Register</Link></div>
            </>
          )}
          {currentUser != undefined && (
            <>
              <div><Link to='/profile'>{currentUser.nickname}</Link></div>
              <div><Link to='/logout'>Logout</Link></div>
            </>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  );
}
