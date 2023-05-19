import { formatZapAmount, getNoteId } from "../common";
import CopyText from "./copyText";
import BoltIcon from "./icons/boltIcon";
import HeartIcon from "./icons/heartIcon";
import LinkIcon from "./icons/linkIcon";
import ReplyIcon from "./icons/replyIcon";
import RepostIcon from "./icons/repostIcon";

function Meta({
  note,
  profilesList,
  repliesCount,
  repostsCount,
  likesCount,
  zapAmount,
  options,
  id,
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
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
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
    <div class="cardMeta">
      <div class="cardDate">{formattedDate}</div>
      <hr />
      <div class="cardInteractions">
        {options && options.showZaps ? (
          <div className="interactionContainer" title="Total sats zapped">
            <BoltIcon additionalClasses="w-5 h-5" />
            <span className="zapAmount">{formattedZapAmount}</span>
          </div>
        ) : null}
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
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={
              note
                ? `https://nostr.band/${encodedId}`
                : `https://listr.lol/a/${id}`
            }
            class="linkLink"
          >
            <LinkIcon additionalClasses="w-5 h-5 hover:text-gray-600" />
            <span class="displayText">Open</span>
          </a>
        </div>
        {options && options.showCopyAddr ? (
          <div className="interactionContainer">
            <CopyText
              iconClasses="w-5 h-5"
              displayText={note ? "Copy Note ID" : "Copy ID"}
              copyText={note ? note : id}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Meta;
