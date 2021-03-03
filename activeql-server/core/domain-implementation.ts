import { EntityItem } from '../entities/entity-item';
import { Runtime } from './runtime';
import _ from 'lodash';

export abstract class DomainImplementation {

  constructor( protected runtime:Runtime ){}

	protected async findById( entity:string, id:string ):Promise<EntityItem>{
		return this.runtime.entity( entity ).findById( id );
	}

	protected async findOneByAttribute( entity:string, attributes:any  ):Promise<EntityItem|undefined>{
		return this.runtime.entity( entity ).findOneByAttribute( attributes )
	}

  protected async findByAttribute( entity:string, attributes:any  ):Promise<EntityItem[]>{
		return this.runtime.entity( entity ).findByAttribute( attributes )
	}

  protected async findByFilter( entity:string, filter:any ):Promise<EntityItem[]>{
    return this.runtime.entity( entity ).accessor.findByFilter( filter );
  }

	protected async save( entity:string, attributes:any ):Promise<EntityItem> {
		const enit = await this.runtime.entity( entity ).accessor.save( attributes );
		if( _.isArray( enit ) ) throw new Error( JSON.stringify( enit ) );
		return enit;
	}

	protected async delete( entity:string, id:string ):Promise<boolean> {
		return this.runtime.entity( entity ).accessor.delete( id );
	}



}
