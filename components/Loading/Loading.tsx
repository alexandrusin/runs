import React, { useEffect, useState } from 'react';
import Logo from '../Logo/Logo';

type LogoProps = {
  className?: string;
};

const Loading: React.FC<LogoProps> = ({ className }) => {
  // const messages = [
  //   "Dwarves Shoveling Data",
  //   "Miners Digging Deep",
  //   "Forges Heating Up",
  //   "Carving Data Paths",
  //   "Runic Scripts Loading",
  //   "Tunnels Extending",
  //   "Anvils Clanging",
  //   "Beards Fluttering",
  //   "Pickaxes Swinging",
  //   "Steam Engines Hissing",
  //   "Bellows Breathing Fire",
  //   "Compasses Finding North",
  //   "Maps Unfolding Routes",
  // ];

  const messages = [
    "Racking Plates",
    "Racking Plates",
    "Fueling Recovery",
    "Balancing Kettlebells",

    "Adjusting Saddle",
    "Greasing Chain",
    "Shifting Gears",
    "Shifting Gears",
    "Increasing Cadence",

    "Mapping Routes",
    "Hydrating",
    "Warming Up",
    "Cooling Down",
    "Syncing Playlists",
    "Plotting Scenic Routes",
  ];

  // Use useState to store the selected message
  const [randomMessage, setRandomMessage] = useState('');

  // Use useEffect to select a message only on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * messages.length);
    setRandomMessage(messages[randomIndex]);
  }, []); // Empty dependency array ensures this effect runs only once

  return (
    <div className={`${className} loading`}>
      {randomMessage}
    </div>
  );
};

export default Loading;
