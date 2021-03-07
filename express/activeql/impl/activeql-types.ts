import { GeneratedTypeDecorator } from "./generated-type-decorator";
import { ActiveQLServer, Entity, ValidationViolation } from "activeql-server";

export class Flight {
  id:string = '';
  status: string = '';
  locale: string = '';
  playerToStart: number = 0;
  latestStart: Date = new Date();
  playerIds: string[] = [];
  players: () => Promise<Player[]> = () => {throw 'will be decorated'};
  rounds: () => Promise<Round[]> = () => {throw 'will be decorated'};

  static async findById( id:string):Promise<Flight>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const item:Flight = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<Flight>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const item:Flight = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Flight|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<Flight|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Player {
  id:string = '';
  name: string = '';
  locale: string = '';

  static async findById( id:string):Promise<Player>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const item:Player = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<Player>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const item:Player = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Player|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<Player|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Game {
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;

  static async findById( id:string):Promise<Game>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const item:Game = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<Game>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const item:Game = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Game|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<Game|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    return entity.accessor.delete( id );
  }
}

export class OneOfNGame {
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  question_de: string = '';
  question_en: string = '';
  options_de: string[] = [];
  options_en: string[] = [];
  solution: number = 0;

  static async findById( id:string):Promise<OneOfNGame>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const item:OneOfNGame = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<OneOfNGame>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const item:OneOfNGame = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<OneOfNGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<OneOfNGame|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class AnswerTextGame {
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  question_de: string = '';
  question_en: string = '';
  solution_de: string = '';
  solution_en: string = '';

  static async findById( id:string):Promise<AnswerTextGame>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const item:AnswerTextGame = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<AnswerTextGame>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const item:AnswerTextGame = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<AnswerTextGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<AnswerTextGame|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class MagGuessGame {
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  task_de: string = '';
  task_en: string = '';
  mapUrl: string = '';
  solution_lat: number = 0;
  solution_long: number = 0;

  static async findById( id:string):Promise<MagGuessGame>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const item:MagGuessGame = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<MagGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const items:MagGuessGame[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<MagGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const items:MagGuessGame[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<MagGuessGame>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const item:MagGuessGame = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<MagGuessGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<MagGuessGame|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Round {
  id:string = '';
  start: Date = new Date();
  level: number = 0;
  closed: boolean = false;
  gameId: string = '';
  game: () => Promise<Game> = () => {throw 'will be decorated'};
  flightId: string = '';
  flight: () => Promise<Flight> = () => {throw 'will be decorated'};

  static async findById( id:string):Promise<Round>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const item:Round = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<Round>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const item:Round = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Round|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<Round|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    return entity.accessor.delete( id );
  }
}

export class RoundResult {
  id:string = '';
  solutionTime: number = 0;
  alive: boolean = false;
  position: number = 0;
  roundId: string = '';
  round: () => Promise<Round> = () => {throw 'will be decorated'};
  playerId: string = '';
  player: () => Promise<Player> = () => {throw 'will be decorated'};

  static async findById( id:string):Promise<RoundResult>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const item:RoundResult = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<RoundResult[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const items:RoundResult[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<RoundResult[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const items:RoundResult[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<RoundResult>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const item:RoundResult = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<RoundResult|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<RoundResult|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    return entity.accessor.delete( id );
  }
}

export class User {
  id:string = '';
  username: string = '';
  roles: string[] = [];
  password: string = '';

  static async findById( id:string):Promise<User>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const item:User = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( query:any ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.findByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( query:any ):Promise<User>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const item:User = await entity.findOneByAttribute( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<User|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    return entity.accessor.save( item );
  }

  async save():Promise<User|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    return entity.accessor.delete( id );
  }
}
