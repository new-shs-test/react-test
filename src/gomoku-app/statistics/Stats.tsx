import * as React from 'react';
import {useFetch} from "../utils/useFetch";
import Loading from "../utils/Loading";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Card, CardContent, Typography } from '@mui/material';


export function Stats() {
    console.log("Stats")
    const { state, container }  =  useFetch("/api/statistics")
    if (state.tag === 'loading'){
        return (<Loading expose={true}/>)
    }
    const globalStats : GameStats = container.gameStats as GameStats
    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">
                    Game Statistics
                </Typography>
                <Typography color="textSecondary">
                    Total Time Played: {globalStats.totalTime}
                </Typography>
                <Typography color="textSecondary">
                    Total Games Played: {globalStats.totalGames}
                </Typography>
                <Typography color="textSecondary">
                    Total Victories: {globalStats.totalVictories}
                </Typography>
            </CardContent>
        </Card>
    );
}

type GameStats = {
    totalTime: number,
    totalGames: number,
    totalVictories: number
}