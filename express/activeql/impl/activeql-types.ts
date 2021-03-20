import { TypesGenerator, ActiveQLServer, Entity, ValidationViolation } from "activeql-server";
import _ from "lodash";

export enum FlightStatus {
  OPEN = "open",
  STARTED = "started",
  FINISHED = "finished",
}
export enum Locale {
  EN = "en",
  DE = "de",
}
export enum SubmitionResult {
  CORRECT = "correct",
  INCORRECT = "incorrect",
  DISTANCE = "distance",
  LATE = "late",
  REPEATED = "repeated",
}
export class Contestant {
  readonly __typename:string = 'Contestant';
  id:string = '';
  alive: boolean = false;
  playerId: string = '';
  player: () => Promise<Player> = () => {throw 'will be decorated'};
  flightId: string = '';
  flight: () => Promise<Flight> = () => {throw 'will be decorated'};

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Contestant');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Contestant>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const item:Contestant = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Contestant>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const item:Contestant = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Contestant|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Contestant> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Flight {
  readonly __typename:string = 'Flight';
  id:string = '';
  status: FlightStatus = FlightStatus.OPEN;
  locale: Locale = Locale.EN;
  playerToStart: number = 0;
  latestStart: Date = new Date();
  rounds: () => Promise<Round[]> = () => {throw 'will be decorated'};
  contestants: () => Promise<Contestant[]> = () => {throw 'will be decorated'};

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Flight');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Flight>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const item:Flight = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Flight>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const item:Flight = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Flight|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Flight> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Game {
  readonly __typename:string = 'Game';
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Game');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Game>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const item:Game = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Game>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const item:Game = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Game|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Game> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    return entity.accessor.delete( id );
  }
}

export class OneOfNGame {
  readonly __typename:string = 'OneOfNGame';
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  question_de: string = '';
  question_en: string = '';
  options_de: string[] = [];
  options_en: string[] = [];
  solution: number = 0;

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('OneOfNGame');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<OneOfNGame>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const item:OneOfNGame = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<OneOfNGame>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const item:OneOfNGame = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<OneOfNGame|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<OneOfNGame> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class AnswerTextGame {
  readonly __typename:string = 'AnswerTextGame';
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  question_de: string = '';
  question_en: string = '';
  solution_de: string = '';
  solution_en: string = '';

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('AnswerTextGame');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<AnswerTextGame>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const item:AnswerTextGame = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<AnswerTextGame>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const item:AnswerTextGame = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<AnswerTextGame|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<AnswerTextGame> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class MapGuessGame {
  readonly __typename:string = 'MapGuessGame';
  id:string = '';
  name: string = '';
  playTime: number = 0;
  level: number = 0;
  task_de: string = '';
  task_en: string = '';
  mapUrl: string = '';
  solution_lat: number = 0;
  solution_long: number = 0;

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('MapGuessGame');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<MapGuessGame>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    const item:MapGuessGame = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<MapGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    const items:MapGuessGame[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<MapGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    const items:MapGuessGame[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<MapGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    const items:MapGuessGame[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<MapGuessGame>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    const item:MapGuessGame = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<MapGuessGame|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<MapGuessGame> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('MapGuessGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Player {
  readonly __typename:string = 'Player';
  id:string = '';
  name: string = '';
  locale: Locale = Locale.EN;

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Player');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Player>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const item:Player = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Player>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const item:Player = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Player|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Player> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Round {
  readonly __typename:string = 'Round';
  id:string = '';
  level: number = 0;
  closed?: boolean;
  gameId: string = '';
  game: () => Promise<Game> = () => {throw 'will be decorated'};
  flightId: string = '';
  flight: () => Promise<Flight> = () => {throw 'will be decorated'};
  submitions: () => Promise<Submition[]> = () => {throw 'will be decorated'};

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Round');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Round>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const item:Round = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Round>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const item:Round = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Round|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Round> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Submition {
  readonly __typename:string = 'Submition';
  id:string = '';
  answer: any = {};
  result: SubmitionResult = SubmitionResult.CORRECT;
  distance?: number;
  roundId: string = '';
  round: () => Promise<Round> = () => {throw 'will be decorated'};
  contestantId: string = '';
  contestant: () => Promise<Contestant> = () => {throw 'will be decorated'};

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('Submition');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<Submition>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    const item:Submition = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Submition[]>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    const items:Submition[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<Submition[]>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    const items:Submition[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Submition[]>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    const items:Submition[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Submition>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    const item:Submition = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<Submition|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<Submition> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Submition') as Entity;
    return entity.accessor.delete( id );
  }
}

export class User {
  readonly __typename:string = 'User';
  id:string = '';
  seeds?: string;

  constructor( item?:any ){
    if( ! item ) return;
    _.merge( this, item);
    const entity = ActiveQLServer.runtime.entity('User');
    TypesGenerator.decorateItems( entity, this );
  }


  static async findById( id:string):Promise<User>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const item:User = await entity.findById( id );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.findByIds( ids );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByFilter( query:any ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.accessor.findByFilter( query );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.findByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<User>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const item:User = await entity.findOneByAttribute( attrValue );
    return TypesGenerator.decorateItems( entity, item );
  }

  static async save( item:any ):Promise<User|ValidationViolation[]>{
    if( item.id === '') _.unset( item, 'id');
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    item = await entity.accessor.save( item );
    if( Array.isArray(item) ) return item;
    return TypesGenerator.decorateItems( entity, item );
  }

  async save():Promise<User> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    return entity.accessor.delete( id );
  }
}
