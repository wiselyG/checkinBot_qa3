require("dotenv").config();
const { program } = require("commander");
const { ethers }=require("ethers");
const { params }=require("./gquery");

const Qna3Util = require('./qna3Util');
const OpbnbUtil =require('./opBnbUtil');

const wKey1=process.env.ghostKey1;
const wKey2=process.env.ghostKey2;
const wKey3=process.env.ghostKey3;

let qna3Bot;
let qna3OpbnbBot=new OpbnbUtil(wKey1);

program
.name("qna3bot")
.version("0.0.1")

program
.command("test")
.argument("<number>", "which wallet address you whant")
.action((index)=>{
  if(index == 1){
    qna3Bot=new Qna3Util(wKey1);
    qna3OpbnbBot=new OpbnbUtil(wKey1);
  }else if(index == 2){
    qna3Bot=new Qna3Util(wKey2);
    qna3OpbnbBot=new OpbnbUtil(wKey2);
  }else{
    qna3Bot=new Qna3Util(wKey3);
    qna3OpbnbBot=new OpbnbUtil(wKey3);
  }
  // testTask();
  // showInfo();
  // checkInsite();
  queryStatus();
  console.log("in test");
})

const showInfo = async ()=>{
  const address = await qna3Bot.getAddress();
  const price=await qna3OpbnbBot.getGasPrice();
  const limit=await qna3OpbnbBot.getGasLimit();
  console.log("price",ethers.utils.formatUnits(price,'gwei'));
  console.log("limit:",limit.toNumber())
  console.log("address:",address);
}

const testTask = async ()=>{
  const address= await qna3Bot.getAddress();
  const balance= await qna3Bot.balance(address);
  console.log("address:",address,"balance",ethers.utils.formatEther(balance));
  const tips="AI + DYOR = Ultimate Answer to Unlock Web3 Universe";
  const signature=await qna3Bot.signMsg(tips);
  console.log("signature:",signature);
  const opbalance=await qna3OpbnbBot.balance(address);
  console.log("opbnb balance:",ethers.utils.formatEther(opbalance));
  const data={
    signature: signature,
    wallet_address: address
  }
  const gasLimit = await qna3OpbnbBot.getGasLimit();
  const gasPrice = await qna3OpbnbBot.getGasPrice();
  console.log("gasLimit:",gasLimit.toNumber());
  console.log("gasPrice gwei:",ethers.utils.formatUnits(gasPrice,'gwei'));

  const resp= await qna3Bot.login(data);
  const authorization=resp['data']['accessToken'];
  console.log("accessToken:",authorization);

  const tx=await qna3OpbnbBot.checkin(gasLimit,gasPrice);
  console.log(tx.hash);
  const receipt = await tx.wait();
  console.log("Transaction exec: ",receipt.status === 1?"success":"failed");
  if(receipt.status==1){
    try {
      const siteCheckin=qna3OpbnbBot.checkInsite(authorization,tx.hash,"opbnb");
      console.log(siteCheckin);
    } catch (error) {
      console.error(error.stack);
    }
  }else{
    console.log("opbnb checkIn failed!!");
  }
 
  // console.log(resp);
}

const checkInsite= async ()=>{
  const hash="0xd67e05c89ba62dea0e56a4bb773835f4565513e6b448385d59812033cebb14f5";
  const via="opbnb";
  const address= await qna3Bot.getAddress();
  const tips="AI + DYOR = Ultimate Answer to Unlock Web3 Universe";
  const signature=await qna3Bot.signMsg(tips);
  const data={
    wallet_address: address,
    signature: signature
  }
  const resp= await qna3Bot.login(data);
  const authorization=resp['data']['accessToken'];
  console.log("accessToken:",authorization);
  try {
    const siteCheckin=await qna3OpbnbBot.checkInsite(authorization,hash,via);
    console.log(siteCheckin);
  } catch (error) {
    console.error(error.stack);
  }

}



const queryStatus= async ()=>{
 
 
  const tips="AI + DYOR = Ultimate Answer to Unlock Web3 Universe";
  const signature=await qna3Bot.signMsg(tips);
  console.log("signature:",signature);
  const address = await qna3Bot.getAddress();
  const data={
    signature: signature,
    wallet_address: address
  }
  const resp= await qna3Bot.login(data);
  const authorization=resp['data']['accessToken'];
  const userid=resp.data.user.id;
  console.log("accessToken:",authorization);
  console.log("x-id:",userid);
  params['headersMapping']['x-id']=userid;
  params['headersMapping']['Authorization']='Bearer '+authorization;
 
  const result=await qna3OpbnbBot.loadUserDetial(params,authorization,userid);
  console.log("userData:",result);
}

program.parse()
console.log("qna3 bot run");