import React from 'react';
import Logo from '../Logo/Logo';

type LogoProps = {
  className?: string;
};

const Loading: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`${className} loading`}>
      gremlins at work..
    </div>
  );
};

export default Loading;
