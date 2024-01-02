require("dotenv").config();
const { program } = require("commander");
const { ethers }=require("ethers");
const { params }=require("./gquery");
const cron = require('node-cron');

const Qna3Util = require('./qna3Util');
const OpbnbUtil =require('./opBnbUtil');

const wKey1=process.env.ghostKey1;
const wKey2=process.env.ghostKey2;
const wKey3=process.env.ghostKey3;

let qna3Bot;
let qna3OpbnbBot=new OpbnbUtil(wKey1);
let qna3params;

program
.name("qna3bot")
.version("0.0.1")

program
.command("checkin")
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
  scheduleTask();
  console.log("schedule checkin start");
})

program
.command("wallet")
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
  qna3Bot.getAddress()
  .then(address=>{
    console.log("wallet:",address);
  });
  qna3OpbnbBot.getNonce()
  .then(nonce=>{
    console.log("opbnb nonce:",nonce);
  });
  let valid = cron.validate('15 11,22 */1 * *');
  console.log("valid:",valid);
})
const scheduleTask = async ()=>{
  console.log("*start------",new Date().toLocaleString('zh-CN'));
  cron.schedule('15 11,22 */1 * *',()=>{
    console.log("-------------",new Date().toLocaleString('zh-CN'));
    runTask();
  },{
    scheduled: true,
    timezone: 'Asia/Shanghai'
  });
}

const runTask = async ()=>{
  const [today,checkInDays,score] = await queryStatus();
  console.log("score:",score,"today:",today);
  try {
    if(today == 0){
      await checkIn();
      const [result,,]= await queryStatus();
      console.log(result == 1?"success":"failed");
    }
  } catch (error) {
    console.error("#Error:",error.message);
    console.log(error.stack);
  }
}

const checkIn = async ()=>{
  const balance= await qna3Bot.balance(qna3params.wallet);
  const opbalance=await qna3OpbnbBot.balance(qna3params.wallet);
  const nonce=await qna3OpbnbBot.getNonce();
  console.log("opbnb balance:",ethers.utils.formatEther(opbalance)," bnb:",ethers.utils.formatEther(balance));

  const gasLimit = await qna3OpbnbBot.getGasLimit();
  const gasPrice = await qna3OpbnbBot.getGasPrice();

  const tx=await qna3OpbnbBot.checkin(gasLimit,gasPrice,nonce);
  const receipt = await tx.wait();
  console.log(receipt.status === 1?"success":"failed"," Tx:",tx.hash);
  if(receipt.status==1){
    try {
      const siteCheckin=await qna3OpbnbBot.checkInsite(qna3params.Authorization,tx.hash,"opbnb");
      console.log(siteCheckin);
      return true;
    } catch (error) {
      console.error("#Checkinsite failed:",error.message);
      console.error(error.stack);
    }
  }else{
    console.log("opbnb checkIn failed!!");
  }
  return false;
}

const initQna3params = async ()=>{
  if(!qna3params){
    const tips="AI + DYOR = Ultimate Answer to Unlock Web3 Universe";
    const signature=await qna3Bot.signMsg(tips);
    const address = await qna3Bot.getAddress();
    const data={
      signature: signature,
      wallet_address: address
    }
    const resp= await qna3Bot.login(data);
    const authorization=resp['data']['accessToken'];
    const userid=resp.data.user.id;
    qna3params={"xid":userid,'Authorization':authorization,'wallet':address};
    console.log("qna3 params init.");
  }else{
    console.log("qna3params is inited.");
  }
}

const queryStatus= async ()=>{
  if(!qna3params){
    await initQna3params();
  }
  params['variables']['headersMapping']['x-id']=qna3params.xid;
  params['variables']['headersMapping']['Authorization']='Bearer '+qna3params.Authorization;
 
  const result=await qna3OpbnbBot.loadUserDetial(params,qna3params.Authorization,qna3params.xid);
  const checkInDays=result.data.userDetail.checkInStatus.checkInDays;
  const today=result.data.userDetail.checkInStatus.todayCount;
  const score=result.data.userDetail.creditHistories.items[0].score;
  console.log("checkInDays:",checkInDays,"today:",today,"score:",score);
  return [today,checkInDays,score];
}

program.parse()
console.log("qna3 bot run");