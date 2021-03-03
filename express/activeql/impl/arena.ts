import { DomainConfiguration, DomainDefinition, DomainImplementation, EntityItem, Runtime } from 'activeql-server';
import _ from 'lodash';

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

	subscription: {
		flightStart: () => 'Flight'
	}
}


class Arena extends DomainImplementation {

	TIME_TO_START = 200 * 1000;

	async enrolPlayerToFlight( playerId:string ){
    const player = await this.getPlayerAndMoveFromExistingFlight( playerId );
		const flight = await this.findOrCreateOpenFlight( player.item.locale );
		if( _.includes( flight.item['playerIds'], playerId ) ) return flight.item;
		flight.item['playerIds'] = _.compact( _.concat( flight.item['playerIds'], playerId ) );
		await flight.save();
		if( flight.item['playerIds'].length >= flight.item.playerToStart ) this.startFlight( flight.id );
		return flight.item;
	}

  private async getPlayerAndMoveFromExistingFlight( playerId:string ){
    const flights = await this.findByFilter( 'Flight', { playerIds: {is: playerId } } );
    _.each( flights, flight => flight.item.playerId = _.remove( flight.item.playerIds, playerId ) );
    return this.findById( 'Player', playerId );
  }

	private async findOrCreateOpenFlight(locale:String):Promise<EntityItem> {
		const flight = await this.findOneByAttribute( 'Flight', { locale, status: 'open' });
		if( flight ) return flight;
    const latestStart = new Date( Date.now() + this.TIME_TO_START );
    const status = 'open';
    const playerToStart = 3;
		const newFlight = await this.save('Flight', { locale, status, latestStart, playerToStart } );
		setTimeout( () => this.startFlight( newFlight.id ), this.TIME_TO_START );
		return newFlight
	}

	private async startFlight( flightId: string ){
		const flight = await this.findById( 'Flight', flightId );
		if( flight.item.start ) return;
		flight.item.start = new Date();
		await flight.save();
		this.runtime.pubsub.publish('flightStart', flight.item );
	}
}
