import ProfileMeta from "../../components/profileMeta.jsx";
import ProfileFollows from "../../components/profileFollows.jsx";
import ProfileComponent from '../../components/profile.jsx'

export default function Profile({state, props}) {
  return (
    <div className="nostrEmbedCard">
        <ProfileComponent
          profilePkey={state?.id}
          profile={state?.profile}
          options={props?.options}
        />
        <div
          className={
            state?.profile.error
              ? "cardContent ne-text-red-800"
              : "cardContent"
          }
        >
          {state?.profile?.website ? (
            <p>
              Website:{" "}
              <a
                href={state?.profile?.website}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {state?.profile?.website}
              </a>
            </p>
          ) : (
            ""
          )}
          {state?.profile?.about || "Loading..."}
        </div>
        {
          Boolean(state?.follows.length) && <ProfileFollows follows={state?.follows} options={props?.options} />
        }
        <ProfileMeta
          profile={state?.profile}
          followersCount={state?.followersCount}
          zapAmount={state?.zapAmount}
          options={props?.options}
        />
      </div>
  )
}
