import {getNpub} from "../utils/common";
import ProfileImage from "./profileImage.jsx";

const ProfileFollows = ({follows = [], options}) => {
  if (!options?.showFollowing) return <></>

  const getCachedImage = (pubkey) => {
    return `https://media.nostr.band/thumbs/${ pubkey.slice(-4) }/${ pubkey }-picture-64`
  }

  const parsedFollows = follows.slice(0, 10).map(follow => {
    const content = JSON.parse(follow.content)
    return {
      id: follow?.id,
      npubLink: `https://nostr.band/${ getNpub(follow?.pubkey) }`,
      display_name: content?.display_name,
      picture: content?.picture,
      cachedImage: getCachedImage(follow?.pubkey),
      name: content?.name
    }
  })

  const filterProfiles = parsedFollows.filter(profile => profile.name && profile.display_name)

  return (
    <div>
      <hr/>
      <div className="ne-flex ne-gap-6 ne-flex-wrap ne-items-center ne-mt-8">
        <ul className="ne-list-none ne-p-0 ne-flex ne-ms-[25px] ne-m-0 ne-items-center">
          {
            parsedFollows.map(follow => {
              return (
                <li key={ follow?.id }>
                  <a className="ne-inline-block"
                     rel="noopener noreferrer nofollow"
                     target="_blank"
                     href={ follow.npubLink }>
                    <ProfileImage
                      fullImage={ follow?.picture }
                      thumbnail={ follow?.cachedImage }
                      additionalClass="followedProfileImg"/>
                  </a>
                </li>
              )
            })
          }
        </ul>
        <div>
          <h2 className="ne-m-0 ne-font-bold ne-text-lg">
            Follows { follows.length } profiles
          </h2>
          <div className="ne-m-0 ne-text-sm">
            Including { " " }
            <a rel="noopener noreferrer nofollow"
               target="_blank"
               className="ne-text-black"
               href={ filterProfiles[0]?.npubLink }>{ filterProfiles[0]?.display_name }</a>
            { filterProfiles[1] ? ', ' : '' }
            <a rel="noopener noreferrer nofollow"
               target="_blank"
               className="ne-text-black"
               href={ filterProfiles[1]?.npubLink }>{ filterProfiles[1]?.display_name }</a>
            { filterProfiles[2] ? ' and ' : '' }
            <a rel="noopener noreferrer nofollow"
               target="_blank"
               className="ne-text-black"
               href={ filterProfiles[2]?.npubLink }>{ filterProfiles[2]?.display_name }</a>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileFollows