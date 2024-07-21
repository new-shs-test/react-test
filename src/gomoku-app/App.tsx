import * as React from 'react'
import { AuthnContainer } from './authentication/Authn';
import { Login } from './authentication/Login';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import { RequireAuthn } from './authentication/RequireAuth';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { Authors } from './authors/Authors';
import {Stats} from "./statistics/Stats";
import {Ranking} from "./statistics/Ranking";
import {Profile} from "./statistics/Profile";
import {UserInfo} from "./statistics/UserInfo";
import { GameSetup } from './game/GameSetup';
import { GamePlay } from './game/GamePlay';
import {Register} from "./authentication/Register";
//import { RequireGameContainer } from './game/RequireContainer';
import { GameContainer } from './game/GameContainer';
import { RequireGameContainer } from './game/RequireContainer';
import {Logout} from "./authentication/Logout";
import { TopBar } from './utils/TopBar';
import { Home } from './home/Home';
//import { Login } from './Login';



const router = createBrowserRouter([
  {
    "path": "/",
    "element": <AuthnContainer><Outlet /></AuthnContainer>,
    "children": [
      {
        "path": "/",
        "element": <TopBar />,
        "children": [
          {
            "path": "/",
            "element": <Home />,
          },
          {
            "path": "/login",
            "element": <Login />
          },
          {
            "path": "/register" ,
            "element": <Register />
          },
          {
            "path": "/logout",
            "element": <RequireAuthn><Logout /></RequireAuthn>
          },
          {
            "path": "/profile",
            "element": <RequireAuthn><Profile /></RequireAuthn>
          },
          {
            "path": "/user/:userId",
            "element": <UserInfo />
          },
          {
            "path": "/authors",
            "element": <Authors />
          },
          {
            "path": "/statistics",
            "element": <Stats />
          },
          {
            "path": "/ranking/:page",
            "element": <Ranking />
          },
          {
            "path": "/game",
            "element":<RequireAuthn><GameContainer><Outlet/></GameContainer></RequireAuthn>,
            "children":[
              {
                "path":":id",
                "element":<RequireGameContainer><GamePlay/></RequireGameContainer>
              },
              {
                "path":"/game",
                "element":<GameSetup/>
              }
            ]
          }
      ]}
    ]
  }
])
export function App() {
  return (
    <RouterProvider router={router} />
  )
  }






