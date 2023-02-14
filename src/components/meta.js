import { nip19 } from 'nostr-tools';
import HeartIcon from './icons/heartIcon';
import ReplyIcon from './icons/replyIcon';
import RepostIcon from './icons/repostIcon';
import LinkIcon from './icons/linkIcon';
import style from './style.css';
import CopyText from './copyText';

function Meta({ note, repliesCount, repostsCount, likesCount }) {
  let date, encodedNoteId, formattedDate;

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
    encodedNoteId = nip19.noteEncode(note.id);
  }

  return (
    <div class="cardMeta">
      <div class="cardDate">{formattedDate}</div>
      <hr />
      <div class="cardInteractions">
        <div class="interactionContainer">
          <ReplyIcon additionalClasses="w-5 h-5" />
          <span class="repliesCount">{repliesCount}</span>
        </div>
        <div class="interactionContainer">
          <RepostIcon additionalClasses="w-5 h-5" />
          <span class="repostsCount">{repostsCount}</span>
        </div>
        <div class="interactionContainer">
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
