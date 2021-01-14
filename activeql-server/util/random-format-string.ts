import _ from 'lodash';

export class RandomFormatString {

  public static readonly alphaLower = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  public static readonly alphaUpper = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
  public static numeric = ['0','1','2','3','4','5','7','8','9'];
  public static specialChars = ['^','!','§','$','%','&','/','(',')','?',',','.','-','_',':','<','>'];

  private _value:(undefined|string)[] = [];
  get value() { return _.join( _.compact(this._value), '')  }

  alphaUpper( count?:number, randMax?:number, share?:number ):RandomFormatString{
    return this.append( RandomFormatString.alphaUpper, count, randMax, share );
  }

  alphaLower( count?:number, randMax?:number, share?:number ):RandomFormatString{
    return this.append( RandomFormatString.alphaLower, count, randMax, share );
  }

  alpha( count?:number, randMax?:number, share?:number ):RandomFormatString{
    return this.append( _.union( RandomFormatString.alphaLower, RandomFormatString.alphaUpper), count, randMax, share );
  }

  numeric( count?:number, randMax?:number, share?:number ):RandomFormatString{
    return this.append( RandomFormatString.numeric, count, randMax, share );
  }

  specialChars( count?:number, randMax?:number, share?:number ):RandomFormatString{
    return this.append( RandomFormatString.specialChars, count, randMax, share );
  }

  append( values:string|string[], count?:number, randMax?:number, share?:number ):RandomFormatString {
    if( _.isNumber( share ) &&  _.random(0,1,true) > share ) return this;
    if( _.isString( values ) ) {
      this._value.push( values );
      return this;
    }
    if( _.isNil( count ) ) count = 1;
    count = _.isNil( randMax ) ? count : _.random( count, randMax );
    _.times( count, () => this._value.push( _.sample( values ) ) );
    return this;
  }

  toString() { return this.value }

}

