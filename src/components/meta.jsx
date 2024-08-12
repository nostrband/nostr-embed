import { formatZapAmount, getNoteId } from "../utils/common";
import CopyText from "./copyText.jsx";
import BoltIcon from "./icons/boltIcon.jsx";
import HeartIcon from "./icons/heartIcon.jsx";
import LinkIcon from "./icons/linkIcon.jsx";
import ReplyIcon from "./icons/replyIcon.jsx";
import RepostIcon from "./icons/repostIcon.jsx";

function Meta({
  note,
  profilesList,
  repliesCount,
  repostsCount,
  likesCount,
  zapAmount,
  options,
}) {
  let date, encodedId, formattedDate, formattedZapAmount;

  let createdAt = note
    ? note.created_at
    : profilesList
      ? profilesList.created_at
      : null;
  if (createdAt) {
    date = new Date(createdAt * 1000);
    formattedDate = date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (note && note.id) {
    encodedId = getNoteId(note.id);
  }
  if (profilesList) {
    encodedId = profilesList.id;
  }

  formattedZapAmount = formatZapAmount(zapAmount);

  return (
    <div className="cardMeta">
      <div className="cardDate">{formattedDate}</div>
      <hr />
      <div className="cardInteractions">
        {options.options?.hideCounters && <>
        {options && options.showZaps ? (
          <div className="interactionContainer" title="Total sats zapped">
            <BoltIcon additionalClasses="w-5 h-5" />
            <span className="zapAmount">{formattedZapAmount}</span>
          </div>
        ) : null}
        <div className="interactionContainer" title="Number of replies">
          <ReplyIcon additionalClasses="w-5 h-5" />
          <span className="repliesCount">{repliesCount}</span>
        </div>
        <div className="interactionContainer" title="Number of reposts">
          <RepostIcon additionalClasses="w-5 h-5" />
          <span className="repostsCount">{repostsCount}</span>
        </div>
        <div className="interactionContainer" title="Number of likes">
          <HeartIcon additionalClasses="w-5 h-5" />
          <span className="likesCount">{likesCount}</span>
        </div>
        </>}
        <div className="interactionContainer">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={
              note
                ? `https://nostr.band/${encodedId}`
                : `https://listr.lol/a/${profilesList.naddr}`
            }
            className="linkLink"
          >
            <LinkIcon additionalClasses="w-5 h-5 hover:text-gray-600" />
            <span className="displayText">Open</span>
          </a>
        </div>
        {options && options.showCopyAddr ? (
          <div className="interactionContainer">
            <CopyText
              iconClasses="w-5 h-5"
              displayText={note ? "Copy Note ID" : "Copy ID"}
              copyText={note ? note : profilesList.naddr}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Meta;
