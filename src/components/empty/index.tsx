import React from 'react';

interface EmptyProps {
  message: string;
}

// Empty state display component.
const Empty: React.FC<EmptyProps> = ({message}) => {
  return <div>{message}</div>;
};

export default Empty;
