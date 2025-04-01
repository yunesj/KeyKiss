import * as openpgp from './vendor/openpgp.mjs';

document.getElementById('encrypt-tab').addEventListener('click', () => showPage('encrypt'));
document.getElementById('decrypt-tab').addEventListener('click', () => showPage('decrypt'));

function showPage(page) {
  document.getElementById('encrypt-tab').classList.toggle('active', page === 'encrypt');
  document.getElementById('decrypt-tab').classList.toggle('active', page === 'decrypt');

if (page === 'encrypt') {
    document.getElementById('crypto-app').dataset.mode = 'encrypt';
    document.querySelector('#crypto-app > h2').textContent = 'Encrypt a Message';
    document.getElementById('input-message').placeholder = 'Enter your message...';
    document.querySelector('#crypto-app .action-button').textContent = '🔐 Encrypt'

    // if (document.getElementById('result').dataset.kind === 'plain text') {
    //   document.getElementById('input-message').value = document.getElementById('result').textContent;
    // }
  } else {
    document.getElementById('crypto-app').dataset.mode = 'decrypt';
    document.querySelector('#crypto-app > h2').textContent = 'Decrypt a Message';
    document.getElementById('input-message').placeholder = '-----BEGIN PGP MESSAGE-----\n...\n...\n...\n...\n-----END PGP MESSAGE-----';
    document.querySelector('#crypto-app .action-button').textContent = '🔓 Decrypt';

    // if (document.getElementById('result').dataset.kind === 'encrypted') {
    //   document.getElementById('input-message').value = document.getElementById('result').textContent;
    // }
  }
  
  window.location.hash = page;
}

window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '') || 'encrypt';
  showPage(hash);
  
  // Restore state for password field
  const showPasswordCheckbox = document.getElementById('show-password');
  const passwordInput = document.getElementById('password');
  
  if (showPasswordCheckbox.checked) {
    passwordInput.type = 'text';
  }
});

document.getElementById('input-message').addEventListener('input', clearResult);
document.getElementById('password').addEventListener('input', clearResult);

function clearResult() {
  document.getElementById('result').textContent = '';
}

document.getElementById('show-password').addEventListener('change', (e) => {
  const passwordInput = document.getElementById('password');
  passwordInput.type = e.target.checked ? 'text' : 'password';
});

document.querySelector('#crypto-app > form').addEventListener('submit', (event) => {
  event.preventDefault();
  handleCryption();
});

document.getElementById('action-button').addEventListener('click', async (event) => {
  handleCryption();
  
  // Remove focus after clicking
  event.target.blur();
});

const donationModal = document.getElementById('donation-modal');
donationModal.style.display = 'none';
document.getElementById('donate-btn').addEventListener('click', async (event) => {
  donationModal.style.display = 'flex';
});
donationModal.querySelector('.close-btn').addEventListener('click', async (event) => {
  donationModal.style.display = 'none';
});
// Close modal whenever it is clicked on (and visible)
window.addEventListener('click', (e) => {
  if (e.target === donationModal) {
    donationModal.style.display = 'none';
  }
});

async function handleCryption()  {
  const message = document.getElementById('input-message').value;
  const password = document.getElementById('password').value;
  
  if (!password) {
    alert('Please enter a password.');
    return;
  }
  
  let isEncrypting = document.getElementById('crypto-app').dataset.mode === 'encrypt';
  let result;
  if (isEncrypting) {
    try {
      const options = {
        message: await openpgp.createMessage({ text: message }),
        passwords: [password],
        format: 'armored'
      };
      result = await openpgp.encrypt(options);
      document.getElementById('result').dataset.kind = 'encrypted';
    } catch (error) {
      alert('Encryption failed: ' + error.message);
    }
    
  } else {
    try {
      const options = {
        message: await openpgp.readMessage({ armoredMessage: message }),
        passwords: [password],
        format: 'utf8'
      };
      result = (await openpgp.decrypt(options)).data;
      document.getElementById('result').dataset.kind = 'plain text';
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    }
  }
  document.getElementById('result').textContent = result;
}

document.getElementById('copy-button').addEventListener('click', async () => {
  const textArea = document.getElementById('result');

  try {
    await navigator.clipboard.writeText(textArea.value || textArea.textContent);
    const copyBtn = document.getElementById('copy-button');
    copyBtn.textContent = '✅ Copied!';
    
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
});
