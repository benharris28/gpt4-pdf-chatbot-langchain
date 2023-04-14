import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { CustomPDFLoader } from '@/utils/customPDFLoader';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { Document } from "langchain/document";
import { TextLoader } from "langchain/document_loaders/fs/text";






/* Name of directory to retrieve your files from */
const filePath = 'docs/peak/peaktest.pdf';

export const run = async () => {
  try {
    const loader = new TextLoader("docs/peak/sample.txt");
    /*load raw docs from the all files in the directory */

    // const loader = new PDFLoader(filePath);
    const rawDocs = await loader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });



    const docs = await textSplitter.splitDocuments(rawDocs);

    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
    console.log(embeddings)
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
  
};

(async () => {
  await run();
  console.log('ingestion complete');
})();
