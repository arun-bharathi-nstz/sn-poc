import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('message') message: string): Promise<{ response: string; model: string }> {
    return this.aiService.askAi(message);
  }

  @Post('ask')
  async ask(
    @Body() payload: { question: string },
  ): Promise<{ response: string; model: string }> {
    return this.aiService.askAi(payload.question);
  }

  @Post('embed')
  async embed(
    @Body() payload: { text: string },
  ): Promise<{
    text: string;
    embedding: number[];
    model: string;
    dimension: number;
  }> {
    return this.aiService.textToEmbedding(payload.text);
  }

  @Post('object-to-text')
  async objectToText(
    @Body() payload: { data: Record<string, any>; tableName?: string },
  ): Promise<{ text: string }> {
    const text = this.aiService.objectToText(payload.data, payload.tableName);
    return { text };
  }

  @Post('object-to-embed')
  async objectToEmbed(
    @Body() payload: { data: Record<string, any>; tableName?: string },
  ): Promise<{
    originalData: Record<string, any>;
    text: string;
    embedding: number[];
    model: string;
    dimension: number;
  }> {
    return this.aiService.objectToTextAndEmbed(payload.data, payload.tableName);
  }
}
