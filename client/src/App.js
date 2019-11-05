import React, { useState, useEffect } from 'react';
import Loader from 'react-loader-spinner'
// import axios from 'axios';
import './App.css';
import socketIOClient from 'socket.io-client';

// import images from './assets/images.js';
import PlayerBoard from './components/Boards/PlayerBoard.js';
import ActionButtons from './components/ActionButtons.js';
import Seat from './components/Seat/Seat.js';

const initialSeats = [
  {
    seatId: 1,
    name: null,
    bank: 1000,
    filled: false,
    top: [null, null, null],
    middle: [null, null, null, null, null],
    bottom: [null, null, null, null, null],
    discards: [],
    hasButton: false
  },
  {
    seatId: 2,
    name: null,
    bank: 1000,
    filled: false,
    top: [null, null, null],
    middle: [null, null, null, null, null],
    bottom: [null, null, null, null, null],
    discards: [],
    hasButton: false
  },
]

// // ! dummy component to check socket.io implementation
// const App = () => {
//   const [endpoint, setEndpoint] = useState('localhost:5000');

//   useEffect(() => {
//     const socket = socketIOClient(endpoint);
//     console.log('socket', socket);
//   }, [])

//   return (
//     <div>test</div>
//   )
// }

const App = () => {
  // setup websocket instance
  const [ws, setWs] = useState(new WebSocket('ws://localhost:3030'));
  // boolean to keep track if it's our turn to show action buttons
  const [myTurn, setMyTurn] = useState(false);
  // map of all seats (seats contain board info)
  const [seats, setSeats] = useState(initialSeats);
  // boolean to kep track if we've already taken a seat
  const [seated, setSeated] = useState(false);
  const [numFilledSeats, setNumFilledSeats] = useState(0);
  const [username, setUsername] = useState(null);

  // if user sits down or stands up from table, send the new seat information to the server
  useEffect(() => {
    // seat information to send to ws server
    const seatInfo = {
      seats,
      type: 'seat'
    }

    // if connected send the seatInfo
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(seatInfo));
    }
  }, [numFilledSeats])

  const sitHere = seatNumber => {
    const me = window.prompt('What is your name?');
    setUsername(me);
    setSeats(seats.map(seat => {
      if (seat.seatId === seatNumber) {
        return {
          ...seat,
          name: me,
          filled: true
        }
      } else {
        return seat
      }
    }));
    setSeated(true);
    setNumFilledSeats(numFilledSeats + 1);
  }

  const standUp = seatNumber => {
    console.log(`standing up from seat ${seatNumber}`)
    if (window.confirm('Are you sure you want to leave?')) {
      setSeats(seats.map(seat => {
        if (seat.seatId === seatNumber) {
          return {
            ...seat,
            name: null,
            filled: false
          }
        } else {
          return seat
        }
      }))
      setSeated(false);
      setNumFilledSeats(numFilledSeats - 1);
    }
  }

  return (
    <div className='table'>
      {/* if websocket in ready state show table */}
      {seats.map(seat => (
        <div key={seat.seatId} className="player-area">
          <Seat 
            seat={seat} 
            sitHere={sitHere} 
            seated={seated}
            standUp={standUp}
            username={username}
          />
          <PlayerBoard seat={seat}/>
        </div>
      ))}
      {myTurn && <ActionButtons />}
    </div>
  )
}

export default App;
