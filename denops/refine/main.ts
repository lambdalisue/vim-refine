import type { Entrypoint } from "jsr:@denops/std@^7.4.0";
import { assert, is } from "jsr:@core/unknownutil@^4.3.0";
import { Ollama } from "npm:@langchain/ollama@^0.1.2";
import { PromptTemplate } from "npm:@langchain/core@^0.3.22/prompts";

const template = new PromptTemplate({
  inputVariables: ["text"],
  template: `
  Please correct or translate the given text into standard English.
  Strive to preserve both the original meaning and structure (including line breaks, leading comments, etc.).
  Provide no explanations. Format the translated text with triple double quotes.
  """{text}"""
  `,
});

async function refine(text: string, { signal }: { signal?: AbortSignal }) {
  const llm = new Ollama({ model: "llama3", temperature: 0 });
  const prompt = await template.format({ text });
  const result = await llm.invoke(prompt, { signal });
  const m = /"""(.*)"""/ms.exec(result.trim());
  if (m === null) {
    return result;
  }
  return m[1];
}

export const main: Entrypoint = (denops) => {
  const controller = new AbortController();
  const signal = denops.interrupted
    ? AbortSignal.any([denops.interrupted, controller.signal])
    : controller.signal;
  denops.dispatcher = {
    refine: async (text) => {
      assert(text, is.String);
      return await refine(text, { signal });
    },
  };
  return {
    [Symbol.asyncDispose]() {
      controller.abort();
      return Promise.resolve();
    },
  };
};
