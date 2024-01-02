const { ethers }=require("ethers");
const fetch =require("node-fetch");

const BNB_URL=process.env.BSC_URL;
const OPBNB_URL=process.env.OPBNB_URL;
const userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

class Qna3Util {
  constructor(pKey){
    const provider = new ethers.providers.JsonRpcProvider(BNB_URL);
    const wallet = new ethers.Wallet(pKey, provider);
    this.provider =provider;
    this.wallet = wallet;
  }

  getAddress(){
    return new Promise(resolve=>{
      this.wallet.getAddress()
      .then(result=>{
        resolve(result);
      });
    })
  }

  balance(address){
    return new Promise(resolve=>{
      this.provider.getBalance(address)
      .then(result=>{
        resolve(result);
      })
    })
  }

  getNonce(){
    return new Promise((resolve,reject)=>{
      this.wallet.getTransactionCount('pending')
      .then(nonce=>{
        resolve(nonce);
      })
      .catch(err=>{
        reject(err);
      })
    });
  }

  signervalue(types,values){
    return ethers.utils.solidityKeccak256(types,values);
  }

  signMsg(values){
    return new Promise(resolve=>{
      this.wallet.signMessage(values)
      .then(result=>{
        resolve(result);
      });
    });
  }

  login(data){
    return new Promise((resolve,reject)=>{
      const login_url="https://api.qna3.ai/api/v2/auth/login?via=wallet";
      fetch(login_url,{
        method:'POST',
        headers:{
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Origin':'https://qna3.ai',
          'Host':'api.qna3.ai',
          'Sec-Fetch-Dest':'empty',
          'Sec-Fetch-Mode':'cors',
          'Sec-Fetch-Site':'same-site',
          'TE':'trailers',
          'x-lang':'english'
        },
        body:JSON.stringify(data)
      })
      .then(response=>{
        if(response.ok){
          return response.json();
        }else {
          throw Error(`Request failed with status:${response.status}`);
        }
      }).then(result=>{
        resolve(result);
      })
      .catch(err=>reject(err));
    });
  }

}

module.exports=Qna3Util;