import HeartIcon from './icons/heartIcon';
import ReplyIcon from './icons/replyIcon';
import RepostIcon from './icons/repostIcon';
import LinkIcon from './icons/linkIcon';
import CopyText from './copyText';
import { getNoteId } from '../common';
import style from './style.css';

function Meta({ note, repliesCount, repostsCount, likesCount, zapAmount }) {
  let date, encodedNoteId, formattedDate, formattedZapAmount;

  const formatZapAmount = (a) => {
    a /= 1000;
    if (a >= 1000000) return (Math.round(a / 100000) / 10) + "M";
    if (a >= 1000) return (Math.round(a / 100) / 10) + "K";
    return a;
  };
  
  if (note.id && note.created_at) {
    date = new Date(note.created_at * 1000);
    formattedDate = date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    encodedNoteId = getNoteId(note.id);
    formattedZapAmount = formatZapAmount(zapAmount);
  }

  return (
    <div class="cardMeta">
      <div class="cardDate">{formattedDate}</div>
      <hr />
      <div class="cardInteractions">
        <div class="interactionContainer" title="Amount of Zaps">
          <ReplyIcon additionalClasses="w-5 h-5" />
          <span class="zapAmount">{formattedZapAmount}</span>
        </div>
        <div class="interactionContainer" title="Number of replies">
          <ReplyIcon additionalClasses="w-5 h-5" />
          <span class="repliesCount">{repliesCount}</span>
        </div>
        <div class="interactionContainer" title="Number of reposts">
          <RepostIcon additionalClasses="w-5 h-5" />
          <span class="repostsCount">{repostsCount}</span>
        </div>
        <div class="interactionContainer" title="Number of likes">
          <HeartIcon additionalClasses="w-5 h-5" />
          <span class="likesCount">{likesCount}</span>
        </div>
        <div class="interactionContainer">
          <a href={`https://nostr.band/${encodedNoteId}`} class="linkLink">
            <LinkIcon additionalClasses="w-5 h-5 hover:text-gray-600" />
            <span class="displayText">Open</span>
          </a>
        </div>
        <div class="interactionContainer">
          <CopyText
            iconClasses="w-5 h-5"
            displayText="Copy Note ID"
            copyText={encodedNoteId}
          />
        </div>
      </div>
    </div>
  );
}

export default Meta;
