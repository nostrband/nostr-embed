import { useState } from 'preact/hooks';
import CopyIcon from './icons/copyIcon.jsx';
import style from './style.css';

function CopyText({ iconClasses, displayText, copyText }) {
  const [btnClasses, setBtnClasses] = useState('linkCopyBtn');

  function copyToClipboard() {
    try {
      navigator.clipboard.writeText(copyText);
      setBtnClasses(`${btnClasses} green`);
      setTimeout(() => {
        setBtnClasses(btnClasses.replace('green', '').trim());
      }, 500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  return (
    <button class={btnClasses} onClick={() => copyToClipboard()}>
      <CopyIcon additionalClasses={iconClasses} />

      {displayText && <span class="displayText">{displayText}</span>}
      <span class="copyText">{copyText}</span>
    </button>
  );
}

export default CopyText;
