import * as React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import gomoku from './gomoku.png'; // Importando a imagem

import './Home.css';

export function Home() {
  return (
    <div>
      <img src={gomoku} className="home-image" alt="Gomoku" />
    </div>
  );
}