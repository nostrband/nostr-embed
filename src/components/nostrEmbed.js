import { Component } from 'preact';
import * as secp from '@noble/secp256k1';
import Profile from './profile';
import Meta from './meta';
import style from './style.css';
import { decode } from 'light-bolt11-decoder'
import { getNpub, getNoteId, formatNpub, formatNoteId } from '../common';

class NosrtEmbed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noteId: props.noteId,
      relay: props.relay,
      note: {},
      profile: {},
      taggedProfiles: {},
      profilePkey: '',
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      zapAmount: 0,
    };
  }

  sha256(string) {
    const utf8 = new TextEncoder().encode(string);
    return secp.utils.sha256(utf8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    });
  }

  async getNostrEventID(m) {
    const a = [0, m.pubkey, m.created_at, m.kind, m.tags, m.content];
    const s = JSON.stringify(a);
    const h = await this.sha256(s);
    return h;
  }

  verifyNostrSignature(event) {
    return secp.schnorr.verify(event.sig, event.id, event.pubkey);
  }

  async validateNostrEvent(event) {
    if (event.id !== (await this.getNostrEventID(event))) return false;
    if (typeof event.content !== 'string') return false;
    if (typeof event.created_at !== 'number') return false;

    if (!Array.isArray(event.tags)) return false;
    for (let i = 0; i < event.tags.length; i++) {
      let tag = event.tags[i];
      if (!Array.isArray(tag)) return false;
      for (let j = 0; j < tag.length; j++) {
        if (typeof tag[j] === 'object') return false;
      }
    }

    return true;
  }

  async isValidEvent(ev) {
    return (
      ev.id &&
      ev.pubkey &&
      ev.sig &&
      (await this.validateNostrEvent(ev)) &&
      this.verifyNostrSignature(ev)
    );
  }

  componentDidMount() {

    const start = (socket) => {
      this.fetchNote({ socket });
    };

    if (!window.__nostrEmbed) window.__nostrEmbed = {sockets: {}};

    let socket = null;
    if (this.state.relay in window.__nostrEmbed.sockets)
    {
      socket = window.__nostrEmbed.sockets[this.state.relay];
      if (socket.readyState == 1) // open
	start(socket);
      else if (socket.readyState == 0) // connecting
	socket.starts.push(start);
      else
	socket = null;
    }

    if (socket) return;

    socket = new WebSocket(this.state.relay);
    window.__nostrEmbed.sockets[this.state.relay] = socket;

    socket.starts = [start];

    socket.onopen = () => {
      console.log(`Connected to Nostr relay: ${socket.url}`);
      for (const s of socket.starts)
	s(socket);
      socket.starts = null;
    };

    socket.onerror = () => {
      console.log(`Failed to connect to Nostr relay: ${socket.url}`);
    };

    const subs = {};
    socket.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (!d || !d.length) throw 'Bad reply from relay';

        if (d[0] == 'NOTICE' && d.length == 2) {
          console.log('notice from', socket.url, d[1]);
          return;
        }

        if (d[0] == 'EOSE' && d.length > 1) {
          if (d[1] in subs) subs[d[1]].on_event(null);
          return;
        }

        if (d[0] != 'EVENT' || d.length < 3) throw 'Unknown reply from relay';

        if (d[1] in subs) subs[d[1]].on_event(d[2]);
      } catch (error) {
        console.log('relay', socket.url, 'bad message', e, 'error', error);
        err(error);
      }
    };

    socket.listEvents = ({ sub, ok, err }) => {
      let id = 'embed-' + Math.random();
      const req = ['REQ', id, sub];
      socket.send(JSON.stringify(req));

      const close = () => {
        const sub_id = id;
        id = null;
        socket.send(JSON.stringify(['CLOSE', sub_id]));
        delete subs[sub_id];
      };

      const events = [];
      const queue = [];

      const done = () => {
        if (!id) return;
        clearTimeout(to);
        close();
        ok(events);
      };

      const to = setTimeout(
        function () {
          // tell relay we're no longer interested
          close();

          // maybe relay w/o EOSE support?
          if (events.length || queue.length) {
            on_event(null);
          } else {
            err('timeout on relay', socket.url);
          }
        },
        sub.limit && sub.limit == 1 ? 2000 : 4000
      );

      const on_event = async (e) => {
        queue.push(e);
        if (queue.length > 1) return;
        while (queue.length) {
          e = queue[0];
          if (e && (await this.isValidEvent(e))) events.push(e);
          queue.shift(); // dequeue after we've awaited
          if (!e || (sub.limit && sub.limit == events.length)) {
            queue.splice(0, queue.length);
            done();
            break;
          }
        }
      };

      subs[id] = { ok, err, on_event };
    };
  }

  getEvent({ socket, sub, ok, err }) {
    return new Promise((ok, err) => {
      sub.limit = 1;
      socket.listEvents({
        sub,
        ok: (events) => {
          ok(events ? events[0] : null);
        },
        err,
      });
    });
  }

  listEvents({ socket, sub }) {
    return new Promise((ok, err) => {
      socket.listEvents({ sub, ok, err });
    });
  }

  fetchNote({ socket }) {
    const sub = { ids: [this.state.noteId], kinds: [1] };
    this.getEvent({ socket, sub })
      .then((event) => {
        if (event) {
          this.setState({
            note: event,
            profilePkey: event.pubkey,
          });
          this.fetchProfile({ socket, profilePkey: event.pubkey });
          this.fetchMeta({ socket, noteId: this.state.noteId });
          this.fetchTags({ socket, tags: event.tags });
        } else {
          console.log("Error: We can't find that note on this relay");
          this.setState({
            note: {
              error: true,
              content:
                "Sorry, we weren't able to find this note on the specified relay.",
            },
          });
        }
      })
      .catch((error) => {
        console.log(`Error fetching note: ${error}`);
        this.setState({
          note: {
            error: true,
            content:
              "Sorry, there was an error fetching this note from the specified relay. Most often, this is because the relay isn't responding.",
          },
        });
      });
  }

  fetchProfile({ socket, profilePkey }) {
    const sub = { kinds: [0], authors: [profilePkey] };
    this.getEvent({ socket, sub })
      .then((event) => {
        if (event) {
	  try {
            let parsedProfile = JSON.parse(event.content);
            this.setState({ profile: parsedProfile });
	  } catch (e) {
	    console.log("Error bad event content", e, event.content);
	  }
        }
      })
      .catch((error) => {
        console.log(`Error fetching profile: ${error}`);
      });
  }

  fetchTags({ socket, tags }) {
    const sub = { kinds: [0], authors: [] };
    for (const t of tags) {
      if (t.length >= 2 && t[0] == "p") {
	sub.authors.push(t[1]);
      }
    }
    if (!sub.authors.length)
      return;

    this.listEvents({ socket, sub })
      .then((events) => {
	const taggedProfiles = {};
	for (const event of events) {
	  try {
            let p = JSON.parse(event.content);
	    taggedProfiles[event.pubkey] = p;
	  } catch (e) {
	    console.log("Error bad event content", e, event.content);
	  }
	}
        this.setState({ taggedProfiles });
      })
      .catch((error) => {
        console.log(`Error fetching tagged profiles: ${error}`);
      });
  }

  getZapAmount(e) {
    try {
      for (const t of e.tags) {
	if (t.length >= 2 && t[0] == "bolt11") {
	  const b = decode(t[1]);
	  for (const s of b.sections) {
	    if (s.name == "amount")
	      return parseInt(s.value);
	  }
	  break;
	}
      }
    } catch (er) {
      console.log("Error bad zap", er, e);
    }
    return 0;
  }
  
  fetchMeta({ socket, noteId }) {
    const sub = { kinds: [1, 6, 7, 9735], '#e': [noteId] };
    this.listEvents({ socket, sub }).then((events) => {
      for (let noteEvent of events) {
        switch (noteEvent['kind']) {
          case 6:
            this.setState((state) => ({
              repostsCount: state.repostsCount + 1,
            }));
            break;
          case 7:
            this.setState((state) => ({
              likesCount: state.likesCount + 1,
            }));
            break;
          case 1:
            this.setState((state) => ({
              repliesCount: state.repliesCount + 1,
            }));
            break;
          case 9735:
            this.setState((state) => ({
              zapAmount: state.zapAmount + this.getZapAmount(noteEvent),
            }));
            break;
          default:
            console.log('Unknown note kind');
        }
      }
    });
  }

  formatLink(a) {
    if (this.isVideo(a)) {
      return (
          <div class='cardContentMedia'>
            <video src={a} controls></video>
          </div>
      )
    } else if (this.isImage(a)) {
      return (
        <div className="cardContentMedia">
          <img className="cardContentImage" src={a} alt=""></img>
        </div>)
    } else if (this.isYoutube(a)) {
      if (a.includes('/watch')) {
        a = a.replace('/watch', '/embed')
        a = a.replace('?v=', '/')
      }
      return (
          <div className='cardContentMedia'>
            <iframe src={a}></iframe>
          </div>)
    } else {
      return (
          <a target="_blank" rel="noopener noreferrer nofollow" href={a}>{a}</a>
      )
    }
  }

  isImage(a) {
    return a.endsWith('jpg') || a.endsWith('jpeg') || a.endsWith('png') ||  a.endsWith('webp') || a.endsWith('gif') ;
  }

  isVideo(a) {
    return a.endsWith('mov');
  }

  isYoutube(a) {
    return a.includes('youtube')
  }

  formatContent() {
    if (!this.state.note.content) return "";

    const MentionRegex = /(#\[\d+\])/gi;

    const note = this.state.note;
    const fragments = note.content.split(MentionRegex).map(match => {
      const matchTag = match.match(/#\[(\d+)\]/);
      if (matchTag && matchTag.length === 2) {
        const idx = parseInt(matchTag[1]);
	if (idx < note.tags.length && note.tags[idx].length >= 2) {
          const ref = note.tags[idx];
          switch (ref[0]) {
          case "p": {
	    const npub = getNpub(ref[1]);
	    let label = formatNpub(npub);
	    if (ref[1] in this.state.taggedProfiles) {
	      const tp = this.state.taggedProfiles[ref[1]];
	      label = tp?.name || tp?.display_name || label;
	    }
            return (
		<a target="_blank" rel="noopener noreferrer nofollow"
	          href={`https://nostr.band/${npub}`}>@{label}</a>
	    )
          }
          case "e": {
	    const noteId = getNoteId(ref[1]);
	    const label = formatNoteId(noteId);
            return (
		<a target="_blank" rel="noopener noreferrer nofollow"
	          href={`https://nostr.band/${noteId}`}>{label}</a>
	    )
          }
          case "t": {
            return (
		<a target="_blank" rel="noopener noreferrer nofollow"
	          href={`https://nostr.band/?q=%23${ref[1]}`}>#{ref[1]}</a>
	    )
          }
	  }
	}
      } else {
	const urlRegex =
	      /((?:http|ftp|https):\/\/(?:[\w+?.\w+])+(?:[a-zA-Z0-9~!@#$%^&*()_\-=+\\/?.:;',]*)?(?:[-A-Za-z0-9+&@#/%=~_|]))/i;

	return match.split(urlRegex).map(a => {
          if (a.match(/^https?:\/\//)) {
            return this.formatLink(a)
          }
          return a;
	});
      }
      return match;
    });

    return fragments;
  }

  render() {
    return (
      <div class="nostrEmbedCard">
        <Profile
          profilePkey={this.state.profilePkey}
          profile={this.state.profile}
        />
        <div
          class={
            this.state.note.error
              ? 'cardContent ne-text-red-800'
              : 'cardContent'
          }
        >
          {this.formatContent()}
        </div>
        <Meta
          note={this.state.note}
          likesCount={this.state.likesCount}
          repliesCount={this.state.repliesCount}
          repostsCount={this.state.repostsCount}
          zapAmount={this.state.zapAmount}
        />
      </div>
    );
  }
}

export default NosrtEmbed;
