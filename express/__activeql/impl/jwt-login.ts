import bcrypt from 'bcryptjs';
import express from 'express';
import { DomainConfiguration, DomainDefinition, Runtime } from 'activeql-server';
import { sign } from 'jsonwebtoken';
import _ from 'lodash';
import expressJwt from 'express-jwt';

require('dotenv').config();

const CLAIM = 'https://activeql.io';
const SECRET = process.env.JWT_SECRET || 'My$3cr3Tf0r$1gn1n9';
const ALGORITHM = 'HS256';

export const addJwtLogin = (domainDefinition:DomainDefinition) => {
  domainDefinition.add( domainConfiguration );
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}

export const useJwtLogin = (app:any) => {
  app.use( expressJwt({ secret: SECRET, algorithms: [ALGORITHM], credentialsRequired: false } ),
    (err:any, req:any, res:any, next:any) => err.code === 'invalid_token' ? next() : next( err ) );
    // https://github.com/auth0/express-jwt/issues/194
}

const generateToken = (principal:any) => sign(
  _.set( {}, [CLAIM], {principal} ), SECRET,
  { algorithm: ALGORITHM, subject: _.toString(principal.id), expiresIn: "1d" }
);

const login = async (runtime:Runtime, username:string, password:string) => {
  const user = await findUser( runtime, username );
  if( user && await bcrypt.compare( password, user.password ) ) return generateToken( user );
}

const findUser = async ( runtime:Runtime, username:string ) => {
  const entity = runtime.entity('User')
  const user = await entity.findOneByAttribute( { username } );
  return user ? user.item : undefined;
}

const addPrincipalToApolloContext = (expressContext:{req:express.Request}, apolloContext:any) => {
  const principal = _.get( expressContext.req, ['user', CLAIM, 'principal'] );
  _.set( apolloContext, 'principal', principal );
}

const domainConfiguration:DomainConfiguration = {
  entity: {
    User: {
      attributes: {
        username: 'Key',
        roles: '[String!]',
        password: {
          type: 'String!',
          objectTypeField: false
        }
      },
      permissions: {
        admin: true
      }
    }
  },
  query: {
    jwtValid: ( rt:Runtime ) => ({
      type: 'Boolean',
      resolve: (root:any, args:any, context:any) => rt.getPrincipal( { root, args, context} ) !== undefined
    })
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
