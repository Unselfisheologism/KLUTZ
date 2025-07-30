import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

export class ReflyDefaultResponse extends StructuredTool {
  name = 'default_response';

  description = "Use this when no other tool satisfies the user's request.";

  schema = z.object({
    reason: z.string().describe('The reason why should call default_response tool'),
  });

  static lc_name() {
    return 'ReflyDefaultResponse';
  }

  async _call(): Promise<string> {
    return "I'm sorry, but I don't have a specific tool to handle this request. Let me try to assist you with my general knowledge.";
  }
}
