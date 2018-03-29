
var server = require('ws').Server;
const enc=require('crypto-js/sha256');
console.log("creating custom block chain..");
class Block{
	constructor(index,timestamp,data,prevhash=''){
		this.index=index;
		this.data=data;
		this.prevhash=prevhash;
		this.timestamp=timestamp;
		this.hash=this.Hash();
		this.nonce=0;
		this.gen_time=0;

	}
	Hash(){
		return enc(this.index+this.prevhash+this.timestamp+JSON.stringify(this.data) +this.nonce).toString();
	}
	mine(diff){
		while(this.hash.substring(0,diff)!==Array(diff+1).join('0')){
			this.nonce++;
			this.hash=this.Hash();
		}
		console.log("mined = "+this.hash);
	}
}
class blockchain{
	constructor(){
		this.chain=[this.genblock()];
		this.diff=4;
	}
	genblock(){
		return new Block(0,"29/03/2018","gen-block","0");
	}
	last(){
		return this.chain[this.chain.length-1];
	}
	add(newblock){
		var t1=Date.now();
		newblock.prevhash=this.last().hash;
		// newblock.hash=newblock.Hash();
		newblock.mine(this.diff);
		t1=Date.now()-t1;
		newblock.gen_time=t1;
		this.chain.push(newblock);
	}
	valid(){
		for(let i=1;i<this.chain.length;i++){
			const curr=this.chain[i];
			const prev=this.chain[i-1];

			if(curr.hash!==curr.Hash){
				return false;
			}
			if(curr.prevhash!==prev.hash){
				return false;
			}
		}
	}
}

let yk=new blockchain();
// yk.add(new Block('1','29/03/2018',dats,''));

var s = new server({port:5001});
s.on('connection',function(ws){
	ws.on('message',function(message){
		if(message!='start'){
		yk.add(new Block(yk.last().index+1,'29/03/2018',message,''));
		}
		s.clients.forEach(function e(client){
			if(client!=ws)

				client.send(JSON.stringify(yk));
		});

		ws.send(JSON.stringify(yk));

	});
	ws.on('close',function(){
		console.log("client lost");
	});
});