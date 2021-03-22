import { ActiveQLServer, DomainConfiguration, DomainDefinition, Runtime } from 'activeql-server';
import _ from 'lodash';
import { withFilter } from 'apollo-server-express';

import {
  AnswerTextGame,
  Contestant,
  Flight,
  FlightStatus,
  Game,
  Locale,
  OneOfNGame,
  MapGuessGame,
  Player,
  Round,
  SubmitionResult,
  Submition,
} from './activeql-types';

export const addArena = (domainDefinition:DomainDefinition) => domainDefinition.add( domainConfiguration )

const domainConfiguration:DomainConfiguration = {

	mutation: {
		enrolContestant: () => ({
			type: 'Contestant',
			args: { playerId: 'ID!' },
			resolve: (root:any, args:any) => enrolContestant( args.playerId )
		}),

    submitAnswer: () => ({
      type: 'SubmitionResponse',
      args: {
        contestantId: 'ID!',
        roundId: 'ID!',
        answer: 'JSON!'
      },
      resolve: (root:any, { contestantId, roundId, answer}) => submitAnswer( contestantId, roundId, answer )
    })
	},

  type: {
    RoundResult: {
      fields: {
        alive: 'Boolean!',
        liveContestants: 'Int!',
        position: 'Int'
      }

    },
    SubmitionResponse: {
      fields: {
        result: 'SubmitionResult!',
        solution: 'JSON'
      }
    },
    ContestantSubscriptionData: {
      fields: {
        nextRound: 'Round!',
        lastRoundResult: 'RoundResult'
      }
    }
  },

	subscription: {
		flight: (rt:Runtime) => ({
      type: 'ContestantSubscriptionData',
      args: { contestantId: 'ID!' },
      subscribe: (root:any, { contestantId }) => rt.pubsub.asyncIterator( `flight-for-contestant-${contestantId}` )
    })
	}
}

const GRACE_TIME_TO_START = 2 * 1000;
const GRACE_TIME_AFTER_LAST_SUBMITION = 3 * 1000;
const MAX_TIME_TO_START = 200 * 1000;
const PLAYER_TO_START = 1;
const DISTANCE_TOP_PERCENT_TO_PASS = 0.5;

// client asks to join a flight for an (existing) player
// if this player is currently in any other flight currently, we will remove her from that
// This call will return an open flight for the locale of the player (that doesnt start for at least 3 sec)
// or creates a new one.
// If this player makes the flight "full" it starts the flight right away (after 3 seconds)
const enrolContestant  = async ( playerId:string ) => {
  const player = await Player.findById( playerId );
  await ensureNoOtherContestantsAlive( playerId );
  const flight = await findOrCreateOpenFlight( player.locale );
  const contestant = await Contestant.save({ playerId, flightId: flight.id, alive: true } );
  const contestants = await flight.contestants();
  if( _.size( contestants ) >= flight.playerToStart ) setTimeout(
    () => startFlight( flight.id ), GRACE_TIME_TO_START );
  return contestant;
}

// if this player is alive any (other) flights we set her to unalive there
const ensureNoOtherContestantsAlive = async ( playerId:string ) => {
  const contestants = await Contestant.findByAttribute( { playerId, alive: true } );
  for( let contestant of contestants ) {
    contestant.alive = false;
    await contestant.save();
  }
}

//
const findOrCreateOpenFlight = async (locale:Locale):Promise<Flight> => {
  const flight = await Flight.findOneByAttribute( { locale, status: FlightStatus.OPEN });
  if( flight && flight.latestStart.getDate() - Date.now() > GRACE_TIME_TO_START ) return flight;
  const latestStart = new Date( Date.now() + MAX_TIME_TO_START );
  const newFlight = await Flight.save( { locale, status: 'open', latestStart, playerToStart: PLAYER_TO_START } ) as Flight;
  setTimeout( () => startFlight( newFlight.id ), MAX_TIME_TO_START );
  return newFlight
}

// start a flight - happens either by time or if enough players enrolled
const startFlight = async ( flightId: string ) => {
  const flight = await Flight.findById( flightId );
  if( flight.status !== FlightStatus.OPEN ) return;
  flight.status = FlightStatus.STARTED;
  await flight.save();
  startNewRound( flight.id );
}

// start a round - happens either at the beginning of a flight or the end of the last round
const startNewRound = async ( flightId:string, lastRound?:Round ) => {
  const flight = await Flight.findById( flightId );
  if( flight.status !== FlightStatus.STARTED ) return;
  const game = await getNextGame( flight );
  const rounds = await flight.rounds();
  const level = _.size( rounds );
  const newRound = await Round.save({ flight, game, level }) as Round;
  await publishNextRound( flight, newRound, lastRound );
  setTimeout( () => endRound( newRound ), game.playTime * 1000 );
}

// publish the start of a round to any contestant, not only alive contestants, since we probably want to show
// the progress of the flight to a watching player
const publishNextRound = async ( flight:Flight, nextRound:Round, lastRound?:Round ) => {
  const contestants = await flight.contestants();
  const results:{[contestantId:string]:any} = {};
  if( lastRound ) for( const contestant of contestants ){
    const result = await getRoundResult( lastRound, contestant );
    _.set( results, contestant.id, result );
  }
  const aliveContestants = _.countBy( results, result => result.alive );
  _.forEach( contestants, contestant => {
    const lastRoundResult = _.get( results, contestant.id);
    if( lastRoundResult ) lastRoundResult.liveContestants = aliveContestants;
    ActiveQLServer.runtime.pubsub.publish( `flight-for-contestant-${contestant.id}`, {nextRound, lastRoundResult} );
  });
}

// end a round - happens either by time (max play time of a game) or if all alive contestants submitted their submition
const endRound = async ( round:Round ) => {
  if( round.closed ) return;
  round.closed = true;
  await round.save();
  startNewRound( round.flightId, round );
}

// return a new game according to the current level of the flight (number of rounds played)
// if no game is in that level try to grab a game with from a lower level
// never returns a game that was already played in this flight
const getNextGame = async ( flight:any ):Promise<any> => {
  const playedRounds = await flight.rounds()
  const playedGameIds = _.map( playedRounds, round => round.gameId );
  const nextLevel = _.size(playedRounds) + 1;
  for( let level = nextLevel; level > 0; level-- ){
    let games = await Game.findByAttribute( { level } );
    games = _.filter( games, game => ! _.includes( playedGameIds, game.id ) );
    if( _.size( games ) ) return _.sample( games );
  }
  throw new Error('no more games');
}

// save the submition of a contestant
const submitAnswer = async ( contestantId:string, roundId:string, solution:any ) => {
  if( await isDoubleAnswer( contestantId, roundId ) ) return { result: SubmitionResult.REPEATED }
  const round = await Round.findById( roundId );
  const submition = new Submition( { contestantId, roundId, solution });
  const result = await evaluateSubmition( round, solution );
  if( _.isNumber( result) ){
    submition.result = SubmitionResult.DISTANCE;
    submition.distance = result;
  } else submition.result = result;
  await submition.save();
  endRoundIfLastSubmition( round );
  return submition;
}

const isDoubleAnswer = async (contestantId:string, roundId:string) => {
  const solution = await Submition.findByAttribute({ contestantId, roundId } );
  return ! _.isEmpty( solution );
}

// checks if all alive contestants of a flight submitted a solution for this round and ends the round then
const endRoundIfLastSubmition = async ( round:Round ) => {
  const aliveContestants = await Contestant.findByAttribute({alive: true});
  const Submitions = await Submition.findByAttribute( { round } );
  if ( _.size( Submitions ) < _.size( aliveContestants ) ) return;
  setTimeout(() => endRound( round ), GRACE_TIME_AFTER_LAST_SUBMITION );
}

// evaluates the submition of the contestant for this round, saves it as RoundResult and returns it
// if the result means the contestant is no longer alive we also set the contestant to unalive
const getRoundResult = async (round:Round, contestant:Contestant ):Promise<any> => {
  const alive = await contestantSurvivedRound( round, contestant );
  if( ! alive ) await Contestant.save({ id: contestant.id, alive: false } );
  return { alive, liveContestants: 0 };
}

const contestantSurvivedRound = async (round:Round, contestant:Contestant ) => {
  const submition = await Submition.findOneByAttribute( { round, contestant } );
  if( ! submition ) return false;
  switch( submition.result ){
    case SubmitionResult.CORRECT: return true;
    case SubmitionResult.DISTANCE: return await topPercent( round, submition ) <= DISTANCE_TOP_PERCENT_TO_PASS;
  }
  return false;
}

//
const topPercent = async ( round:Round, submition:Submition ) => {
  const submitions = await round.submitions();
  const distances = _.orderBy( _.map( submitions, submition => submition.distance ) );
  const position = _.indexOf( distances, submition.distance ) + 1;
  const aliveContestants = await Contestant.findByAttribute( { flightId: round.flightId, alive: true } );
  return position / _.size( aliveContestants )
}

// returns the immediate response to submition - can be correct, incorrect, too-late,
// or undecidable e.g. at guessing-games where we have to wait for all submitions to evaluate the score / result
const evaluateSubmition = async ( round:Round, answer:any ):Promise<SubmitionResult|number> => {
  if( round.closed ) return SubmitionResult.LATE;
  const game = await round.game();
  switch( game.__typename ){
    case 'OneOfNGame':
      return answer.solution === (<OneOfNGame> game).solution ? SubmitionResult.CORRECT : SubmitionResult.INCORRECT;
    case 'AnswerTextGame': return evaluateSubmitionResultAnswerTextGame( game as AnswerTextGame, answer );
    case 'MapGuessGame': return evaluateSubmitionResultMapGuessGame( game as MapGuessGame, answer );
  }
  throw new Error( `unknown Game '${game.__typename}'` );
}

// return if the solution to an AnswerTextGame is either correct or incorrect
const evaluateSubmitionResultAnswerTextGame = ( game:AnswerTextGame, answer:any ) => {
  const locale = _.get( answer, 'locale' );
  if( ! locale ) throw new Error(`no locale provided in solution` );
  const correctSolution = _.get( game, `solution_${locale}` );
  if( ! correctSolution ) throw new Error(`no solution for locale '${locale}'` );
  return answer.solution === correctSolution ? SubmitionResult.CORRECT : SubmitionResult.INCORRECT;
}

const evaluateSubmitionResultMapGuessGame = (game:MapGuessGame, submition:any ) => {
  return getDistanceFromLatLonInKm( game.solution_lat, game.solution_long, submition.lat, submition.long );
}

const getDistanceFromLatLonInKm = (lat1:number,lon1:number,lat2:number,lon2:number) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg:number) =>  deg * (Math.PI/180);
