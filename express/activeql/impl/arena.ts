import { ActiveQLServer, DomainConfiguration, DomainDefinition, Runtime } from 'activeql-server';
import _ from 'lodash';

import { Flight, Player, Round, Game, FlightStatus, Locale, Contestant, SolutionSubmition } from './activeql-types';

export const addArena = (domainDefinition:DomainDefinition) => domainDefinition.add( domainConfiguration )

const domainConfiguration:DomainConfiguration = {

  query: {
    eins: () => ({
      type: 'String',
      resolve: async () => {
        const games = await Game.findByAttribute({});
        console.log( games );
        return _.get( _.first( games), 'name', 'none');
      }
    })
  },

	mutation: {
		enrolContestant: () => ({
			type: 'Contestant',
			args: { playerId: 'ID!' },
			resolve: (root:any, args:any) => enrolContestant( args.playerId )
		}),

    submitSolution: () => ({
      type: 'Boolean',
      args: {
        contestantId: 'String!',
        roundId: 'String!',
        solution: 'JSON!'
      },
      resolve: (root:any, { contestantId, roundId, solution}) => saveColutionSubmition( contestantId, roundId, solution )
    })
	},

  type: {
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

const GRACE_TIME_TO_START = 3 * 1000;
const TIME_TO_START = 200 * 1000;

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
  console.log( {contestant} );
  const contestants = await flight.contestants();
  if( _.size( contestants ) >= flight.playerToStart ) setTimeout(
    () => startFlight( flight.id ), GRACE_TIME_TO_START );
  return contestant;
}

const ensureNoOtherContestantsAlive = async ( playerId:string ) => {
  const contestants = await Contestant.findByAttribute( { playerId, alive: true } );
  for( let contestant of contestants ) {
    contestant.alive = false;
    await contestant.save();
  }
}

const findOrCreateOpenFlight = async (locale:Locale):Promise<Flight> => {
  const flight = await Flight.findOneByAttribute( { locale, status: FlightStatus.OPEN });
  if( flight && flight.latestStart.getDate() - Date.now() > GRACE_TIME_TO_START ) return flight;
  const latestStart = new Date( Date.now() + TIME_TO_START );
  const newFlight = await Flight.save( { locale, status: 'open', latestStart, playerToStart: 3 } ) as Flight;
  setTimeout( () => startFlight( newFlight.id ), TIME_TO_START );
  return newFlight
}

const startFlight = async ( flightId: string ) => {
  const flight = await Flight.findById( flightId );
  if( flight.status !== FlightStatus.OPEN ) return;
  flight.status = FlightStatus.STARTED;
  await flight.save();
  startNewRound( flight.id );
}

const startNewRound = async ( flightId:string, lastRound?:Round ) => {
  const flight = await Flight.findById( flightId );
  const game = await getNextGame( flight );
  const rounds = await flight.rounds();
  const level = _.size( rounds );
  const newRound = await Round.save({ flightId, gameId: game.id, level }) as Round;
  await publishNewRound( flight, newRound, lastRound );
  setTimeout( () => roundEnd( newRound.id ), game.playTime );
}

const publishNewRound = async ( flight:Flight, nextRound:any, lastRound?:any ) => {
  const contestants = await flight.contestants();
  _.forEach( contestants, contestant => {
    const lastRoundResult = getRoundResult( lastRound, contestant );
    ActiveQLServer.runtime?.pubsub.publish( `flight-for-contestant-${contestant.id}`, {nextRound, lastRoundResult} );
  });
}

const roundEnd = async ( roundId:string ) => {
  const round = await Round.findById( roundId );
  if( round.closed ) return;
  round.closed = true;
  await round.save();
  startNewRound( round.flightId, round );
}

const getNextGame = async ( flight:any ):Promise<any> => {
  const playedRounds = await flight.rounds()
  const playedGameIds = _.map( playedRounds, round => round.gameId );
  for( let level = _.size(playedRounds); level--; level >= 0 ){
    let games = await Game.findByAttribute( { level } );
    games = _.filter( games, game => ! _.includes( playedGameIds, game.id ) );
    if( _.size( games ) ) return _.sample( games );
  }
  throw new Error('no more games');
}


const saveColutionSubmition = async ( contestantId:string, roundId:string, solution:any ) => {
  await SolutionSubmition.save({ contestantId, roundId, solution } );
  return true;
}

const getRoundResult = async (round:Round, contestant:Contestant ) => {
  const solutionSubmition = await SolutionSubmition.findByAttribute( { round, contestant } );
  const game = await round.game();

}

