export interface Question {
  id: string;
  expression: string;
  correctAnswer: number;
  options: number[];
}

export function generateQuestion(min = 1, max = 20): Question {
  const isAddition = Math.random() > 0.5;
  let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
  let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

  let expression = '';
  let correctAnswer = 0;

  if (isAddition) {
    expression = `${num1} + ${num2}`;
    correctAnswer = num1 + num2;
  } else {
    // Prevent negative results for early primary classroom stability
    if (num1 < num2) {
      const temp = num1;
      num1 = num2;
      num2 = temp;
    }
    expression = `${num1} - ${num2}`;
    correctAnswer = num1 - num2;
  }

  const wrongAnswers = new Set<number>();
  
  // Plausible distractor delta distribution strategies
  const strategies = [
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2,
    isAddition ? Math.abs(num1 - num2) : num1 + num2, // Inverted operation error
  ];

  for (const candidate of strategies) {
    if (candidate !== correctAnswer && candidate >= 0 && wrongAnswers.size < 3) {
      wrongAnswers.add(candidate);
    }
  }

  // Fallback generation loop if set sizes collapse due to boundary conditions
  while (wrongAnswers.size < 3) {
    const randomOffset = Math.floor(Math.random() * 5) + 1;
    const candidate = Math.random() > 0.5 ? correctAnswer + randomOffset : correctAnswer - randomOffset;
    if (candidate !== correctAnswer && candidate >= 0) {
      wrongAnswers.add(candidate);
    }
  }

  // Deterministically shuffle choices array
  const options = [correctAnswer, ...Array.from(wrongAnswers)].sort(() => Math.random() - 0.5);

  return {
    id: crypto.randomUUID(),
    expression,
    correctAnswer,
    options,
  };
}