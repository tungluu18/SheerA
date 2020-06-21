import React from 'react';
import Card from '@material-ui/core/Card';
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

const UserCard = ({ userId, role }) => {
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
        title={userId}
        subheader={role} />
    </Paper>
  );
}

export default UserCard;
