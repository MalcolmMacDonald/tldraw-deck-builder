const example = "(test) print hello world";
const example2 = "print hello world (test)";
const desiredOutput = "print hello world";
//regex to get text outside of parentheses if they exist
const regex = /^(.*?)(?:\s*\(.*?\))?$/;

