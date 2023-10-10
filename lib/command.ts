import * as readline from 'readline';

const colorGreen = '\x1b[32m';
const colorRed = '\x1b[31m';
const resetColor = '\x1b[0m';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Ask for user input and wait for response.
 * @param question question to ask
 * @returns string response
 */
export function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (userInput: string) => resolve(userInput));
  });
}

/**
 * Asks a yes/no question.
 * Any string starting with 'y' or 'Y' is considered a yes.
 * @param question question to ask
 * @returns boolean true if yes, false if other
 */
export function askYesNo(question: string): Promise<boolean> {
  const ynQuestion = question + ' (y/n) ';
  return new Promise((resolve) => {
    rl.question(ynQuestion, (userInput: string) =>
      resolve((userInput + '').toLowerCase().startsWith('y'))
    );
  });
}

export function abort(message?: string): void {
  const abortMessage = message ? message : 'Aborting';
  console.warn(colorRed + abortMessage + resetColor);
  rl.close();
}

export function questionsDone(): void {
  rl.close();
}

export function info(message: string): void {
  console.info(colorGreen + message + resetColor);
}

export function warn(message: string): void {
  console.warn(colorRed + message + resetColor);
}
