// Deno does not implicitly provide Node globals outside npm modules.
export {Buffer} from 'node:buffer';
export {default as process} from 'node:process';
