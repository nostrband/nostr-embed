import { useState } from 'preact/hooks';
import CopyIcon from './icons/copyIcon';
import style from './style.css';

function CopyText({ iconClasses, displayText, copyText }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  function copyToClipboard() {
    try {
      navigator.clipboard.writeText(copyText);
      setTooltipVisible(true);
      setTimeout(() => {
        setTooltipVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  return (
    <button class="linkCopyBtn" onClick={copyToClipboard}>
      <CopyIcon additionalClasses={iconClasses} />

      {displayText && <span class="displayText">{displayText}</span>}
      <span class="copyText">{copyText}</span>
      {tooltipVisible && <span class="tooltip">Copied</span>}
    </button>
  );
}

export default CopyText;
