'use strict';

// Data
const account1 = {
  owner: 'Nader Naguib',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Ashraf Amir',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Hamed Moneer',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Samir',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const welcomeBoard = document.querySelector('.wlcBoard');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const labelTransfer = document.querySelector('.transfer-label');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const labelClose = document.querySelector('.labelClose');
const btnSort = document.querySelector('.btn--sort');
let sorted = false;

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value"> ${mov < 0 ? Math.abs(mov) : mov}€</div>
        </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

displayMovements(account1.movements);

const startLogoutTimer = function() {
  let time = 300;

  const timer = setInterval(function() {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(Math.trunc(time % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

   time--;

   if (time === 0) {
    clearInterval(timer);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Login to get started.';
   }

   
  }, 1000)
}

const createUsernames = function (accs) {
  let usernames = [];
  accs.forEach((acc, i) => {
    acc.username = acc.owner
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);
console.log(accounts);

const calcDisplayBalance = function (movements) {
  const balance = movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${balance} EUR`;
};

calcDisplayBalance(account1.movements);

const displayDate = function () {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  localStorage.setItem('storedDate', formattedDate);

  if (labelDate) {
    labelDate.textContent = formattedDate;
  } else {
    console.error('Element with id "labelDate" not found.');
  }
};

if (!localStorage.getItem('storedDate')) {
  displayDate();
} else {
  if (labelDate) {
    labelDate.textContent = localStorage.getItem('storedDate');
  }
}

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(income => income > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const outcomes = account.movements
    .filter(outcome => outcome < 0)
    .map(mov => Math.abs(mov))
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${outcomes}€`;

  const interest = (incomes * account.interestRate) / 100;
  labelSumInterest.textContent = `${interest}€`;
};

let currentAccount;
let currentBalance;

const loginAccount = function (e) {
  e.preventDefault();
  const usernameInput = inputLoginUsername.value;
  const pinInput = Number(inputLoginPin.value);

  currentAccount = accounts.find(
    acc => acc.username === usernameInput && acc.pin === pinInput
  );

  if (currentAccount) {
    const accountMovements = currentAccount.movements;
    currentBalance = currentAccount.movements.reduce(
      (acc, mov) => acc + mov,
      0
    );

    labelWelcome.textContent = `Welcome back, ${currentAccount.owner}`;
    calcDisplaySummary(currentAccount);
    calcDisplayBalance(accountMovements);
    displayMovements(accountMovements);
    containerApp.style.opacity = 100;
    startLogoutTimer();

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
    inputLoginUsername.blur();
  } else {
    labelWelcome.textContent = `Your credentials are incorrect.`;
  }
};

btnLogin.addEventListener('click', loginAccount);

// *Money Transfer Operations*
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.owner === inputTransferTo.value
  );

  if (!receiverAccount) {
    labelTransfer.textContent = `Receiver account does not exist.`;
  } else if (receiverAccount === currentAccount) {
    labelTransfer.textContent = `You cannot transfer money to your own account.`;
  } else if (amount <= 0) {
    labelTransfer.textContent = `Please enter a valid amount to transfer.`;
  } else if (amount > currentBalance) {
    labelTransfer.textContent = `You don't have enough money!`;
  } else {
    receiverAccount.movements.push(amount);
    currentAccount.movements.push(amount * -1);
    calcDisplaySummary(currentAccount);
    calcDisplayBalance(currentAccount.movements);
    displayMovements(currentAccount.movements);

    inputTransferTo.value = ``;
    inputTransferAmount.value = ``;
    labelTransfer.textContent = `Transfer successful`;
    console.log(`Transferred ${amount} to`, receiverAccount);
  }
});

const closeAccount = function (e) {
  e.preventDefault();
  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  const accountID = accounts.findIndex(
    accID => accID.owner === username && accID.pin === pin
  );

  if (accountID !== -1) {
    accounts.splice(accountID, 1);
    containerApp.style.opacity = 0;
    window.scrollTo(0, 0);
    labelWelcome.textContent = 'Your account has been closed successfully!';
  } else {
    labelClose.textContent =
      'Account not found. Please check your username and PIN.';
  }
};

btnClose.addEventListener('click', closeAccount);

const requestLoan = function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      calcDisplaySummary(currentAccount);
      calcDisplayBalance(currentAccount.movements);
      displayMovements(currentAccount.movements);
      inputLoanAmount.value = '';
    }, 5000);
  }
};

btnLoan.addEventListener('click', requestLoan);

const sortMovements = function () {
  const sortedMovements = sorted
    ? currentAccount.movements
    : currentAccount.movements.slice().sort((a, b) => a - b); 

  containerMovements.innerHTML = ''; 

  sortedMovements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${Math.abs(mov)}€</div>
      </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });

  sorted = !sorted;
};
btnSort.addEventListener('click', sortMovements);

 (labelTimer.value);
