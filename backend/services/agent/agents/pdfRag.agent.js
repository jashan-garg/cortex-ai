import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { getModel } from '../config/llmModels.js';
import { deductCredits } from '../utils/deductCredits.js';
import { checkLimit } from '../config/agentLimit.js';
import { embeddings } from '../config/embeddings.js';
import { selectRelevantDocuments } from '../utils/semanticSearch.js';

export const pdfRag = async (state) => {
  try {
    await checkLimit(state.userId, 'pdf');
    if (!state?.file?.path) throw new Error('No PDF file was uploaded');

    const buffer = fs.readFileSync(state?.file?.path);
    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    const text = result.text?.trim();
    if (!text) throw new Error('The uploaded PDF contains no extractable text');

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await splitter.createDocuments([text]);
    const relevantDocs = await selectRelevantDocuments(
      docs,
      state.prompt,
      embeddings,
      5
    );
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
    let credits;
    try {
      const deduction = await deductCredits(state.userId, 'pdf');
      credits = deduction?.credits;
    } catch (error) {
      console.error('PDF credit deduction error:', error);
    }

    return {
      ...state,
      aiResponse: response.content,
      ...(credits !== undefined ? { credits } : {}),
    };
  } catch (error) {
    console.error('PDF RAG error:', error);
    return {
      ...state,
      aiResponse: 'Failed to analyse the file, please try again',
    };
  } finally {
    try {
      if (state?.file?.path) fs.unlinkSync(state.file.path);
    } catch (err) {
      console.log(`Cleanup error: ${err.message}`);
    }
  }
};
