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
async function onConnectWalletBtnPress(e) {

  e.target.disabled = true;
  const hasAllowed = await window.ic.plug.requestConnect({
    whitelist,
  });

  if (hasAllowed) {
    const principalId = await window.ic.plug.agent.getPrincipal();

    const principalIdHidden =
      `${principalId.toString().substring(0, 5)}...${principalId.toString().substring(principalId.toString().length - 3)}`
    console.log('Plug wallet is connected');
    walletIsConnected = true;
    bidBtn.disabled = false;
    bidBtn.classList.add('active');
    bidBtn.innerText = 'Bid';
    e.target.textContent = principalIdHidden;
    e.target.style.color = '#718096';
    e.target.style.cursor = 'auto';
    e.target.style.background = '#edf2f7';
    e.target.style.fontWeight = '600';

  } else {
    console.log('Plug wallet connection was refused');
    e.target.disabled = false;
    console.log(hasAllowed);
    // try catch
  }
}

function updateBidAmount(e) {
  bidAmount = e.target.value;
  if (walletIsConnected) {
    bidBtn.innerText = `Bid ${bidAmount} ICP`;
  }
}

// BID
async function onBidBtnPress(e) {

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

}


connectWalletBtn.addEventListener('click', onConnectWalletBtnPress);
bidInput.addEventListener('input', updateBidAmount);
bidBtn.addEventListener('click', onBidBtnPress);
