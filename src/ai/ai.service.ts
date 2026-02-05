import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(message: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-5.2',
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    return responseContent;
  }

  async askAi(userMessage: string): Promise<{ response: string; model: string }> {
    const response = await this.chat(userMessage);
    return {
      response,
      model: 'gpt-4o',
    };
  }

  /**
   * Convert text to embeddings using text-embedding-3-small model
   * @param text The input text to embed
   * @returns The embedding vector
   */
  async textToEmbedding(text: string): Promise<{
    text: string;
    embedding: number[];
    model: string;
    dimension: number;
  }> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error('No embedding returned from OpenAI');
    }

    return {
      text,
      embedding,
      model: 'text-embedding-3-small',
      dimension: embedding.length,
    };
  }

  /**
   * Convert a database row object to readable text
   * @param rowData The database row object
   * @param tableName Optional table name for context
   * @returns Formatted readable text
   */
  objectToText(rowData: Record<string, any>, tableName?: string): string {
    if (!rowData || typeof rowData !== 'object') {
      throw new Error('Invalid row data provided');
    }

    let textContent = '';

    // Add table name as context if provided
    if (tableName) {
      textContent += `Record from ${tableName}:\n`;
    }

    // Convert each key-value pair to readable text
    Object.entries(rowData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Format key: convert camelCase/snake_case to readable format
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1') // camelCase to spaces
          .replace(/_/g, ' ') // snake_case to spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize words
          .trim();

        // Format value based on type
        let formattedValue = value;
        if (typeof value === 'object') {
          formattedValue = JSON.stringify(value);
        }

        textContent += `${formattedKey}: ${formattedValue}\n`;
      }
    });

    return textContent.trim();
  }

  /**
   * Convert database row object to text and then to embedding
   * @param rowData The database row object
   * @param tableName Optional table name for context
   * @returns Text representation and embedding
   */
  async objectToTextAndEmbed(
    rowData: Record<string, any>,
    tableName?: string,
  ): Promise<{
    originalData: Record<string, any>;
    text: string;
    embedding: number[];
    model: string;
    dimension: number;
  }> {
    // Convert object to text
    const text = this.objectToText(rowData, tableName);

    // Convert text to embedding
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embedding = response.data[0]?.embedding;
    if (!embedding) {
      throw new Error('No embedding returned from OpenAI');
    }

    return {
      originalData: rowData,
      text,
      embedding,
      model: 'text-embedding-3-small',
      dimension: embedding.length,
    };
  }
}

