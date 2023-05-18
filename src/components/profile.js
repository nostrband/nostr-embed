import { formatNpub, getNpub } from "../common";
import defaultProfile from "../default_profile.svg";
import CopyText from "./copyText";
import KeyIcon from "./icons/keyIcon";
import NostrichIcon from "./icons/nostrichIcon";
import ProfileImage from "./profileImage.js";

function Profile({ profilePkey, profile, showIcon }) {
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
          defaultImage={defaultProfile}
        />
      ) : null}
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

      {showIcon && (
        <div class="nostrichLink">
          <a
            target="_blank"
            rel="noopener noreferrer nofollow"
            href={`https://heynostr.com`}
            class="linkLink"
          >
            <NostrichIcon additionalClasses="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}

export default Profile;
