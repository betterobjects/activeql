import bcrypt from 'bcryptjs';
import express from 'express';
import expressJwt from 'express-jwt';
import { DomainConfiguration, DomainDefinition, Runtime } from 'activeql-server';
import { sign } from 'jsonwebtoken';
import _ from 'lodash';

export const addJwtLogin = ( domainDefinition:DomainDefinition, app:any ) => {
  app.use( expressJwt({ secret: process.env.JWT_SECRET || '', algorithms: ["HS256"], credentialsRequired: false } ) );
  domainDefinition.add( domainConfiguration );
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}

const claim = 'https://betterobjects.github.io/activeql';

const hash = (password:string):string => bcrypt.hashSync( password, bcrypt.genSaltSync(10) );

const generateToken = (principal:any) => sign(
  _.set( {}, [claim], {principal} ), process.env.JWT_SECRET || '',
  { algorithm: "HS256", subject: _.toString(principal.id), expiresIn: "1d" }
);

const login = async (runtime:Runtime, username:string, password:string) => {
  const user = await findUser( runtime, username );
  if( await bcrypt.compare( password, user.password ) ) return generateToken( user );
}

const findUser = async ( runtime:Runtime, username:string ) => {
  const entity = runtime.entity('User')
  const user = await entity.findOneByAttribute( { username } );
  return user ? user.item : {};
}

const addPrincipalToApolloContext = (expressContext:{req:express.Request}, apolloContext:any) => {
  const principal = _.get( expressContext.req, ['user', claim, 'principal'] );
  _.set( apolloContext, 'principal', principal );
}

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
        admin: true,
        manager: () => _.set( {}, 'username', { $ne: 'admin'} )
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
    })
  }
}
