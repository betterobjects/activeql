import express from 'express';
import { DomainDefinition } from 'activeql-server';
import _ from 'lodash';

export const addPrincipalFromHeader = ( domainDefinition:DomainDefinition ) => {
  domainDefinition.contextFn.push( addPrincipalToApolloContext );
}

const addPrincipalToApolloContext = async (expressContext:{req:express.Request}, apolloContext:any) => {
  const token = expressContext.req.headers.authorization;
  try {
    const principal = token ? JSON.parse( _.split( token, "'" ).join('"') ) : undefined;
    _.set( apolloContext, 'principal', principal );
  } catch (error) {
    // since this is a "hack" afterall fail silently is okay
  }
}

