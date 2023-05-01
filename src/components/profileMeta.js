import FollowersIcon from './icons/followersIcon';
import LinkIcon from './icons/linkIcon';
import BoltIcon from './icons/boltIcon';
import CopyText from './copyText';
import { getNpub, formatZapAmount } from '../common';
import style from './style.css';

function ProfileMeta({ profile, followersCount, zapAmount }) {
  let npub, formattedZapAmount;

  if (profile && profile.pubkey) {
    npub = getNpub(profile.pubkey);
    formattedZapAmount = formatZapAmount(zapAmount);
  }

  return (
    <div class="cardMeta">
      <hr />
      <div class="cardInteractions">
        <div class="interactionContainer" title="Total sats zapped">
          <BoltIcon additionalClasses="w-5 h-5" />
          <span class="zapAmount">{formattedZapAmount}</span>
        </div>
        <div class="interactionContainer" title="Number of followers">
          <FollowersIcon additionalClasses="w-5 h-5" />
          <span class="followersCount">{followersCount}</span>
        </div>
        <div class="interactionContainer">
          <a target="_blank" rel="noopener noreferrer nofollow" href={`https://nostr.band/${npub}`}
              class="linkLink">
            <LinkIcon additionalClasses="w-5 h-5 hover:text-gray-600" />
            <span class="displayText">Open</span>
          </a>
        </div>
        <div class="interactionContainer">
          <CopyText
            iconClasses="w-5 h-5"
            displayText="Copy Npub"
            copyText={npub}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileMeta;
