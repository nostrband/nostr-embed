import { formatNpub, getNpub } from "../utils/common";
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
    <div className="cardProfile">
      {cachedProfilePicture && profile.picture ? (
        <ProfileImage
          thumbnail={cachedProfilePicture}
          fullImage={profile.picture}
        />
      ) : (
        <div className="profileWithoutImg" />
      )}
      <div className="profileDetails">
        <div className="profileName">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={`https://nostr.band/${encodedProfilePkey}`}
          >
            {profile?.display_name || profile?.name || "Loading..."}
          </a>
        </div>
        <div className="profilePkey">
          <KeyIcon additionalClasses="w-4 h-4" />
          <span className="pkey">{truncatedProfilePkey || "npub..."}</span>
          <CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
        </div>
      </div>

      {options && !options.hideNostrich ? (
        <div className="nostrichLink">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={`https://njump.me`}
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
