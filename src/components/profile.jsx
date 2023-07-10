import { formatNpub, getNpub } from "../common";
import CopyText from "./copyText.jsx";
import KeyIcon from "./icons/keyIcon.jsx";
import NostrichIcon from "./icons/nostrichIcon.jsx";
import ProfileImage from "./profileImage.jsx";

function Profile({ profilePkey, profile, options }) {
  let cachedProfilePicture, encodedProfilePkey, truncatedProfilePkey;
  if (profilePkey) {
    encodedProfilePkey = getNpub(profilePkey);
    truncatedProfilePkey = `${formatNpub(encodedProfilePkey)}`;
    cachedProfilePicture = `https://media.nostr.band/thumbs/${profilePkey.slice(
      -4
    )}/${profilePkey}-picture-64`;
  }

  return (
    <div class="cardProfile">
      {cachedProfilePicture && profile.picture ? (
        <ProfileImage
          thumbnail={cachedProfilePicture}
          fullImage={profile.picture}
        />
      ) : (
        <div class="profileWithoutImg" />
      )}
      <div class="profileDetails">
        <div class="profileName">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={`https://nostr.band/${encodedProfilePkey}`}
          >
            {profile.display_name || profile.name || "Loading..."}
          </a>
        </div>
        <div class="profilePkey">
          <KeyIcon additionalClasses="w-4 h-4" />
          <span class="pkey">{truncatedProfilePkey || "npub..."}</span>
          <CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
        </div>
      </div>

      {options && !options.hideNostrich ? (
        <div className="nostrichLink">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={`https://heynostr.com`}
            className="linkLink"
          >
            <NostrichIcon additionalClasses="w-4 h-4" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default Profile;
