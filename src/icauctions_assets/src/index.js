const connectWalletBtn = document.querySelector('.connect-wallet-btn')
const bidInput = document.querySelector('.bid-input');
const bidBtn = document.querySelector('.bid-btn');
const errorMsgDiv = document.querySelector('.error-msg-div');

const receiverAccountId = '033342967deadd9ab23ffc2a2e770d49d3bd9b830d32b0185da7f5f7d20fce9a';
const nnsCanisterId = 'rwlgt-iiaaa-aaaaa-aaaaa-cai';
const whitelist = [
  nnsCanisterId,
];

let walletIsConnected = false;
// bidBtn.disabled = true;
let bidAmount = 0;
bidInput.style.display = "none";

const style = {
  loggedBtn: `
    color: #718096;
    cursor: auto;
    background: none;
    font-weight: 600;

  	border-radius: 4px;
  `
}




// CONNECT WALLET
async function connectWallet() {

  connectWalletBtn.disabled = true;
  const hasAllowed = await window.ic.plug.requestConnect({
    whitelist,
  });

  if (hasAllowed) {
    const principalId = await window.ic.plug.agent.getPrincipal();

    const principalIdHidden =
      `👽 ${principalId.toString().substring(0, 5)}...${principalId.toString().substring(principalId.toString().length - 3)}`
    console.log('Plug wallet is connected');
    walletIsConnected = true;
    bidBtn.disabled = false;
    // bidBtn.classList.add('active');
    bidBtn.innerText = 'Place a bid';
    bidInput.style.display = "";
    connectWalletBtn.textContent = principalIdHidden;
    connectWalletBtn.style.cssText = style.loggedBtn;

  } else {
    console.log('Plug wallet connection was refused');
    e.target.disabled = false;
    console.log(hasAllowed);
    // try catch
  }
}

function updateBidAmount(e) {
  bidAmount = e.target.value;
}

// BID
async function onBidBtnPress(e) {

  if (walletIsConnected) {
    e.target.disabled = true;
    e.target.textContent = 'Loading Plug...';

    if (walletIsConnected) {
      const balance = await window.ic?.plug?.requestBalance();

      if (bidAmount <= balance[0].amount) {
        e.target.textContent = 'Waiting for confirmation...';

        const requestTransferArg = {
          to: receiverAccountId,
          amount: bidAmount * 100000000,
        };

        const transfer = await window.ic?.plug?.requestTransfer(requestTransferArg);

        e.target.textContent = 'Transaction sent';

      } else {
        errorMsgDiv.innerHTML = "Plug wallet doesn't have enough balance";
      }

      // setTimeout(() => {
      //   e.target.textContent = 'Bid';
      // }, 5000);

    } else {
      console.log('Plug wallet is not connected');
    }
  } else {
    connectWallet();
  }



}


connectWalletBtn.addEventListener('click', connectWallet);
bidInput.addEventListener('input', updateBidAmount);
bidBtn.addEventListener('click', onBidBtnPress);
