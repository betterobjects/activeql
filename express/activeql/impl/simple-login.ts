import bcrypt from 'bcryptjs';
import express from 'express';
import { DomainConfiguration, DomainDefinition, Runtime } from 'activeql-server';
import _ from 'lodash';

export const addSimpleLogin = ( domainDefinition:DomainDefinition ) => {
  domainDefinition.add( domainConfiguration );
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}

const MAX_VALID = 12 * 60 * 60 * 1000; // 12 hours

type UserEntry = { user:any, date:number };

const users:{[token:string]:UserEntry} = {};

const hash = (password:string):string => bcrypt.hashSync( password, bcrypt.genSaltSync(10) );

const generateToken = () => hash( _.toString(_.random(9999999) ) );

const invalidToken = (token:string) => _.unset( users, token );

const login = async (runtime:Runtime, username:string, password:string) => {
  const user = await findUser( runtime, username );
  if( ! await bcrypt.compare( password, user.password ) ) return undefined;
  const token = generateToken();
  setUser( user, token );
  return token;
}

const findUser = async ( runtime:Runtime, username:string ) => {
  const entity = runtime.entity('User')
  const user = await entity.findOneByAttribute( { username } );
  return user ? user.item : {};
}

const setUser = (user:any, token:string) => {
  const roles = user.roles;
  _.set( user, 'roles', () => _.includes( roles, 'admin' ) ? true : roles );
  _.set( users, [token], { user, date: Date.now() } );
}

const validUser = ( token:string) => {
  const entry = users[token];
  if( entry && (Date.now() - entry.date) < MAX_VALID ) return entry.user;
  invalidToken( token );
}

const addPrincipalToApolloContext = async (expressContext:{req:express.Request}, apolloContext:any) => {
  const token = expressContext.req.headers.authorization;
  const principal = token ? validUser( token ) : undefined;
  _.set( apolloContext, 'principal', principal );
}

const logoff = (token:string) => _.unset( users, [token] );

const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      attributes: {
        username: 'Key',
        password: {
          type: 'String!',
          resolve: () => '***'
        },
        roles: '[String!]'
      },
      permissions: {
        admin: true
      },
      seeds: {
        admin: {
          username: 'admin',
          password: hash('admin'),
          roles: ['admin']
        },
        manager: {
          username: 'manager',
          password: hash('manager'),
          roles: ['manager', 'user']
        },
        user: {
          username: 'user',
          password: hash('user'),
          roles: ['user']
        },
        assistant: {
          username: 'assistant',
          password: hash('assistant'),
          roles: ['assistant']
        }
      }
    }
  },
  mutation: {
    login: ( runtime:Runtime ) => ({
      type: 'String',
      args: {
        username: 'String!',
        password: 'String!'
      },
      resolve: (root:any, args:any) => login( runtime, args.username, args.password ),
      description: 'returns a token if successfull, null otherwise'
    }),
    logoff: () => ({
      type: 'String',
      args: { token: 'String!' },
      resolve: (root:any, args:any) => logoff( args.token ),
      description: 'invalidates the token'
    })
  }
}
