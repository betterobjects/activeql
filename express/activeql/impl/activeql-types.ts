import { GeneratedTypeDecorator, ActiveQLServer, Entity, ValidationViolation } from "activeql-server";

export enum FlightStatus {
  OPEN = "open",
  STARTED = "started",
  FINISHED = "finished",
}
export enum Locale {
  EN = "en",
  DE = "de",
}
export class Contestant {
  id:string = '';
  alive: boolean = false;
  playerId: string = '';
  player: () => Promise<Player> = () => {throw 'will be decorated'};
  flightId: string = '';
  flight: () => Promise<Flight> = () => {throw 'will be decorated'};

  static async findById( id:string):Promise<Contestant>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const item:Contestant = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByFilter( query:any ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Contestant[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const items:Contestant[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Contestant>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    const item:Contestant = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Contestant|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<Contestant|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Contestant') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Flight {
  id:string = '';
  status: FlightStatus = FlightStatus.OPEN;
  locale: Locale = Locale.EN;
  playerToStart: number = 0;
  latestStart: Date = new Date();
  rounds: () => Promise<Round[]> = () => {throw 'will be decorated'};
  contestants: () => Promise<Contestant[]> = () => {throw 'will be decorated'};

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

  static async findByFilter( query:any ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Flight[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const items:Flight[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Flight>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    const item:Flight = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Flight|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<Flight|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Flight') as Entity;
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

  static async findByFilter( query:any ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Game[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const items:Game[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Game>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    const item:Game = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Game|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Game') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
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

  static async findByFilter( query:any ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<OneOfNGame[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const items:OneOfNGame[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<OneOfNGame>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    const item:OneOfNGame = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<OneOfNGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('OneOfNGame') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
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

  static async findByFilter( query:any ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<AnswerTextGame[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const items:AnswerTextGame[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<AnswerTextGame>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    const item:AnswerTextGame = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<AnswerTextGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('AnswerTextGame') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
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

  static async findByFilter( query:any ):Promise<MagGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const items:MagGuessGame[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<MagGuessGame[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const items:MagGuessGame[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<MagGuessGame>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    const item:MagGuessGame = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<MagGuessGame|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<MagGuessGame|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('MagGuessGame') as Entity;
    return entity.accessor.delete( id );
  }
}

export class Player {
  id:string = '';
  name: string = '';
  locale: Locale = Locale.EN;

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

  static async findByFilter( query:any ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Player[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const items:Player[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Player>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    const item:Player = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Player|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<Player|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Player') as Entity;
    return entity.accessor.delete( id );
  }
}

export class RoundResult {
  id:string = '';
  solutionTime: number = 0;
  alive: boolean = false;
  position: number = 0;
  solutionSubmitionId: string = '';
  solutionSubmition: () => Promise<SolutionSubmition> = () => {throw 'will be decorated'};

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

  static async findByFilter( query:any ):Promise<RoundResult[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const items:RoundResult[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<RoundResult[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const items:RoundResult[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<RoundResult>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    const item:RoundResult = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<RoundResult|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<RoundResult|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('RoundResult') as Entity;
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

  static async findByFilter( query:any ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<Round[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const items:Round[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<Round>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    const item:Round = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<Round|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<Round|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('Round') as Entity;
    return entity.accessor.delete( id );
  }
}

export class SolutionSubmition {
  id:string = '';
  solution: any = {};
  roundId: string = '';
  round: () => Promise<Round> = () => {throw 'will be decorated'};
  contestantId: string = '';
  contestant: () => Promise<Contestant> = () => {throw 'will be decorated'};

  static async findById( id:string):Promise<SolutionSubmition>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    const item:SolutionSubmition = await entity.findById( id );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async findByIds( ids:string[] ):Promise<SolutionSubmition[]>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    const items:SolutionSubmition[] = await entity.findByIds( ids );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByFilter( query:any ):Promise<SolutionSubmition[]>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    const items:SolutionSubmition[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<SolutionSubmition[]>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    const items:SolutionSubmition[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<SolutionSubmition>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    const item:SolutionSubmition = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<SolutionSubmition|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<SolutionSubmition|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('SolutionSubmition') as Entity;
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

  static async findByFilter( query:any ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.accessor.findByFilter( query );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findByAttribute( attrValue:{[name:string]:any} ):Promise<User[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const items:User[] = await entity.findByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, items );
  }

  static async findOneByAttribute( attrValue:{[name:string]:any} ):Promise<User>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    const item:User = await entity.findOneByAttribute( attrValue );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  static async save( item:any ):Promise<User|ValidationViolation[]>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    item = await entity.accessor.save( item );
    return GeneratedTypeDecorator.decorateAssocs( entity, item );
  }

  async save():Promise<User|ValidationViolation[]> {
    throw 'will be decorated';
  }

  static async delete( id:string ):Promise<boolean>{
    const entity = ActiveQLServer.runtime?.entity('User') as Entity;
    return entity.accessor.delete( id );
  }
}
