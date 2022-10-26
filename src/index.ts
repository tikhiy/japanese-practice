import { readFileSync } from "fs";
import prompts from "prompts";
import { shuffle, pick } from "./random/index.js";

type Data = [string, string][];

const data = JSON.parse(
  readFileSync("data.json", { encoding: "utf-8" })
) as Data;

type QuestionOptions = {
  choices: string[];
  message: string;
};

class Question {
  choices: prompts.Choice[];
  RETURN = { title: "<RETURN>" };
  state: prompts.Choice[] = [];

  constructor(readonly options: QuestionOptions) {
    this.choices = options.choices.map((choice) => ({
      title: choice,
    }));
  }

  async prompt() {
    while (true) {
      console.clear();

      const choices = [this.RETURN];

      for (let choice of this.choices) {
        if (!this.state.includes(choice)) {
          choices.push(choice);
        }
      }

      const message = `${this.options.message} ${
        this.state.length ? `(${this.answer})` : ""
      }`;

      const options = {
        choices,
        message,
        name: "answer" as const,
        type: "select" as const,
      };

      const { answer } = await prompts(options);

      if (typeof answer === "undefined") {
        if (!this.state.length) {
          return;
        }

        this.state.pop();
      } else if (answer) {
        this.state.push(options.choices[answer]);
      } else {
        return this.answer;
      }
    }
  }

  get answer() {
    return this.state.map(({ title }) => title).join("");
  }
}

const QUESTIONS_AMOUNT = 15;

let score = 0;

for (let i = 0; i < QUESTIONS_AMOUNT; ++i) {
  const item = pick(data)!;
  const list = shuffle(data.filter((i) => i !== item));

  list.length = 2;
  list.push(item);

  const choices = [];

  for (const [furigana] of list) {
    for (const c of furigana) {
      choices.push(c);
    }
  }

  choices.sort();

  const q = new Question({
    choices,
    message: `translate "${item[1]}"`,
  });

  const answer = await q.prompt();
  const isCorrect = answer === item[0];

  if (isCorrect) {
    ++score;
  }

  const response = await prompts({
    initial: true,
    message: isCorrect ? `correct` : `correct answer: ${item[0]}`,
    name: "continue",
    type: "confirm",
  });

  if (!response.continue) {
    break;
  }
}

console.log(`number of correct answers: ${score}`);
