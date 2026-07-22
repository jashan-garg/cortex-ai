import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { vectorStore } from '../config/vectorDb.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getModel } from '../config/llmModels.js';
import { deductCredits } from '../utils/deductCredits.js';

export const pdfRag = async (state) => {
  let collectionName; // <-- move outside try
  let store; // <-- move outside try

  try {
    const buffer = fs.readFileSync(state?.file?.path);
    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    const text = result.text;

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    collectionName = `pdf-${Date.now()}`;
    store = await vectorStore(collectionName, docs); // assign to outer variable

    const relevantDocs = await store.similaritySearch(state.prompt, 5);
    const context = relevantDocs.map((doc) => doc.pageContent).join('\n\n');
    const llm = await getModel('pdf-rag');

    const messages = [
      new SystemMessage(` You are Cortex AI PDF Assistant, made by Jashan Garg.
        Rules:
        - Answer ONLY from the uploaded PDF.
        - Never make up information.
        - If the answer is not present in the PDF, reply:
        "I couldn't find this information in the uploaded PDF."
        - Use Markdown formatting.`),
      new HumanMessage(`
        Context: ${context}.
        Question: ${state.prompt}`),
    ];

    const response = await llm.invoke(messages);
    return {
      ...state,
      aiResponse: response.content,
    };
  } catch (error) {
    console.error('PDF RAG error:', error);
    return {
      ...state,
      aiResponse: 'Failed to analyse the file, please try again',
    };
  } finally {
    await deductCredits(state.userId, 'pdf');
    try {
      if (state?.file?.path) fs.unlinkSync(state.file.path);

      // Now store and collectionName are accessible
      if (store && collectionName) {
        await store.client.deleteCollection(collectionName);
      }
    } catch (err) {
      console.log(`Cleanup error: ${err.message}`);
    }
  }
};
