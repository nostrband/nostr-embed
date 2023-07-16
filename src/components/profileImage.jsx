import {useState} from "preact/hooks";
import "./style.css";

function ProfileImage({thumbnail, fullImage, additionalClass = ''}) {
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
    <img className={ `profileImg ${ additionalClass }` }
         src={ imageSrc }
         onError={ onError }
         alt=""/>
  ) : (
    <div className="profileWithoutImg"/>
  );
}

export default ProfileImage;
