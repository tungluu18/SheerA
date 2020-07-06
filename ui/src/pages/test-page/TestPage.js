import React, { useState, useRef } from 'react';
import Alert from 'commons/Alert';
import { Button } from '@material-ui/core';

const TestPage = () => {
  const [message, setMessage] = useState();

  const clearAlertMessage = () => setMessage("");

  return (
    <>
      <Button onClick={() => setMessage(`test`)}>
        Show alert
      </Button>
      <br />
      Current message: {message}
      <Alert message={message} clear={setMessage} severity="error" />
    </>
  );
}

export default TestPage;
