import Profile from "../../components/profile.jsx";
import Meta from "../../components/meta.jsx";
import {KIND_CONTACT_LIST} from "../../config/config";

export default function ProfilesList({state, props}) {
  return (
    <div className="nostrEmbedCard">
      <Profile
        profilePkey={ state?.id.data.pubkey }
        profile={ state?.profile }
        options={ props?.options }
      />
      <div>
        <h3 className="cardTitle">
          { state?.kind !== KIND_CONTACT_LIST && state?.profilesList.name
            ? state?.profilesList.name
            : state?.profilesList.d }
          { state?.kind === KIND_CONTACT_LIST && "Following " }(
          { state?.taggedProfiles ? state?.countTaggedProfiles : 0 })
        </h3>
        { state?.kind !== KIND_CONTACT_LIST && (
          <p className="cardDescription">{ state?.profilesList.description }</p>
        ) }
        <div className="cardList">
          { Object.keys(state?.taggedProfiles).map((profilePkey) => {
            return (
              <div key={ profilePkey + "taggedProfile" }>
                <Profile
                  profilePkey={ profilePkey }
                  profile={ state?.taggedProfiles[profilePkey] }
                />
              </div>
            );
          }) }
          { state?.countTaggedProfiles > 0 &&
          state?.countTaggedProfiles >
          Object.keys(state?.taggedProfiles).length ? (
            <div className="diffProfiles">
              And { getDiff(state) } more profiles.
            </div>
          ) : null }
        </div>
        { state?.profilesList.error && (
          <div className="cardContent ne-text-red-800">
            { state?.profilesList.content }
          </div>
        ) }
      </div>
      <Meta
        profilesList={ state?.profilesList }
        likesCount={ state?.likesCount }
        repliesCount={ state?.repliesCount }
        repostsCount={ state?.repostsCount }
        zapAmount={ state?.zapAmount }
        options={ props?.options }
      />
    </div>
  )
}

function getDiff(state) {
  let diff;
  if (
    Object.keys(state?.taggedProfiles).length > 0 &&
    state?.countTaggedProfiles
  ) {
    diff =
      state?.countTaggedProfiles -
      Object.keys(state?.taggedProfiles).length;
  }
  return diff;
}
