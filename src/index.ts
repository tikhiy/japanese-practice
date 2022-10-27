import { readFileSync } from "fs";
import prompts from "prompts";
import { shuffle, pick } from "./random/index.js";

type Data = [string | string[], string][];

const data = JSON.parse(
  readFileSync("data.json", { encoding: "utf-8" })
) as Data;

type QuestionOptions = {
  choices: string[];
  message: string;
};

class Question {
  choices: prompts.Choice[];
  state: prompts.Choice[] = [];

  constructor(readonly options: QuestionOptions) {
    this.choices = options.choices.map((choice) => ({
      title: choice,
    }));
  }

  async prompt() {
    while (true) {
      console.clear();

      const choices = this.answer
        ? [
            {
              title: this.answer,
              description: "Return to submit",
              value: -1,
            } as prompts.Choice,
          ]
        : [];

      for (let choice of this.choices) {
        if (!this.state.includes(choice)) {
          choices.push(choice);
        }
      }

      const options = {
        choices,
        hint: this.answer,
        message: this.options.message,
        name: "answer" as const,
        type: "select" as const,
      };

      const { answer } = await prompts(options);

      if (typeof answer === "undefined") {
        if (!this.state.length) {
          return;
        }

        this.state.pop();
      } else if (answer !== -1) {
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

const { QUESTIONS_AMOUNT } = await prompts({
  initial: Infinity,
  max: Infinity,
  message: "practice length",
  min: 1,
  name: "QUESTIONS_AMOUNT",
  type: "number",
});

let score = 0;

const createChoices = (entries: Data) => {
  const choices = [];

  for (const [options] of entries) {
    for (const option of options) {
      choices.push(...option);
    }
  }

  choices.sort();

  return choices;
};

for (let i = 0; i < QUESTIONS_AMOUNT; ++i) {
  const item = pick(data)!;
  const list = shuffle(data.filter((i) => i !== item));
  const possibleAnswers = typeof item[0] === "string" ? [item[0]] : item[0];

  list.length = 2;
  list.push(item);

  const choices = createChoices(list);

  const q = new Question({
    choices,
    message: `translate "${item[1]}"`,
  });

  const answer = await q.prompt();

  let isCorrect = false;

  if (answer) {
    isCorrect = possibleAnswers.includes(answer);

    if (isCorrect) {
      ++score;
    }
  }

  let message: string;

  if (isCorrect) {
    message = `correct`;

    if (possibleAnswers.length > 1) {
      message += `. possible answer: ${possibleAnswers
        .filter((v) => v !== answer)
        .join(",")}`;
    }
  } else {
    message = `correct answer: ${
      typeof item[0] === "string" ? item[0] : item[0].join(", ")
    }`;
  }

  const response = await prompts({
    initial: true,
    message,
    name: "continue",
    type: "confirm",
  });

  if (!response.continue) {
    break;
  }
}

console.log(`number of correct answers: ${score}`);
