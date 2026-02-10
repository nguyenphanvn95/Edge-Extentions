var e,t;"function"==typeof(e=globalThis.define)&&(t=e,e=null),function(e,t,r,o,a){var n="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},s="function"==typeof n[o]&&n[o],i=s.cache||{},l="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function p(t,r){if(!i[t]){if(!e[t]){var a="function"==typeof n[o]&&n[o];if(!r&&a)return a(t,!0);if(s)return s(t,!0);if(l&&"string"==typeof t)return l(t);var m=Error("Cannot find module '"+t+"'");throw m.code="MODULE_NOT_FOUND",m}h.resolve=function(r){var o=e[t][1][r];return null!=o?o:r},h.cache={};var c=i[t]=new p.Module(t);e[t][0].call(c.exports,h,c,c.exports,this)}return i[t].exports;function h(e){var t=h.resolve(e);return!1===t?{}:p(t)}}p.isParcelRequire=!0,p.Module=function(e){this.id=e,this.bundle=p,this.exports={}},p.modules=e,p.cache=i,p.parent=s,p.register=function(t,r){e[t]=[function(e,t){t.exports=r},{}]},Object.defineProperty(p,"root",{get:function(){return n[o]}}),n[o]=p;for(var m=0;m<t.length;m++)p(t[m])}({tOuqw:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"VectorDBQAChain",()=>s);var a=e("./base.js"),n=e("./question_answering/load.js");class s extends a.BaseChain{static lc_name(){return"VectorDBQAChain"}get inputKeys(){return[this.inputKey]}get outputKeys(){return this.combineDocumentsChain.outputKeys.concat(this.returnSourceDocuments?["sourceDocuments"]:[])}constructor(e){super(e),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e,t){if(!(this.inputKey in e))throw Error(`Question key ${this.inputKey} not found.`);let r=e[this.inputKey],o=await this.vectorstore.similaritySearch(r,this.k,e.filter,t?.getChild("vectorstore")),a=await this.combineDocumentsChain.call({question:r,input_documents:o},t?.getChild("combine_documents"));return this.returnSourceDocuments?{...a,sourceDocuments:o}:a}_chainType(){return"vector_db_qa"}static async deserialize(e,t){if(!("vectorstore"in t))throw Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");let{vectorstore:r}=t;if(!e.combine_documents_chain)throw Error("VectorDBQAChain must have combine_documents_chain in serialized data");return new s({combineDocumentsChain:await (0,a.BaseChain).deserialize(e.combine_documents_chain),k:e.k,vectorstore:r})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),k:this.k}}static fromLLM(e,t,r){return new this({vectorstore:t,combineDocumentsChain:(0,n.loadQAStuffChain)(e),...r})}}},{"./base.js":"lOD6l","./question_answering/load.js":"3oLPa","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],"3oLPa":[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"loadQAChain",()=>p),o.export(r,"loadQAStuffChain",()=>m),o.export(r,"loadQAMapReduceChain",()=>c),o.export(r,"loadQARefineChain",()=>h);var a=e("../llm_chain.js"),n=e("../combine_docs_chain.js"),s=e("./stuff_prompts.js"),i=e("./map_reduce_prompts.js"),l=e("./refine_prompts.js");let p=(e,t={type:"stuff"})=>{let{type:r}=t;if("stuff"===r)return m(e,t);if("map_reduce"===r)return c(e,t);if("refine"===r)return h(e,t);throw Error(`Invalid _type: ${r}`)};function m(e,t={}){let{prompt:r=(0,s.QA_PROMPT_SELECTOR).getPrompt(e),verbose:o}=t,i=new a.LLMChain({prompt:r,llm:e,verbose:o});return new n.StuffDocumentsChain({llmChain:i,verbose:o})}function c(e,t={}){let{combineMapPrompt:r=(0,i.COMBINE_QA_PROMPT_SELECTOR).getPrompt(e),combinePrompt:o=(0,i.COMBINE_PROMPT_SELECTOR).getPrompt(e),verbose:s,combineLLM:l,returnIntermediateSteps:p}=t,m=new a.LLMChain({prompt:r,llm:e,verbose:s}),c=new a.LLMChain({prompt:o,llm:l??e,verbose:s}),h=new n.StuffDocumentsChain({llmChain:c,documentVariableName:"summaries",verbose:s});return new n.MapReduceDocumentsChain({llmChain:m,combineDocumentChain:h,returnIntermediateSteps:p,verbose:s})}function h(e,t={}){let{questionPrompt:r=(0,l.QUESTION_PROMPT_SELECTOR).getPrompt(e),refinePrompt:o=(0,l.REFINE_PROMPT_SELECTOR).getPrompt(e),refineLLM:s,verbose:i}=t,p=new a.LLMChain({prompt:r,llm:e,verbose:i}),m=new a.LLMChain({prompt:o,llm:s??e,verbose:i});return new n.RefineDocumentsChain({llmChain:p,refineLLMChain:m,verbose:i})}},{"../llm_chain.js":"dLYP0","../combine_docs_chain.js":"dfXNh","./stuff_prompts.js":"ehlQF","./map_reduce_prompts.js":"8DktV","./refine_prompts.js":"389lB","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],ehlQF:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"DEFAULT_QA_PROMPT",()=>i),o.export(r,"QA_PROMPT_SELECTOR",()=>c);var a=e("../../prompts/prompt.js"),n=e("../../prompts/chat.js"),s=e("../../prompts/selectors/conditional.js");let i=new a.PromptTemplate({template:"Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.\n\n{context}\n\nQuestion: {question}\nHelpful Answer:",inputVariables:["context","question"]}),l=`Use the following pieces of context to answer the users question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`,p=[(0,n.SystemMessagePromptTemplate).fromTemplate(l),(0,n.HumanMessagePromptTemplate).fromTemplate("{question}")],m=(0,n.ChatPromptTemplate).fromMessages(p),c=new s.ConditionalPromptSelector(i,[[s.isChatModel,m]])},{"../../prompts/prompt.js":"9S6vM","../../prompts/chat.js":"bGuA8","../../prompts/selectors/conditional.js":"1nJex","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],bGuA8:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"BaseMessagePromptTemplate",()=>a.BaseMessagePromptTemplate),o.export(r,"MessagesPlaceholder",()=>a.MessagesPlaceholder),o.export(r,"BaseMessageStringPromptTemplate",()=>a.BaseMessageStringPromptTemplate),o.export(r,"BaseChatPromptTemplate",()=>a.BaseChatPromptTemplate),o.export(r,"ChatMessagePromptTemplate",()=>a.ChatMessagePromptTemplate),o.export(r,"HumanMessagePromptTemplate",()=>a.HumanMessagePromptTemplate),o.export(r,"AIMessagePromptTemplate",()=>a.AIMessagePromptTemplate),o.export(r,"SystemMessagePromptTemplate",()=>a.SystemMessagePromptTemplate),o.export(r,"ChatPromptTemplate",()=>a.ChatPromptTemplate),o.export(r,"ChatPromptValue",()=>n.ChatPromptValue);var a=e("@langchain/core/prompts"),n=e("@langchain/core/prompt_values")},{"@langchain/core/prompts":"jpJY6","@langchain/core/prompt_values":"fyYr2","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],"1nJex":[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"BasePromptSelector",()=>a.BasePromptSelector),o.export(r,"ConditionalPromptSelector",()=>a.ConditionalPromptSelector),o.export(r,"isLLM",()=>a.isLLM),o.export(r,"isChatModel",()=>a.isChatModel);var a=e("@langchain/core/example_selectors")},{"@langchain/core/example_selectors":"8Lzus","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],"8DktV":[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"DEFAULT_COMBINE_QA_PROMPT",()=>l),o.export(r,"COMBINE_QA_PROMPT_SELECTOR",()=>h),o.export(r,"COMBINE_PROMPT",()=>d),o.export(r,"COMBINE_PROMPT_SELECTOR",()=>T);var a=e("../../prompts/prompt.js"),n=e("../../prompts/chat.js"),s=e("../../prompts/selectors/conditional.js");let i=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
{context}
Question: {question}
Relevant text, if any:`,l=(0,a.PromptTemplate).fromTemplate(i),p=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
----------------
{context}`,m=[(0,n.SystemMessagePromptTemplate).fromTemplate(p),(0,n.HumanMessagePromptTemplate).fromTemplate("{question}")],c=(0,n.ChatPromptTemplate).fromMessages(m),h=new s.ConditionalPromptSelector(l,[[s.isChatModel,c]]),u=`Given the following extracted parts of a long document and a question, create a final answer. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.

QUESTION: Which state/country's law governs the interpretation of the contract?
=========
Content: This Agreement is governed by English law and the parties submit to the exclusive jurisdiction of the English courts in  relation to any dispute (contractual or non-contractual) concerning this Agreement save that either party may apply to any court for an  injunction or other relief to protect its Intellectual Property Rights.

Content: No Waiver. Failure or delay in exercising any right or remedy under this Agreement shall not constitute a waiver of such (or any other)  right or remedy.

11.7 Severability. The invalidity, illegality or unenforceability of any term (or part of a term) of this Agreement shall not affect the continuation  in force of the remainder of the term (if any) and this Agreement.

11.8 No Agency. Except as expressly stated otherwise, nothing in this Agreement shall create an agency, partnership or joint venture of any  kind between the parties.

11.9 No Third-Party Beneficiaries.

Content: (b) if Google believes, in good faith, that the Distributor has violated or caused Google to violate any Anti-Bribery Laws (as  defined in Clause 8.5) or that such a violation is reasonably likely to occur,
=========
FINAL ANSWER: This Agreement is governed by English law.

QUESTION: What did the president say about Michael Jackson?
=========
Content: Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  

Last year COVID-19 kept us apart. This year we are finally together again. 

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. 

With a duty to one another to the American people to the Constitution. 

And with an unwavering resolve that freedom will always triumph over tyranny. 

Six days ago, Russia\u2019s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. 

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. 

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.

Content: And we won\u2019t stop. 

We have lost so much to COVID-19. Time with one another. And worst of all, so much loss of life. 

Let\u2019s use this moment to reset. Let\u2019s stop looking at COVID-19 as a partisan dividing line and see it for what it is: A God-awful disease.  

Let\u2019s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans.  

We can\u2019t change how divided we\u2019ve been. But we can change how we move forward\u2014on COVID-19 and other issues we must face together. 

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. 

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who\u2019d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

Content: And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.  

To all Americans, I will be honest with you, as I\u2019ve always promised. A Russian dictator, invading a foreign country, has costs around the world. 

And I\u2019m taking robust action to make sure the pain of our sanctions  is targeted at Russia\u2019s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.  

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  

These steps will help blunt gas prices here at home. And I know the news about what\u2019s happening can seem alarming. 

But I want you to know that we are going to be okay.

Content: More support for patients and families. 

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. 

It\u2019s based on DARPA\u2014the Defense Department project that led to the Internet, GPS, and so much more.  

ARPA-H will have a singular purpose\u2014to drive breakthroughs in cancer, Alzheimer\u2019s, diabetes, and more. 

A unity agenda for the nation. 

We can do this. 

My fellow Americans\u2014tonight , we have gathered in a sacred space\u2014the citadel of our democracy. 

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. 

We have fought for freedom, expanded liberty, defeated totalitarianism and terror. 

And built the strongest, freest, and most prosperous nation the world has ever known. 

Now is the hour. 

Our moment of responsibility. 

Our test of resolve and conscience, of history itself. 

It is in this moment that our character is formed. Our purpose is found. Our future is forged. 

Well I know this nation.
=========
FINAL ANSWER: The president did not mention Michael Jackson.

QUESTION: {question}
=========
{summaries}
=========
FINAL ANSWER:`,d=(0,a.PromptTemplate).fromTemplate(u),f=`Given the following extracted parts of a long document and a question, create a final answer. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.
----------------
{summaries}`,g=[(0,n.SystemMessagePromptTemplate).fromTemplate(f),(0,n.HumanMessagePromptTemplate).fromTemplate("{question}")],w=(0,n.ChatPromptTemplate).fromMessages(g),T=new s.ConditionalPromptSelector(d,[[s.isChatModel,w]])},{"../../prompts/prompt.js":"9S6vM","../../prompts/chat.js":"bGuA8","../../prompts/selectors/conditional.js":"1nJex","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],"389lB":[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"DEFAULT_REFINE_PROMPT_TMPL",()=>s),o.export(r,"DEFAULT_REFINE_PROMPT",()=>i),o.export(r,"CHAT_REFINE_PROMPT",()=>m),o.export(r,"REFINE_PROMPT_SELECTOR",()=>c),o.export(r,"DEFAULT_TEXT_QA_PROMPT_TMPL",()=>h),o.export(r,"DEFAULT_TEXT_QA_PROMPT",()=>u),o.export(r,"CHAT_QUESTION_PROMPT",()=>g),o.export(r,"QUESTION_PROMPT_SELECTOR",()=>w);var a=e("../../prompts/index.js"),n=e("../../prompts/selectors/conditional.js");let s=`The original question is as follows: {question}
We have provided an existing answer: {existing_answer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{context}
------------
Given the new context, refine the original answer to better answer the question. 
If the context isn't useful, return the original answer.`,i=new a.PromptTemplate({inputVariables:["question","existing_answer","context"],template:s}),l=`The original question is as follows: {question}
We have provided an existing answer: {existing_answer}
We have the opportunity to refine the existing answer
(only if needed) with some more context below.
------------
{context}
------------
Given the new context, refine the original answer to better answer the question. 
If the context isn't useful, return the original answer.`,p=[(0,a.HumanMessagePromptTemplate).fromTemplate("{question}"),(0,a.AIMessagePromptTemplate).fromTemplate("{existing_answer}"),(0,a.HumanMessagePromptTemplate).fromTemplate(l)],m=(0,a.ChatPromptTemplate).fromMessages(p),c=new n.ConditionalPromptSelector(i,[[n.isChatModel,m]]),h=`Context information is below. 
---------------------
{context}
---------------------
Given the context information and no prior knowledge, answer the question: {question}`,u=new a.PromptTemplate({inputVariables:["context","question"],template:h}),d=`Context information is below. 
---------------------
{context}
---------------------
Given the context information and no prior knowledge, answer any questions`,f=[(0,a.SystemMessagePromptTemplate).fromTemplate(d),(0,a.HumanMessagePromptTemplate).fromTemplate("{question}")],g=(0,a.ChatPromptTemplate).fromMessages(f),w=new n.ConditionalPromptSelector(u,[[n.isChatModel,g]])},{"../../prompts/index.js":"vPG5D","../../prompts/selectors/conditional.js":"1nJex","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],vPG5D:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"BasePromptTemplate",()=>a.BasePromptTemplate),o.export(r,"StringPromptValue",()=>a.StringPromptValue),o.export(r,"BaseStringPromptTemplate",()=>a.BaseStringPromptTemplate),o.export(r,"BaseExampleSelector",()=>n.BaseExampleSelector),o.export(r,"PromptTemplate",()=>s.PromptTemplate),o.export(r,"BasePromptSelector",()=>i.BasePromptSelector),o.export(r,"ConditionalPromptSelector",()=>i.ConditionalPromptSelector),o.export(r,"isChatModel",()=>i.isChatModel),o.export(r,"isLLM",()=>i.isLLM),o.export(r,"LengthBasedExampleSelector",()=>l.LengthBasedExampleSelector),o.export(r,"SemanticSimilarityExampleSelector",()=>p.SemanticSimilarityExampleSelector),o.export(r,"FewShotPromptTemplate",()=>m.FewShotPromptTemplate),o.export(r,"FewShotChatMessagePromptTemplate",()=>m.FewShotChatMessagePromptTemplate),o.export(r,"ChatPromptTemplate",()=>c.ChatPromptTemplate),o.export(r,"HumanMessagePromptTemplate",()=>c.HumanMessagePromptTemplate),o.export(r,"AIMessagePromptTemplate",()=>c.AIMessagePromptTemplate),o.export(r,"SystemMessagePromptTemplate",()=>c.SystemMessagePromptTemplate),o.export(r,"ChatMessagePromptTemplate",()=>c.ChatMessagePromptTemplate),o.export(r,"MessagesPlaceholder",()=>c.MessagesPlaceholder),o.export(r,"BaseChatPromptTemplate",()=>c.BaseChatPromptTemplate),o.export(r,"parseTemplate",()=>h.parseTemplate),o.export(r,"renderTemplate",()=>h.renderTemplate),o.export(r,"checkValidTemplate",()=>h.checkValidTemplate),o.export(r,"PipelinePromptTemplate",()=>u.PipelinePromptTemplate);var a=e("./base.js"),n=e("@langchain/core/example_selectors"),s=e("./prompt.js"),i=e("./selectors/conditional.js"),l=e("./selectors/LengthBasedExampleSelector.js"),p=e("./selectors/SemanticSimilarityExampleSelector.js"),m=e("./few_shot.js"),c=e("./chat.js"),h=e("./template.js"),u=e("./pipeline.js")},{"./base.js":"8VjQL","@langchain/core/example_selectors":"8Lzus","./prompt.js":"9S6vM","./selectors/conditional.js":"1nJex","./selectors/LengthBasedExampleSelector.js":"cXXqH","./selectors/SemanticSimilarityExampleSelector.js":"fOq17","./few_shot.js":"jaErX","./chat.js":"bGuA8","./template.js":"10WYD","./pipeline.js":"lTM1d","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],cXXqH:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"LengthBasedExampleSelector",()=>a.LengthBasedExampleSelector);var a=e("@langchain/core/example_selectors")},{"@langchain/core/example_selectors":"8Lzus","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],fOq17:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r);var a=e("@langchain/core/example_selectors");o.exportAll(a,r)},{"@langchain/core/example_selectors":"8Lzus","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],jaErX:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"FewShotPromptTemplate",()=>a.FewShotPromptTemplate),o.export(r,"FewShotChatMessagePromptTemplate",()=>a.FewShotChatMessagePromptTemplate);var a=e("@langchain/core/prompts")},{"@langchain/core/prompts":"jpJY6","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],"10WYD":[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"parseFString",()=>a.parseFString),o.export(r,"interpolateFString",()=>a.interpolateFString),o.export(r,"DEFAULT_FORMATTER_MAPPING",()=>a.DEFAULT_FORMATTER_MAPPING),o.export(r,"DEFAULT_PARSER_MAPPING",()=>a.DEFAULT_PARSER_MAPPING),o.export(r,"renderTemplate",()=>a.renderTemplate),o.export(r,"parseTemplate",()=>a.parseTemplate),o.export(r,"checkValidTemplate",()=>a.checkValidTemplate);var a=e("@langchain/core/prompts")},{"@langchain/core/prompts":"jpJY6","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}],lTM1d:[function(e,t,r){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");o.defineInteropFlag(r),o.export(r,"PipelinePromptTemplate",()=>a.PipelinePromptTemplate);var a=e("@langchain/core/prompts")},{"@langchain/core/prompts":"jpJY6","@parcel/transformer-js/src/esmodule-helpers.js":"jb2Oh"}]},[],0,"parcelRequire3d47"),globalThis.define=t;