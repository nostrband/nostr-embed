import { nip19 } from 'nostr-tools';
import KeyIcon from './icons/keyIcon';
import style from './style.css';
import CopyText from './copyText';

function Profile({ profilePkey, profile }) {
  let cachedProfilePicture, encodedProfilePkey;
  if (profilePkey && profile) {
    encodedProfilePkey = nip19.npubEncode(profilePkey);
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
          <span class="pkey">{encodedProfilePkey || 'npub...'}</span>
          <CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
        </div>
      </div>
    </div>
  );
}

export default Profile;
