import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { UserInfo } from './UserInfo';
import "./UserInfo.css"

type DrawOptions= {
  user:UserInfo,
  title:string
}
export function DrawStats({user,title}:DrawOptions):React.ReactNode{
  return (

    <div className="draw-stats">
      <h3>
        {title}
      </h3>
      <p>Player Name: {user.nickname}</p>
      <p>Points: {user.points}</p>
      <p>Victories: {user.victories}</p>
      <p>Games: {user.gamesPlayed}</p>
      <p>Time Played: {user.timePlayed}</p>
      <p>Defeats: {user.defeats}</p>
    </div>
    /*<Box display="flex" justifyContent="center">
      <StyledCard>
        <CardContent>
          <Title variant="h5" component="div">
            Player Statistics
          </Title>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Text variant="body2">Player Name: {user.nickname}</Text>
            </Grid>
            <Grid item xs={12}>
              <Text variant="body2">Points: {user.points}</Text>
            </Grid>
            <Grid item xs={12}>
              <Text variant="body2">Victories: {user.victories}</Text>
            </Grid>
            <Grid item xs={12}>
              <Text variant="body2">Games: {user.gamesPlayed}</Text>
            </Grid>
            <Grid item xs={12}>
              <Text variant="body2">Time Played: {user.timePlayed}</Text>
            </Grid>
            <Grid item xs={12}>
              <Text variant="body2">Defeats: {user.defeats}</Text>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </Box>*/
  );
}