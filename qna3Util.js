const { ethers }=require("ethers");
const fetch =require("node-fetch");
const { claimAbi }=require("./gquery");

const BNB_URL=process.env.BSC_URL;
const OPBNB_URL=process.env.OPBNB_URL;
const userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const claimContract="0xB342e7D33b806544609370271A8D074313B7bc30";

class Qna3Util {
  constructor(pKey){
    const provider = new ethers.providers.JsonRpcProvider(BNB_URL);
    const wallet = new ethers.Wallet(pKey, provider);
    this.contract= new ethers.Contract(claimContract,claimAbi,wallet);
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

  getGasPrice(){
    return new Promise(resolve=>{
      this.provider.getGasPrice()
      .then(price=>{
        resolve(price);
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
          'X-Lang':'english'
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

  claimArgments(authorization){
    return new Promise((resolve,reject)=>{
      const claimall="https://api.qna3.ai/api/v2/my/claim-all";
      fetch(claimall,{
        method:'POST',
        headers:{
          'Accept':'application/json, text/plain, */*',
          'Content-Length': 0,
          'User-Agent': userAgent,
          'Origin':'https://qna3.ai',
          'Sec-Fetch-Dest':'empty',
          'Sec-Fetch-Mode':'cors',
          'Sec-Fetch-Site':'same-site',
          'X-Lang':'english',
          'Authorization':'Bearer '+authorization
        },
        body: null
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

  claimOnchain(amount,nonce,signature,chain_ne,gasPrice){
    return new Promise((resolve,reject)=>{
      // const limit=ethers.BigNumber.from(gasLimit).add(100);
      const params={
        value: ethers.utils.parseEther('0'),
        gasLimit: 21000,
        gasPrice: gasPrice,
        nonce: chain_ne
      }
      this.contract.estimateGas.claimCredit(amount,nonce,signature)
      .then(limit=>{
        console.log("gasLimit:",limit.toNumber());
        params['gasLimit']=limit.toNumber();
        this.contract.claimCredit(amount,nonce,signature,params)
        .then(result=>{
          resolve(result);
        })
        .catch(err=>reject(err));
      });
    });
  }

  claimOnsite(urlId,hash,authorization,xid){
    return new Promise((resolve,reject)=>{
      const url="https://api.qna3.ai/api/v2/my/claim/"+urlId.toString();
      fetch(url,{
        method:'PUT',
        headers:{
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Origin':'https://qna3.ai',
          'Host':'api.qna3.ai',
          'Sec-Fetch-Dest':'empty',
          'Sec-Fetch-Mode':'cors',
          'Sec-Fetch-Site':'same-site',
          'TE':'trailers',
          'X-Lang':'english',
          'Authorization':'Bearer '+authorization,
          'X-Id':xid
        },
        body:JSON.stringify({'hash':hash})
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

  printAbi(){
    return new ethers.utils.Interface(claimAbi).format(ethers.utils.FormatTypes.full);
  }

}

module.exports=Qna3Util;