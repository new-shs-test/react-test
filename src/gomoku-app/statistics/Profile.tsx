
import * as React from "react";
import {useFetch} from "../utils/useFetch";
import Loading from "../utils/Loading";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Typography, ListItem, ListItemText, Paper, Grid } from '@mui/material';


type UserProfile = {
    id: number,
    nickname: string,
    email: string,
    points: number,
    victories: number,
    defeats: number,
    gamesPlayed: number,
    timePlayed: string,
}

export function Profile() {

    const { state, container }  =  useFetch(`/api/user/profile`)
    if (state.tag === 'loading'){
        return (
            <div>
                <Loading expose={true }/>
            </div>)
    }
    if(state.tag === 'failed'){
        return (<div>Failed</div>)
    }
    const userProfile = container.userProfile as UserProfile

    const listItemStyle = {
        marginBottom: '15px',
        background: '#f2f2f2', // Cor de fundo sutil
        padding: '8px', // Espaçamento interno
        borderRadius: '4px', // Borda arredondada
    };

    return (
      <Paper elevation={3} style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
          <Typography variant="h6" gutterBottom>
              Profile
          </Typography>
          <Grid container spacing={2}>
              <Grid item xs={6}>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="User ID:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Nickname:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Email:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Points:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Victories:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Defeats:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Games Played:" />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary="Time Played:" />
                  </ListItem>
              </Grid>
              <Grid item xs={6}>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.id} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.nickname} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.email} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.points} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.victories} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.defeats} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.gamesPlayed} />
                  </ListItem>
                  <ListItem style={listItemStyle}>
                      <ListItemText primary={userProfile.timePlayed} />
                  </ListItem>
              </Grid>
          </Grid>
      </Paper>
    );
}