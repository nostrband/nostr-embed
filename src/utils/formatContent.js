import {formatNoteId, formatNpub, getNoteId, getNpub, parseNprofile, parseNpub} from "./common";
import {IMAGE_FILE_EXTENSIONS, VIDEO_FILE_EXTENSIONS, YOUTUBE_KEY_WORDS} from "../config/config";

export function formatContent(state) {
  if (!state?.event.content) return "";

  const formatEventLink = (noteOrNaddr) => {
    const label = formatNoteId(noteOrNaddr);
    return (
      <a
        target="_blank"
        rel="noopener noreferrer nofollow"
        href={ `https://nostr.band/${ noteOrNaddr }` }
      >
        { label }
      </a>
    );
  };

  const formatProfileLink = (npub, pubkey) => {
    let label = formatNpub(npub);
    if (pubkey in state?.taggedProfiles) {
      const tp = state?.taggedProfiles[pubkey];
      label = tp?.name || tp?.display_name || label;
    }
    return (
      <a
        target="_blank"
        rel="noopener noreferrer nofollow"
        href={ `https://nostr.band/${ npub }` }
      >
        @{ label }
      </a>
    );
  };

  const note = state?.event;

  const MentionRegex = /(#\[\d+\])/gi;

  // first - split by #[d] mentions
  const fragments = note.content.split(MentionRegex).map((match) => {
    const matchTag = match.match(/#\[(\d+)\]/);
    if (matchTag && matchTag.length === 2) {
      const idx = parseInt(matchTag[1]);
      if (idx < note.tags.length && note.tags[idx].length >= 2) {
        const ref = note.tags[idx];
        switch (ref[0]) {
          case "p": {
            return formatProfileLink(getNpub(ref[1]), ref[1]);
          }
          case "e": {
            return formatEventLink(getNoteId(ref[1]));
          }
          // not adding support for 'a' - too much code to format the naddr,
          // and this method is deprecated, so let's hope we won't need this
          case "t": {
            return (
              <a
                target="_blank"
                rel="noopener noreferrer nofollow"
                href={ `https://nostr.band/?q=%23${ ref[1] }` }
              >
                #{ ref[1] }
              </a>
            );
          }
        }
      }

      // unsupported #[d] ref
      return match;
    }

    // now try splitting by nostr: links
    return match.split(/(nostr:[a-z0-9]+)/gi).map((n) => {
      const matchNostr = n.match(/nostr:([a-z0-9]+)/);
      if (matchNostr && matchNostr.length === 2) {
        if (
          matchNostr[1].startsWith("note1") ||
          matchNostr[1].startsWith("nevent1") ||
          matchNostr[1].startsWith("naddr1")
        ) {
          return formatEventLink(matchNostr[1]);
        } else if (matchNostr[1].startsWith("npub1")) {
          const npub = matchNostr[1];
          const pubkey = parseNpub(matchNostr[1]);
          if (pubkey)
            return formatProfileLink(npub, pubkey);
        } else if (matchNostr[1].startsWith("nprofile1")) {
          const {type, data} = parseNprofile(matchNostr[1]);
          if (data) {
            const npub = getNpub(data.pubkey);
            return formatProfileLink(npub, data.pubkey);
          }
        }

        // unsupported or bad nostr: link
        return n;
      }

      // finally, split by urls
      const urlRegex =
        /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;
      return n.split(urlRegex).map((a) => {
        if (a.match(/^https?:\/\//)) {
          return formatLink(a);
        }
        return a;
      });
    });
  });

  return fragments;
}

function formatLink(a) {
  if (isVideo(a)) {
    return (
      <div className="cardContentMedia">
        <video src={ a }
               controls></video>
      </div>
    );
  } else if (isImage(a)) {
    return (
      <div className="cardContentMedia">
        <img className="cardContentImage"
             src={ a }
             alt=""></img>
      </div>
    );
  } else if (isYoutube(a)) {
    if (a.includes("/watch")) {
      a = a.replace("/watch", "/embed");
      a = a.replace("?v=", "/");
    }
    return (
      <div className="cardContentMedia">
        <iframe src={ a }></iframe>
      </div>
    );
  } else {
    return (
      <a target="_blank"
         rel="noopener noreferrer nofollow"
         href={ a }>
        { a }
      </a>
    );
  }
}

function isImage(a) {
  const link = splitLink(changeLinkRegister(a), 0);
  return isAnyEndWith(link, IMAGE_FILE_EXTENSIONS);
}

function isVideo(a) {
  const link = splitLink(changeLinkRegister(a), 0);
  return isAnyEndWith(link, VIDEO_FILE_EXTENSIONS);
}

function isYoutube(a) {
  const link = splitLink(changeLinkRegister(a), 0);
  return isAnyContains(link, YOUTUBE_KEY_WORDS);
}

function isAnyEndWith(link, extensions) {
  return extensions.some(function (extension) {
    return link.endsWith(extension);
  });
}

function isAnyContains(link, keyWords) {
  return keyWords.some(function (keyWord) {
    return link.includes(keyWord);
  });
}

function changeLinkRegister(a) {
  return a.toLowerCase();
}

function splitLink(link, elementNumber) {
  const linkArray = link.split("?");
  if (linkArray.length > elementNumber) {
    return linkArray[elementNumber];
  }
  return link;
}