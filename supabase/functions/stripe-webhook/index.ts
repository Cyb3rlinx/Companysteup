import {createEdgeHandler} from '../_shared/engine.js';
const handle=createEdgeHandler({env:Deno.env.toObject()});
Deno.serve((request:Request)=>handle(request,'stripe-webhook'));
