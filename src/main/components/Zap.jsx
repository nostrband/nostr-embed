import CopyText from "../../components/copyText.jsx";
import BoltIcon from "../../components/icons/boltIcon.jsx";
import KeyIcon from "../../components/icons/keyIcon.jsx";
import ProfileImage from "../../components/profileImage.jsx";
import {formatNpub, getNpub} from "../../utils/common";
// import {formatDate} from "../../utils/formatDate";

export default function Zap({state}) {
  const profile = state.zap?.senderProfile;

  return (
    <div className="nostrEmbedCard">
      <div className="ne-flex ne-flex-col ne-gap-2">
        <Profile profile={ profile } profilePkey={profile?.pubkey}/>
        <div className="ne-flex ne-items-center ne-gap-2 ne-text-xl ne-justify-center">
        <BoltIcon/>
        <p className="ne-m-0 ne-text-2xl ne-mr-5 sm:ne-m-0">{ state.zap?.amount }</p>
        </div>
          <div>{state.zap?.content}</div>
          <div className={state.zap?.targetEvent ? "ne-flex ne-items-center ne-justify-between" : ""}> 
          {state.zap?.targetEvent && (
            <div className="ne-justify-self-center">{state.zap?.targetEvent.content}</div>
          )}
          <Profile profile={ state.zap?.recipientProfile } isReverse={ true }/>
          </div>
        <hr />
        <Profile profile={ state.zap?.providerProfile } isReverse={ true } size={'xs'}/>
      </div>
      {/* <time className="ne-block sm:ne-inline-block">{ formatDate(state.event?.created_at) }</time> */}
    </div>
  )
}

function Profile({isReverse = false, profile, profilePkey, size='xl'}) {
  if (!profile) return
  let cachedProfilePicture, encodedProfilePkey, truncatedProfilePkey;
  if (profilePkey) {
    encodedProfilePkey = getNpub(profilePkey);
    truncatedProfilePkey = `${formatNpub(encodedProfilePkey)}`;
    cachedProfilePicture = `https://media.nostr.band/thumbs/${profilePkey.slice(
      -4
    )}/${profilePkey}-picture-64`;
  }
  const parsedProfile = JSON.parse(profile?.content)
  return (
    <a href={ `https://nostr.band/${ getNpub(profile?.pubkey) }` }
       target="_blank"
       rel="noopener noreferrer nofollow"
       className={ `ne-no-underline ne-text-black ne-flex ne-items-center ne-gap-4 ne-flex-row ${ isReverse ? 'sm:ne-flex-row-reverse ' : '' }` }>
      <ProfileImage fullImage={ parsedProfile.picture }
                    thumbnail={ `https://media.nostr.band/thumbs/${ profile.pubkey.slice(-4) }/${ profile.pubkey }-picture-64` }
                    additionalClass="zapProfileImg"/>
   <div>
      <span className={`hover:ne-underline ne-text-${size} ne-font-bold  hover:ne-decoration-solid`}>{ parsedProfile.display_name || parsedProfile.name }</span>
      <div className="profilePkey">
          <KeyIcon additionalClasses="w-4 h-4" />
          <span className={`pkey ne-text-${size}`}>{truncatedProfilePkey || "npub..."}</span>
          <CopyText iconClasses="w-4 h-4" copyText={encodedProfilePkey} />
        </div>
   </div>
    </a>
  )
}
