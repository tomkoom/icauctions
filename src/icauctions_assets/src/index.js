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
bidBtn.disabled = true;
let bidAmount = 0;


// CONNECT WALLET
async function onConnectWalletBtnPress(el) {

  el.target.disabled = true;
  const hasAllowed = await window.ic.plug.requestConnect({
    whitelist,
  });

  // const connectionState = hasAllowed ? 'allowed' : 'denied';

  if (hasAllowed) {
    const principalId = await window.ic.plug.agent.getPrincipal();
    console.log('Plug wallet is connected');
    walletIsConnected = true;
    bidBtn.disabled = false;
    bidBtn.innerText = 'Bid';
    el.target.textContent = principalId;
    el.target.style.color = 'black';
    el.target.style.cursor = 'auto';
    el.target.style.background = 'white';
    console.log(hasAllowed);
  } else {
    console.log('Plug wallet connection was refused');
    el.target.disabled = false;
    console.log(hasAllowed);
    // try catch
  }
}

function updateBidAmount(e) {
  bidAmount = e.target.value;
  console.log(bidAmount);
}

// BID
async function onBidBtnPress(el) {

  el.target.textContent = 'Loading Plug...';

  if (walletIsConnected) {
    const balance = await window.ic?.plug?.requestBalance();

    if (bidAmount <= balance[0].amount) {
      el.target.textContent = 'Waiting for confirmation';

      const bidAmountConverted = bidAmount * 100000000;
      const requestTransferArg = {
        to: receiverAccountId,
        amount: bidAmountConverted,
      };

      const transfer = await window.ic?.plug?.requestTransfer(requestTransferArg);

    } else {
      errorMsgDiv.innerHTML = "Plug wallet doesn't have enough balance";
    }

    setTimeout(() => {
      el.target.textContent = 'Bid';
    }, 5000);
    el.target.textContent = 'Transaction sent';

  } else {
    console.log('Plug wallet is not connected');
  }

}


connectWalletBtn.addEventListener('click', onConnectWalletBtnPress);
bidInput.addEventListener('input', updateBidAmount);
bidBtn.addEventListener('click', onBidBtnPress);
