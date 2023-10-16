import OpenAI from 'openai';

function createOpenAIChat(model, key) {
  let ai = new OpenAI({ apiKey: key });
  return (messages, stream) => ai.chat.completions.create({
    model, stream,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
  });
}

function createAzureOpenAIChat(name, deployment, key) {
  let ai = new OpenAI({
    baseURL: `https://${name}.openai.azure.com/openai/deployments/${deployment}`,
    defaultHeaders: { 'api-key': key },
    defaultQuery: { 'api-version': '2023-03-15-preview' }
  });
  return (messages, stream) => ai.chat.completions.create({
    messages: messages.map(m => ({
      role: m.role,
      content: m.content
    })),
    stream
  });
}

async function generateQuestions(chat, topic, count) {
  let res = await chat([{
    role: 'system',
    content: `Generate a quiz about the input topic, which contains ${count} questions and each question has 4 choices. Output the questions and answers directly in a json array, where each question is an object with "question", "choices" and "answer" property.`
  },
  {
    role: 'user',
    content: topic
  }]);

  try {
    let qs = JSON.parse(res.choices[0].message.content);
    // check the format of response in case AI generated abnormal results
    if (!Array.isArray(qs) || qs.length !== count) throw new Error('result is not an array of 12 elements');
    qs.forEach((q, i) => {
      if (typeof q.question !== 'string') throw new Error(`questions[${i}].question is not a string`);
      if (!Array.isArray(q.choices) || q.choices.length !== 4) throw new Error(`questions[${i}].choices is not an array of 4 elements`);
      q.choices.forEach((c, j) => {
        if (typeof c !== 'string') throw new Error(`questions[${i}].choices[${j}] is not a string`);
      });
      if (typeof q.answer !== 'string') throw new Error(`questions[${i}].answer is not a string`);
      if (q.choices.findIndex(c => c === q.answer) === -1) throw new Error(`questions[${i}].answer is not in choices`);
    });
    return qs.map(q => ({
      question: q.question,
      choices: q.choices,
      answer: q.answer
    }));
  } catch {
    throw new Error(`failed to generate questions, error: ${e}, response: ${res.choices[0].message.content}`, { cause: 'failed_generate_questions' });
  }
}

export { createAzureOpenAIChat, createOpenAIChat, generateQuestions };