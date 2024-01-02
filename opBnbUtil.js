const { ethers }=require("ethers");
const fetch =require("node-fetch");
const qna3contract="0xB342e7D33b806544609370271A8D074313B7bc30";
const inputData="0xe95a644f0000000000000000000000000000000000000000000000000000000000000001";
const checkInsiteUrl="https://api.qna3.ai/api/v2/my/check-in";
const loadUserUrl="https://api.qna3.ai/api/v2/graphql";
const userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const OPBNB_URL=process.env.OPBNB_URL;

class OpbnbUtil{
  constructor(wKey){
    const provider = new ethers.providers.JsonRpcProvider(OPBNB_URL);
    const wallet = new ethers.Wallet(wKey, provider);
    this.provider =provider;
    this.wallet = wallet;
  }

  balance(address){
    return new Promise(resolve=>{
      this.provider.getBalance(address)
      .then(result=>{
        resolve(result);
      })
    })
  }

  checkin(gasLimit,gasPrice){
    return new Promise((resolve,reject)=>{
      const limit=ethers.BigNumber.from(gasLimit).add(100);
      const transaction={
        to: qna3contract,
        value: ethers.utils.parseEther('0'),
        gasLimit: limit,
        gasPrice: gasPrice,
        data: inputData
      }
      this.wallet.signTransaction(transaction)
      .then(signedTx=>{
        this.provider.sendTransaction(signedTx)
        .then(result=>{
          resolve(result);
        })
        .catch(err=>reject(err));
      })
    });
  }

  checkInsite(authorization,txHash,via){
    return new Promise((resolve,reject)=>{
      fetch(checkInsiteUrl,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Origin':'https://qna3.ai',
          'Host':'api.qna3.ai',
          'Authorization':'Bearer '+authorization,
        },
        body:JSON.stringify({"hash":txHash,"via":via})
      })
      .then(response=>{
        if(response.ok){
          return response.json();
        }else {
          throw Error(`Request failed with status:${response.status}`);
        }
      })
      .then(result=>{
        resolve(result);
      })
      .catch(err=>reject(err));
    });
  }
  //X-Id:
  loadUserDetial(data,authorization,xid){
    return new Promise((resolve,reject)=>{
      fetch(loadUserUrl,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Origin':'https://qna3.ai',
          'Host':'api.qna3.ai',
          'Authorization':'Bearer '+authorization,
          'X-Id':xid
        },
        body:JSON.stringify(data)
      })
      .then(response=>{
        if(response.ok){
          return response.json();
        }else {
          throw Error(`Request failed with status:${response.status}`);
        }
      })
      .then(result=>{
        resolve(result);
      })
      .catch(err=>reject(err));
    })
  }

  getGasLimit(){
    return new Promise(resolve=>{
      const transaction={
        to: qna3contract,
        value: 0,
        data: inputData
      }
      this.provider.estimateGas(transaction)
      .then(gasLimit=>{
        resolve(gasLimit);
      })
    });
  }

  getGasPrice(){
    return new Promise(resolve=>{
      this.provider.getGasPrice()
      .then(price=>{
        resolve(price);
      })
    });
  }
}

module.exports=OpbnbUtil;