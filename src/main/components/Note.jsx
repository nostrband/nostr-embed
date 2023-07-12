import ProfileComponent from "../../components/profile.jsx";
import Meta from "../../components/meta.jsx";
import {formatContent} from "../../utils/formatContent";


export default function Note({state, props}) {
  return (
    <div className="nostrEmbedCard">
      <ProfileComponent
        profilePkey={ state?.profilePkey }
        profile={ state?.profile }
        options={ props?.options }
      />
      <div
        className={
          state?.event.error
            ? "cardContent ne-text-red-800"
            : "cardContent"
        }
      >
        { formatContent(state) }
      </div>
      <Meta
        note={ state?.event }
        likesCount={ state?.likesCount }
        repliesCount={ state?.repliesCount }
        repostsCount={ state?.repostsCount }
        zapAmount={ state?.zapAmount }
        options={ props?.options }
      />
    </div>
  );
}

