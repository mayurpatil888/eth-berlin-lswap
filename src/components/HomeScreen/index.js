import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import ls from '../../lib/localStorage';
import style from './style';
import coreConstants from '../../config/coreConstants';
import GenerateAddress from '../../lib/GenerateAddress';
import Funder from '../../lib/Funder';
import GetBalance from  '../../lib/GetBalance';


const chains = ['origin', 'aux'];
 class Homescreen extends Component{
    constructor(props){
        super(props);
        this.state = {balance: []};
    }

    componentDidMount(){
        this.getBalance();

    }

    getBalance(){
        this.checkForBurnerKey().then(res=>{
          console.log("Getting Balance");
            this.balances();
        });

    }

    checkForBurnerKey() {
        return new Promise(async (resolve, reject)=>{
            this.originBurnerKey = await ls.getItem(
                coreConstants.ORIGIN_BURNER_KEY,
              );
              if (this.originBurnerKey) {
                this.originBurnerKey = JSON.parse(this.originBurnerKey);
                resolve(this.originBurnerKey)
              } else {
                console.log("Burner Key Creation Started");

                let generateAddress = new GenerateAddress();
                 let resp = await generateAddress.perform;
                this.originBurnerKey = resp.data;
                ls.saveItem(
                  coreConstants.ORIGIN_BURNER_KEY,
                  this.originBurnerKey,
                );

                let fundParam = {
                  address: this.originBurnerKey.address,
                  chainKind: coreConstants.originChainKind
                };
                let funder = new Funder(fundParam);

                await funder.perform();

                console.log("Burner Key Funding Done");
                resolve(this.originBurnerKey)
              }
        });
      }

        getTokenInfo (tokenName) {
          chains.map(async (chainKind, id)=> {
              let getBalance = new GetBalance({address: this.originBurnerKey.address, chainKind, tokenName });

              let balance = await getBalance.perform();
              // this.setState({balance: [...this.state.balance, ...balance]})

          });
      }

        balances(){
          let tokens = coreConstants.erc20Tokens;
        tokens.map((token, index) => {
                this.getTokenInfo(token);
          });
      }

       render(){
          return <div className="container" style ={style.homeContainer} >
              <div className='home-container'>LSWAP</div>
                <div>
                    {this.state.balance}
                </div>

          </div>
      }

}

export default Homescreen;

