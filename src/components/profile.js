import KeyIcon from './icons/keyIcon';
import CopyText from './copyText';
import { getNpub } from '../common';
import style from './style.css';

function Profile({ profilePkey, profile }) {
  let cachedProfilePicture, encodedProfilePkey, truncatedProfilePkey;
  if (profilePkey && profile) {
    encodedProfilePkey = getNpub(profilePkey);
    truncatedProfilePkey = `${encodedProfilePkey.slice(
      0,
      13
    )}...${encodedProfilePkey.slice(-6)}`;
    cachedProfilePicture = `https://media.nostr.band/thumbs/${profilePkey.slice(
      -4
    )}/${profilePkey}-picture-64`;
  }

  return (
    <div class="cardProfile">
      <img
        class="profileImg"
        src={
          cachedProfilePicture || 'https://via.placeholder.com/48?text=Loading'
        }
      />
      <div class="profileDetails">
        <div class="profileName">{profile.display_name || 'Loading...'}</div>
        <div class="profilePkey">
          <KeyIcon additionalClasses="w-4 h-4" />
          <span class="pkey">{truncatedProfilePkey || 'npub...'}</span>
          <CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
