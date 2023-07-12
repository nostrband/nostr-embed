import { useState } from "preact/hooks";
import "./style.css";

function ProfileImage({ thumbnail, fullImage, isProfileImage = true }) {
  const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(thumbnail);

  const onError = () => {
    if (!isFullImageLoaded) {
      setImageSrc(fullImage);
      setIsFullImageLoaded(true);
    } else {
      setImageSrc(null);
    }
  };

  return imageSrc ? (
    <img className={isProfileImage ? "profileImg " : "followedProdileImg"
    } src={imageSrc} onError={onError} />
  ) : (
    <div class="profileWithoutImg" />
  );
}

export default ProfileImage;
