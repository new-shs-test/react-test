import * as React from 'react';
import Loading from '../utils/Loading';
import {useFetch} from "../utils/useFetch";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {useParams} from "react-router-dom";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

import { DrawStats } from './DrawStats';



export type UserInfo = {
    id: number,
    nickname: string,
    points: number,
    victories: number,
    gamesPlayed: number,
    timePlayed: number,
    defeats: number
}

export function UserInfo () {
    type params = {
        userId: string
    }
    const { userId } = useParams<params>();

    const { state, container }  =  useFetch(`/api/user/id-info/${userId}`)
    if (state.tag === 'loading'){
        return (<Loading expose={true}/>)
    }
    if(state.tag === 'failed'){
        // handle error
    }
    const userInfo = container.userInfo as UserInfo

    return <DrawStats user={userInfo} title={userInfo.nickname + " profile"}/>
}

