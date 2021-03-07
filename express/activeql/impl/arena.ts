import { DomainConfiguration, DomainDefinition, DomainImplementation, Runtime } from 'activeql-server';
import _ from 'lodash';

import { Flight, Player, Round, Game } from './activeql-types';

export const addArena = (domainDefinition:DomainDefinition) => domainDefinition.add( domainConfiguration )

const domainConfiguration:DomainConfiguration = {
	mutation: {
		enrolToFlight: (rt:Runtime) => ({
			type: 'Flight',
			args: {
				playerId: 'ID!'
			},
			resolve: async (root:any, args:any) => {
				return new Arena( rt ).enrolPlayerToFlight( args.playerId );
			}
		})
	},

  type: {
    FlightSubscripionResult: {
      fields: {
        nextRound: 'Round!',
        lastRoundResult: 'RoundResult'
      }
    }
  },

	subscription: {
		flight: (rt:Runtime) => ({
      type: 'FlightSubscripionResult',
      args: {
        flightId: 'String!',
        playerId: 'String!'
      },
      subscribe: async (root:any, {flightId, playerId}) =>
        rt.pubsub.asyncIterator( `flight-${flightId}-${playerId}` )
    })
	}
}

class Arena extends DomainImplementation {

  GRACE_TIME_TO_START = 3 * 1000;
	TIME_TO_START = 200 * 1000;

	async enrolPlayerToFlight( playerId:string ){
    const player = await this.getPlayerAndMoveFromExistingFlight( playerId );
		const flight = await this.findOrCreateOpenFlight( player.locale );
		flight['playerIds'] = _.compact( _.concat( flight['playerIds'], playerId ) );
		await flight.save();
    if( _.size( flight.playerIds ) >= flight.playerToStart ) setTimeout(
      () => this.startFlight( flight.id ), this.GRACE_TIME_TO_START );
		return flight;
	}

  private async getPlayerAndMoveFromExistingFlight( playerId:string ){
    const flights = await Flight.findByAttribute( { playerIds: {is: playerId } } );
    for( let i = 0; i < flights.length; i++ ) {
      const flight = flights[i];
      _.remove( flight.playerIds, playerId );
      await flight.save();
    }
    return Player.findById( playerId );
  }

	private async findOrCreateOpenFlight(locale:String):Promise<any> {
		const flight = await Flight.findOneByAttribute( { locale, status: 'open' });
		if( flight && flight.latestStart.getDate() - Date.now() > this.GRACE_TIME_TO_START ) return flight;
    const latestStart = new Date( Date.now() + this.TIME_TO_START );
		const newFlight = await Flight.save( { locale, status: 'open', latestStart, playerToStart: 3 } ) as Flight;
		setTimeout( () => this.startFlight( newFlight.id ), this.TIME_TO_START );
		return newFlight
	}

	private async startFlight( flightId: string ){
		const flight = await Flight.findById( flightId );
		if( flight.status !== 'open' ) return;
    // ???
		await flight.save();
		this.newRound( flight.id );
	}

  private async newRound( flightId:string, lastRound?:any ){
    const flight = await Flight.findById( flightId );
    const game = await this.getNextGame( flight );
    const rounds = await flight.rounds();
    const level = _.size( rounds );
    const newRound = await Round.save({ flightId, gameId: game.id, level }) as Round;
    await this.publishRound( flight, newRound, lastRound );
    setTimeout( () => this.roundEnd( newRound.id ), game.playTime );
  }

  private async publishRound( flight:Flight, nextRound:any, lastRound?:any ){
    const players = await flight.players();
    _.forEach( players, player => {
      const lastRoundResult = lastRound ? { solutionTime: 1000, alive: true, position: 3 } : undefined;
      this.pubsub.publish( `flight-${flight.id}-${player.id}`, {nextRound, lastRoundResult} );
    });
  }

  private async roundEnd( roundId:string ) {
    const round = await Round.findById( roundId );
    if( round.closed ) return;
    round.closed = true;
    await round.save();
    this.newRound( round.flightId, round );
  }

  private async getNextGame( flight:any ):Promise<any> {
    const playedRounds = await flight.rounds()
    const playedGameIds = _.map( playedRounds, round => round.gameId );
    for( let level = _.size(playedRounds); level--; level >= 0 ){
      let games = await Game.findByAttribute( { level } );
      games = _.filter( games, game => ! _.includes( playedGameIds, game.id ) );
      if( _.size( games ) ) return _.sample( games );
    }
    throw new Error('no more games');
  }
}
