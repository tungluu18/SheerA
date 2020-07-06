import React, { useState, useEffect } from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  alert: { minWidth: '20rem', },
  closeIcon: { margin: theme.spacing(1), },
}));

const Alert = (props) => {
  const { message, clear } = props;
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    clear();
  }

  useEffect(
    () => {
      if (message) { setOpen(true); }
    },
    [message]
  );

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={1500}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
    >
      <MuiAlert
        className={classes.alert}
        elevation={4}
        variant="filled"
        onClose={handleClose}
        {...props}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
}

export default Alert;
