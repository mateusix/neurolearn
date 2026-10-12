import { env, pipeline } from '@huggingface/transformers';
env.allowLocalModels=false;
env.useBrowserCache=true;
if(env.backends.onnx.wasm){env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;}
self.onmessage=async(event:MessageEvent<{query:string;descriptions:string[]}>)=>{
 try{
  const extractor=await pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{
   dtype:'q8',device:'wasm',revision:'2c4055b12046f11709e9df2c122e59ffbdc2f900',progress_callback:p=>{
    if(p.status==='progress')self.postMessage({type:'progress',progress:Math.floor(p.progress/10)*10});
   },
  });
  const output=await extractor([event.data.query,...event.data.descriptions],{pooling:'mean',normalize:true});
  const vectors=output.tolist() as number[][];
  const scores=vectors.slice(1).map(v=>v.reduce((sum,x,i)=>sum+x*vectors[0][i],0));
  await extractor.dispose();
  self.postMessage({type:'complete',scores});
 }catch{self.postMessage({type:'error'});}
};
