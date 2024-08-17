import { formatZapAmount, getNpub } from "../utils/common";
import CopyText from "./copyText.jsx";
import BoltIcon from "./icons/boltIcon.jsx";
import FollowersIcon from "./icons/followersIcon.jsx";
import LinkIcon from "./icons/linkIcon.jsx";

function ProfileMeta({ profile, followersCount, zapAmount, options }) {
  let npub, formattedZapAmount;

  if (profile && profile.pubkey) {
    npub = getNpub(profile.pubkey);
    formattedZapAmount = formatZapAmount(zapAmount);
  }

  return (
    <div className="cardMeta">
      <hr />
      <div className="cardInteractions">
        {options?.hideCounters ? null : <>
        {options && options.showZaps ? (
          <div className="interactionContainer" title="Total sats zapped">
            <BoltIcon additionalClasses="w-5 h-5" />
            <span className="zapAmount">{formattedZapAmount}</span>
          </div>
        ) : null}
        <div className="interactionContainer" title="Number of followers">
          <FollowersIcon additionalClasses="w-5 h-5" />
          <span className="followersCount">{followersCount}</span>
        </div>
        </>}
        <div className="interactionContainer">
          <a target="_blank" rel="noopener noreferrer nofollow" href={`https://nostr.band/${npub}`}
            className="linkLink">
            <LinkIcon additionalClasses="w-5 h-5 hover:text-gray-600" />
            <span className="displayText">Open</span>
          </a>
        </div>
        {options && options.showCopyAddr ? (
          <div className="interactionContainer">
            <CopyText
              iconClasses="w-5 h-5"
              displayText="Copy Npub"
              copyText={npub}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ProfileMeta;
