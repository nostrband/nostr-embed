import BoltIcon from "../../components/icons/boltIcon.jsx";
import ProfileImage from "../../components/profileImage.jsx";
import {getNpub} from "../../utils/common";
import {formatDate} from "../../utils/formatDate";

export default function Zap({state}) {
  return (
    <div className="nostrEmbedCard">
      <div className="ne-grid ne-grid-cols-1 ne-gap-4 sm:ne-grid-cols-3 ne-justify-center ne-content-center">
        <Profile profile={ state.zap?.senderProfile }/>
        <div>
          <div className="ne-flex sm:ne-flex-col ne-items-center">
            <h3 className="ne-m-0 ne-text-2xl ne-mr-5 sm:ne-m-0">{ state.zapAmount }</h3>
            <span className="ne-flex ne-items-center ne-gap-2 ne-text-xl ne-font-bold ">
              <BoltIcon/>
              SATS
            </span>
          </div>
          <time className="ne-block sm:ne-inline-block">{ formatDate(state.event?.created_at) }</time>
        </div>
        <Profile profile={ state.zap?.recipientProfile }
                 isReverse={ true }/>
      </div>
    </div>
  )
}

function Profile({isReverse = false, profile}) {
  if (!profile) return
  const parsedProfile = JSON.parse(profile?.content)
  return (
    <a href={ `https://nostr.band/${ getNpub(profile?.pubkey) }` }
       target="_blank"
       rel="noopener noreferrer nofollow"
       className={ `ne-no-underline ne-text-black ne-flex ne-items-center ne-gap-4 ne-flex-row ${ isReverse ? 'sm:ne-flex-row-reverse' : '' }` }>
      <ProfileImage fullImage={ parsedProfile.picture }
                    thumbnail={ `https://media.nostr.band/thumbs/${ profile.pubkey.slice(-4) }/${ profile.pubkey }-picture-64` }
                    additionalClass="zapProfileImg"/>
      <span className="hover:ne-underline ne-text-xl ne-font-bold  hover:ne-decoration-solid">{ parsedProfile.display_name || parsedProfile.name }</span>
    </a>
  )
}
