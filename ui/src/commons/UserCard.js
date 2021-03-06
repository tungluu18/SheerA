import React from 'react';
import Paper from '@material-ui/core/Paper';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { makeStyles } from '@material-ui/core/styles';
import { pink } from '@material-ui/core/colors';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'inline-block',
  },
  cardheader: {
    padding: theme.spacing(1),
  },
  pink: {
    color: theme.palette.getContrastText(pink[300]),
    backgroundColor: pink[300],
  }
}));

const UserCard = ({ username, role }) => {
  const classes = useStyles();

  role = role === "seeder" ? "broadcaster" : "viewer";

  return (
    <Paper className={classes.root} elevation={1}>
      <CardHeader
        className={classes.cardheader}
        avatar={
          <Avatar className={classes.pink}>
            <AccountCircleIcon />
          </Avatar>
        }
        title={username}
        subheader={role} />
    </Paper>
  );
}

export default UserCard;
