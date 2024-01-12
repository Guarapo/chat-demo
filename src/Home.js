import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <div>
        <ul>
          <li><Link to="/gami-chat">Gami Chat Example</Link></li>
        </ul>
      </div>
    </div>
  );
}

export default Home;
