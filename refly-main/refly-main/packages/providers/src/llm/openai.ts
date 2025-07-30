import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { BaseMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { getEnvironmentVariable } from '@langchain/core/utils/env';
import {
  ChatOpenAI,
  ChatOpenAICallOptions,
  ChatOpenAIFields,
  ChatOpenAIStructuredOutputMethodOptions,
  OpenAIClient,
} from '@langchain/openai';
import { z } from 'zod';

export interface ChatDeepSeekCallOptions extends ChatOpenAICallOptions {
  headers?: Record<string, string>;
}

export interface ChatDeepSeekInput extends ChatOpenAIFields {
  /**
   * The Deepseek API key to use for requests.
   * @default process.env.DEEPSEEK_API_KEY
   */
  apiKey?: string;
  /**
   * The name of the model to use.
   */
  model?: string;
  /**
   * Up to 4 sequences where the API will stop generating further tokens. The
   * returned text will not contain the stop sequence.
   * Alias for `stopSequences`
   */
  stop?: Array<string>;
  /**
   * Up to 4 sequences where the API will stop generating further tokens. The
   * returned text will not contain the stop sequence.
   */
  stopSequences?: Array<string>;
  /**
   * Whether or not to stream responses.
   */
  streaming?: boolean;
  /**
   * The temperature to use for sampling.
   */
  temperature?: number;
  /**
   * The maximum number of tokens that the model can process in a single response.
   * This limits ensures computational efficiency and resource management.
   */
  maxTokens?: number;
  /**
   * The maximum number of reasoning tokens.
   */
  maxReasoningTokens?: number;
  /**
   * Whether to include reasoning content in the response.
   */
  include_reasoning?: boolean;
}

export class EnhancedChatOpenAI extends ChatOpenAI<ChatDeepSeekCallOptions> {
  static lc_name() {
    return 'ChatOpenAI';
  }

  _llmType() {
    return 'openai';
  }

  lc_serializable = true;

  lc_namespace = ['langchain', 'chat_models', 'deepseek'];

  constructor(fields?: Partial<ChatDeepSeekInput>) {
    const apiKey = fields?.apiKey || getEnvironmentVariable('DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error(
        `Deepseek API key not found. Please set the DEEPSEEK_API_KEY environment variable or pass the key into "apiKey" field.`,
      );
    }

    super({
      ...fields,
      apiKey,
      configuration: {
        baseURL: 'https://api.deepseek.com',
        ...fields?.configuration,
      },
      modelKwargs: {
        include_reasoning: fields?.include_reasoning || undefined,
        reasoning: fields?.include_reasoning
          ? { max_tokens: fields?.maxReasoningTokens }
          : undefined,
      },
    });
  }

  protected override _convertOpenAIDeltaToBaseMessageChunk(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delta: Record<string, any>,
    rawResponse: OpenAIClient.ChatCompletionChunk,
    defaultRole?: 'function' | 'user' | 'system' | 'developer' | 'assistant' | 'tool',
  ) {
    const messageChunk = super._convertOpenAIDeltaToBaseMessageChunk(
      delta,
      rawResponse,
      defaultRole,
    );
    messageChunk.additional_kwargs.reasoning_content = delta.reasoning;
    return messageChunk;
  }

  protected override _convertOpenAIChatCompletionMessageToBaseMessage(
    message: OpenAIClient.ChatCompletionMessage,
    rawResponse: OpenAIClient.ChatCompletion,
  ) {
    const langChainMessage = super._convertOpenAIChatCompletionMessageToBaseMessage(
      message,
      rawResponse,
    );
    langChainMessage.additional_kwargs.reasoning_content =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (message as any).reasoning_content;
    return langChainMessage;
  }

  withStructuredOutput<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RunOutput extends Record<string, any> = Record<string, any>,
  >(
    outputSchema:
      | z.ZodType<RunOutput>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | Record<string, any>,
    config?: ChatOpenAIStructuredOutputMethodOptions<false>,
  ): Runnable<BaseLanguageModelInput, RunOutput>;

  withStructuredOutput<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RunOutput extends Record<string, any> = Record<string, any>,
  >(
    outputSchema:
      | z.ZodType<RunOutput>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | Record<string, any>,
    config?: ChatOpenAIStructuredOutputMethodOptions<true>,
  ): Runnable<BaseLanguageModelInput, { raw: BaseMessage; parsed: RunOutput }>;

  withStructuredOutput<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RunOutput extends Record<string, any> = Record<string, any>,
  >(
    outputSchema:
      | z.ZodType<RunOutput>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | Record<string, any>,
    config?: ChatOpenAIStructuredOutputMethodOptions<boolean>,
  ):
    | Runnable<BaseLanguageModelInput, RunOutput>
    | Runnable<BaseLanguageModelInput, { raw: BaseMessage; parsed: RunOutput }>;

  withStructuredOutput<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RunOutput extends Record<string, any> = Record<string, any>,
  >(
    outputSchema:
      | z.ZodType<RunOutput>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      | Record<string, any>,
    config?: ChatOpenAIStructuredOutputMethodOptions<boolean>,
  ):
    | Runnable<BaseLanguageModelInput, RunOutput>
    | Runnable<BaseLanguageModelInput, { raw: BaseMessage; parsed: RunOutput }> {
    const ensuredConfig = { ...config };
    // Deepseek does not support json schema yet
    if (ensuredConfig?.method === undefined) {
      ensuredConfig.method = 'functionCalling';
    }
    return super.withStructuredOutput<RunOutput>(outputSchema, ensuredConfig);
  }
}
