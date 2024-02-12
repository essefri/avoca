import { ComponentParserError } from '../../../errors/regex/ComponentParserError';

/* prettier-ignore */
export class LineCounter {
  
  /**
  * Get the line number corresponding to a given position in the template.
  *
  * @param {string} template - The template content.
  * @param {number} position - The position to find the line number for.
  * @param {number} [parentLine=1] - The parent line number (default is 1).
  * @throws {ComponentParserError} If an invalid position is provided.
  * @returns {number} The calculated line number.
  */
  protected getLineNumber(template: string, position: number, parentLine: number = 1): number {
    let line = parentLine;

    if (position > template.length) {
      throw new ComponentParserError('Invalid position provided');
    }

    for (let index = 0; index < position; index++) {
      const character = template[index];

      if (character === '\n') {
        line++;
      }
    }

    return line;
  }
}
