import { isBooleanExp, isNumberExp, isTextExp } from '../../modules/Check';

/* prettier-ignore */
export class Scalar {
  public lineNumber: number;

  public templateName: string;

  public value: string | number | boolean | undefined | null;

  constructor(scalar: string, templateName:string, lineNumber:number) {

    this.templateName = templateName;
    this.lineNumber = lineNumber;

    const casters = [
      { check: isTextExp, cast: (val: string) => val.slice(1, -1) },
      { check: isNumberExp, cast: (val: string) => Number(val) },
      { check: isBooleanExp, cast: (val: string) => Boolean(val) },
      { check: (val:string) => val === 'undefined', cast: (val:string):undefined => undefined },
      { check: (val:string) => val === 'null', cast: (val: string):null => null },
    ];
    
    for (let index = 0; index < casters.length; index++) {
      const caster = casters[index];
      if(caster.check(scalar)) this.value =  caster.cast(scalar)
    }
  
  }

  public static check(value: string): boolean {
    return ( isTextExp(value) 
      || isNumberExp(value) 
      || isBooleanExp(value) 
      || value === 'undefined' 
      || value === 'null'
    );
  }
}
