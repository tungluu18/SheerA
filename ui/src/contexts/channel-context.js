import React, { useContext } from 'react';

const ChannelContext = React.createContext();

const ChannelProvider = ({ children }) => {
  const [role, setRole] = useState("viewer");

  return (
    <ChannelContext value={{ role, setRole }}>
      {children}
    </ChannelContext>
  )
}

const useChannelContext = () => useContext(ChannelContext);

const withChannelContext = (WrappedComponent) => (props) =>
  <ChannelProvider>
    <WrappedComponent {...props} />
  </ChannelProvider>

export {
  ChannelProvider,
  useChannelContext,
  withChannelContext,
}
